import { sendWhatsAppTemplate, normalizeWhatsAppNumber } from "./provider";

function renderTemplateBody(bodyText, params) {
  return params.reduce((text, value, i) => text.replaceAll(`{{${i + 1}}}`, String(value ?? "")), bodyText || "");
}

// Single reusable send-and-log entry point for every WhatsApp send in this codebase —
// enquiry confirmation, quotation, follow-up automation, and campaigns all call this
// directly with a different `purpose`/`messageType`/`params`, rather than each having
// its own copy of the lookup-send-log sequence.
//
// Looks up the active template for `purpose`, calls the Cloud API, and inserts exactly
// one whatsapp_messages row reflecting the *actual* provider outcome — status is only
// ever 'sent' when sendWhatsAppTemplate() returned a confirmed provider message id, per
// the project rule that a send is never reported as successful before the provider
// confirms it. A missing/inactive template or a provider failure both still produce a
// 'failed' row, so message history is complete even for attempts that never reached
// the API.
//
// `params` must be an ordered array matching the template's own {{1}}, {{2}}, ...
// placeholders. This function has no knowledge of what the values mean — the caller
// (one call site per purpose) is responsible for building that order correctly for
// whichever template it's targeting.
//
// `supabase` is passed in rather than constructed here because the right client
// differs by call site: the service-role admin client for the public enquiry route (no
// staff session exists), the authenticated per-request client for staff-triggered
// sends (quotation, campaigns — RLS then applies via whatsapp_messages_insert_scoped),
// and the service-role client again for the cron follow-up job.
export async function sendWhatsAppMessage({
  supabase,
  leadId,
  customerId,
  toPhone,
  purpose,
  messageType,
  params = [],
  quotationId = null,
  campaignId = null,
  sentBy = null,
}) {
  const normalizedTo = normalizeWhatsAppNumber(toPhone) || String(toPhone || "");

  // Consent is enforced here, not just at the campaign/follow-up call sites, so an
  // opted-out customer can never receive a WhatsApp send through any path (quotation,
  // enquiry confirmation, campaign, or follow-up) — matches master plan §6/§14's "a
  // contact who is not eligible for WhatsApp messaging must not receive automated
  // messages." Follow-up automation additionally excludes opted-out leads at the
  // eligibility-query level (belt and suspenders, not a substitute for this check).
  if (customerId) {
    const { data: customer } = await supabase
      .from("customers")
      .select("whatsapp_opt_out")
      .eq("id", customerId)
      .maybeSingle();
    if (customer?.whatsapp_opt_out) {
      const error = "Customer has opted out of WhatsApp messages.";
      await supabase.from("whatsapp_messages").insert({
        lead_id: leadId,
        customer_id: customerId,
        quotation_id: quotationId,
        campaign_id: campaignId,
        message_type: messageType,
        to_phone: normalizedTo,
        status: "failed",
        error_message: error,
        sent_by: sentBy,
        failed_at: new Date().toISOString(),
      });
      return { success: false, error };
    }
  }

  const { data: template, error: templateError } = await supabase
    .from("whatsapp_templates")
    .select("id, provider_template_name, language, body_text")
    .eq("purpose", purpose)
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (templateError || !template) {
    const error = templateError?.message || `No active WhatsApp template configured for "${purpose}".`;
    await supabase.from("whatsapp_messages").insert({
      lead_id: leadId,
      customer_id: customerId,
      quotation_id: quotationId,
      campaign_id: campaignId,
      message_type: messageType,
      to_phone: normalizedTo,
      status: "failed",
      error_message: error,
      sent_by: sentBy,
      failed_at: new Date().toISOString(),
    });
    return { success: false, error };
  }

  const result = await sendWhatsAppTemplate({
    to: toPhone,
    templateName: template.provider_template_name,
    languageCode: template.language,
    bodyParams: params,
  });

  const now = new Date().toISOString();
  const { data: inserted, error: insertError } = await supabase
    .from("whatsapp_messages")
    .insert({
      lead_id: leadId,
      customer_id: customerId,
      quotation_id: quotationId,
      campaign_id: campaignId,
      template_id: template.id,
      message_type: messageType,
      to_phone: normalizedTo,
      body: renderTemplateBody(template.body_text, params),
      template_params: params,
      provider_message_id: result.success ? result.providerMessageId : null,
      status: result.success ? "sent" : "failed",
      error_message: result.success ? null : result.error,
      sent_by: sentBy,
      sent_at: result.success ? now : null,
      failed_at: result.success ? null : now,
    })
    .select("id")
    .single();

  if (insertError) {
    // eslint-disable-next-line no-console
    console.error("[whatsapp] failed to log message:", insertError.message);
  }

  return { success: result.success, error: result.success ? null : result.error, messageId: inserted?.id };
}
