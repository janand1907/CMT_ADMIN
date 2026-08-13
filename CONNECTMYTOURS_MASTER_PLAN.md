# ConnectMyTours --- CMS + CRM Master Plan

## 1. Project Vision

ConnectMyTours will evolve from the current static travel website into a
complete travel-business platform while preserving the existing public
website design and functionality.

### Target Platform

-   Public Travel Website
-   Admin CMS
-   CRM / Lead Management
-   Customer Management
-   Package & Destination Management
-   Quotation Management
-   WhatsApp Communication & Automation
-   Content Management
-   SEO Management
-   Marketing Management
-   Reports & Analytics
-   User Roles & Permissions

### Core Technology Direction

-   **Frontend / Full-stack:** Next.js
-   **Runtime:** Node.js 22.x
-   **Database:** Supabase PostgreSQL
-   **Authentication:** Supabase Auth
-   **Storage:** Supabase Storage initially
-   **Hosting:** Existing Hostinger Business Web Hosting
-   **Deployment:** GitHub → Hostinger Auto Deployment
-   **Automation:** Hostinger Cron / scheduled server-side jobs
-   **Email:** Existing SMTP, with room for transactional email later
-   **WhatsApp:** Official WhatsApp Business Platform / Cloud API
-   **Development:** Claude Code

The current website should not be rewritten unnecessarily. The existing
UI will be preserved and functionality will be migrated to the new
backend gradually.

------------------------------------------------------------------------

# 2. Admin Panel / Menu Structure

The admin panel will be the central operating system for ConnectMyTours.

## Dashboard

-   Today's enquiries
-   New leads
-   Pending quotations
-   Follow-ups due
-   Confirmed bookings
-   Lost leads
-   Lead conversion rate
-   Quotation conversion rate
-   Recent enquiries
-   Recent activities
-   Quick actions

## CRM

-   Leads / Enquiries
-   Customers
-   Follow-ups
-   Quotations
-   Activity History
-   Tasks
-   Lead Tags
-   Lead Sources

## Inventory

-   Packages
-   Destinations
-   Categories
-   Hotels / Properties
-   Vehicles
-   Media Library

## CMS

-   Pages
-   **Page Builder**
-   Blog
-   Banners
-   FAQs
-   Testimonials
-   Homepage Sections
-   Navigation / Menus

## Marketing

-   WhatsApp Campaigns
-   Follow-up Automation
-   WhatsApp Templates
-   Offers
-   Lead Sources

## Reports

-   Lead Reports
-   Quotation Reports
-   Booking Reports
-   Conversion Reports
-   Package Performance
-   Destination Performance
-   Staff Performance
-   Marketing Performance

## Settings

-   Users & Roles
-   Website Settings
-   WhatsApp Settings
-   Email / SMTP
-   SEO Settings
-   System Settings
-   Audit Logs

------------------------------------------------------------------------

# 3. Lead & Enquiry Management

The enquiry system will become a proper CRM instead of only sending an
SMTP email.

## Enquiry Flow

Customer submits the enquiry form:

`Customer → Enquiry Form → Lead Created → Enquiry Number → Confirmation`

Each enquiry receives a unique enquiry number.

## Lead Statuses

Primary pipeline:

`New → Contacted → Quotation Prepared → Quotation Sent → Follow-up → Negotiation → Confirmed`

Alternative outcomes:

-   Not Interested
-   Lost
-   Cancelled

## Lead Data

-   Enquiry number
-   Customer
-   Contact information
-   WhatsApp number
-   Email
-   Destination
-   Travel date
-   Return date
-   Adults
-   Kids
-   Infants
-   Package / category
-   Budget, when applicable
-   Source
-   Assigned staff
-   Status
-   Priority
-   Tags
-   Notes
-   Created date
-   Updated date

## Lead Timeline

Every important action will be recorded.

Example:

-   Enquiry submitted
-   Confirmation sent
-   Quotation created
-   Quotation sent
-   WhatsApp follow-up sent
-   Staff call recorded
-   Customer requested discount
-   Revised quotation sent
-   Status changed
-   Booking confirmed

This creates a complete communication and sales history.

------------------------------------------------------------------------

# 4. Package Management

Packages will become database-driven and manageable from the admin
panel.

## Package Fields

-   Package name
-   Slug
-   Category
-   Destination
-   Package type
-   Duration
-   Description
-   Itinerary
-   Inclusions
-   Exclusions
-   Room / category
-   Images
-   Gallery
-   Rack rate
-   B2B rate
-   Custom pricing
-   Seasonal pricing
-   Availability
-   Featured flag
-   Active / inactive
-   SEO information

## Benefits

Admin can change:

-   Price
-   Image
-   Description
-   Availability
-   Package status

without changing source code.

------------------------------------------------------------------------

# 5. Quotation System

The quotation system will be integrated directly with leads.

## Quotation Flow

`Lead → Select Matching Packages → Customize → Create Quotation → Send`

## Quotation Features

-   Quotation number
-   Customer
-   Enquiry number
-   Package selection
-   Multiple quotation items
-   Package images
-   Rack price
-   B2B price
-   Custom price
-   Discount
-   Final price
-   Validity
-   Notes
-   Terms & conditions

## Quotation Status

-   Draft
-   Sent
-   Viewed
-   Accepted
-   Rejected
-   Expired

## Future-ready

The system should be designed so quotations can later be:

-   Shared through WhatsApp
-   Shared as a web link
-   Generated as PDF
-   Tracked for views
-   Revised while preserving history

------------------------------------------------------------------------

# 6. WhatsApp Communication & Automation

WhatsApp will be a major customer-retention channel.

## Enquiry Confirmation

Immediately after enquiry submission:

`Enquiry → Database → Enquiry Number → WhatsApp Confirmation`

## Quotation Message

When quotation is prepared:

-   Package image
-   Booking details
-   Price
-   Date
-   Room/category
-   Enquiry number
-   Contact details

Multiple relevant quotations can be sent for one enquiry.

## Follow-up Automation

For eligible leads:

### Morning

Send a relevant package / offer.

### Evening

Send another relevant package / offer.

Packages must be matched to the customer's enquiry rather than sending
random promotions.

## Automation Controls

-   Enable / disable
-   Morning time
-   Evening time
-   Follow-up duration
-   Maximum messages
-   Eligible lead statuses
-   Pause automation
-   Resume automation
-   Stop automation

## Stop Conditions

Automation must stop when:

-   Customer books
-   Customer requests stop
-   Lead is marked not interested
-   Lead is marked lost
-   Admin manually stops automation

## WhatsApp Template Management

Templates should be managed centrally and designed to work with official
WhatsApp Business messaging requirements.

------------------------------------------------------------------------

# 7. Customer Management

Customers and leads will be treated as separate but connected entities.

One customer can have multiple enquiries and bookings.

## Customer Profile

-   Name
-   Phone
-   WhatsApp
-   Email
-   Location
-   Enquiries
-   Quotations
-   Bookings
-   Notes
-   Communication history
-   Tags

Example:

`Customer → Multiple Enquiries → Multiple Quotations → Multiple Bookings`

This enables future repeat-customer marketing and customer history.

------------------------------------------------------------------------

# 8. CMS

The CMS will allow website content to be managed without modifying
source code.

## Pages

-   About
-   Contact
-   Privacy Policy
-   Terms & Conditions
-   Cancellation Policy
-   Destination pages
-   Service pages
-   Other SEO landing pages

## Page Builder

A visual/content-block based page builder will be included under CMS.

The goal is to allow an admin to create and modify pages without
developer involvement.

### Page Builder Blocks

Initial block library can include:

-   Hero
-   Rich text
-   Image
-   Image + text
-   Two-column content
-   Three-column cards
-   Package listing
-   Destination listing
-   CTA
-   Banner
-   Gallery
-   Testimonials
-   FAQ
-   Statistics
-   Features / benefits
-   Video
-   Contact / enquiry form
-   WhatsApp CTA
-   Custom HTML block where appropriate

### Page Builder Capabilities

-   Drag/reorder sections
-   Enable/disable sections
-   Edit section content
-   Select images from media library
-   Configure buttons and links
-   Configure spacing/layout options within safe limits
-   Preview
-   Draft
-   Publish
-   Save revisions
-   Rollback to previous version

The page builder should be structured so it does not allow an admin to
accidentally break the entire website layout.

## Blog

-   Create
-   Edit
-   Draft
-   Publish
-   Categories
-   Tags
-   Featured image
-   SEO fields

## Banners

-   Image
-   Heading
-   Description
-   CTA
-   Link
-   Active/inactive
-   Start/end dates

## FAQs

-   Create
-   Edit
-   Delete
-   Ordering
-   Category

## Testimonials

-   Customer name
-   Review
-   Rating
-   Image, if applicable
-   Status
-   Ordering

## Homepage Sections

Important homepage sections should eventually be manageable through CMS.

------------------------------------------------------------------------

# 9. Database Architecture

The database will be designed before implementation.

## Authentication & Authorization

-   users
-   roles
-   permissions
-   user_roles
-   role_permissions

## CRM

-   customers
-   leads
-   lead_notes
-   lead_activities
-   lead_followups
-   lead_tasks
-   lead_tags
-   lead_sources

## Inventory

-   packages
-   package_categories
-   destinations
-   package_images
-   package_pricing
-   hotels / properties
-   vehicles

## Quotations

-   quotations
-   quotation_items
-   quotation_revisions
-   quotation_messages

## CMS

-   pages
-   page_versions
-   page_sections
-   blog_posts
-   blog_categories
-   blog_tags
-   faqs
-   testimonials
-   banners
-   menus

## Media & SEO

-   media
-   seo_metadata

## Marketing / Automation

-   whatsapp_templates
-   whatsapp_messages
-   automation_rules
-   campaigns
-   campaign_recipients

## Bookings

-   bookings

## System

-   settings
-   audit_logs

The final schema will be normalized where appropriate and designed
around Supabase Row Level Security.

------------------------------------------------------------------------

# 10. Roles & Permissions

The system will support multiple staff members.

## Super Admin

Full system access.

## Admin / Manager

-   Leads
-   Customers
-   Packages
-   Quotations
-   Reports
-   Follow-ups

## Sales Staff

-   Assigned leads
-   Customer records
-   Quotations
-   Follow-ups
-   Tasks

## Content Manager

-   Pages
-   Page Builder
-   Blog
-   Banners
-   FAQs
-   Testimonials
-   SEO

## Granular Permissions

Examples:

-   View leads
-   Create leads
-   Edit leads
-   Delete leads
-   Assign leads
-   Send quotation
-   Change package price
-   Publish page
-   Manage SEO
-   Manage users

------------------------------------------------------------------------

# 11. SEO & Media Management

SEO will be built into the CMS rather than added later.

## SEO Fields

For pages, packages, destinations and blog posts:

-   SEO title
-   Meta description
-   Slug
-   Canonical URL
-   OG title
-   OG description
-   OG image
-   Index / noindex
-   Schema data

## Media Library

Organized areas:

-   Packages
-   Destinations
-   Banners
-   Blog
-   Gallery
-   Pages

## Media Features

-   Upload
-   Rename
-   Alt text
-   Replace
-   Delete
-   Reuse
-   Image optimization
-   WebP/modern formats where appropriate

------------------------------------------------------------------------

# 12. Reports & Analytics

The admin dashboard should provide useful business intelligence.

## Dashboard KPIs

-   Today's enquiries
-   New leads
-   Pending quotations
-   Follow-ups due
-   Confirmed bookings
-   Lost leads
-   Conversion rate
-   Quotation value

## Lead Reports

-   Date-wise
-   Source-wise
-   Destination-wise
-   Package-wise
-   Staff-wise
-   Status-wise

## Sales Reports

-   Quotations sent
-   Quotations accepted
-   Quotations rejected
-   Booking value
-   Conversion rate

## Marketing Reports

-   WhatsApp messages sent
-   Delivered
-   Failed
-   Follow-up activity
-   Campaign performance

------------------------------------------------------------------------

# 13. Additional Business Features

The following five features are included because they add significant
value to the CRM.

## A. Lead Source Tracking

Track where every enquiry came from:

-   Google
-   Organic SEO
-   Facebook
-   Instagram
-   WhatsApp
-   Direct
-   Referral
-   Other

This enables marketing ROI analysis.

## B. Smart Package Matching

Use enquiry attributes such as:

-   Destination
-   Travel date
-   Number of people
-   Category
-   Duration
-   Budget
-   Package type

to recommend matching packages to staff during quotation creation and
follow-up.

## C. Follow-up Task Management

A simple CRM task system:

-   Call customer
-   Send quotation
-   Follow up
-   Request payment
-   Confirm booking

Each task can have:

-   Due date/time
-   Assigned staff
-   Priority
-   Status
-   Notes

## D. Lead Tags

Examples:

-   HOT
-   VIP
-   Family
-   Group
-   Corporate
-   Budget
-   Urgent
-   High Value

Tags make filtering and targeted marketing easier.

## E. Audit Log

Track important administrative changes.

Example:

`Admin changed package price: ₹55,000 → ₹58,000`

`Staff changed lead status: Quotation Sent → Negotiation`

This provides accountability and troubleshooting history.

------------------------------------------------------------------------

# 14. Security, Deployment & Infrastructure

## Hosting

Existing Hostinger Business Web Hosting.

Current environment already supports the planned direction:

-   Next.js
-   Node.js 22.x
-   GitHub integration
-   Auto deployment
-   Environment variables
-   Runtime logs
-   5 Web App capacity
-   Current usage: 2/5 Web Apps

## Application Architecture

`Next.js + Node.js + Supabase`

Next.js will handle:

-   Public website
-   Admin dashboard
-   Server-side operations
-   API endpoints
-   CMS
-   CRM

Supabase will handle:

-   PostgreSQL database
-   Authentication
-   Storage
-   Row Level Security

## Deployment

`Claude Code → GitHub → Hostinger Auto Deployment`

## Security

-   Supabase Auth
-   Role-based authorization
-   Row Level Security
-   Environment variables
-   Input validation
-   API protection
-   Rate limiting where appropriate
-   Secure file uploads
-   Audit logs
-   Error logging
-   Database backups
-   Secrets never exposed to frontend

------------------------------------------------------------------------

# 15. Development Strategy

The project will be developed incrementally.

## Phase 0 --- Foundation

-   Review existing codebase
-   Establish architecture
-   Supabase project
-   Database foundation
-   Authentication
-   Admin shell
-   Roles and permissions
-   Environment configuration

## Phase 1 --- CRM

-   Enquiry capture
-   Lead management
-   Customer management
-   Lead statuses
-   Notes
-   Activities
-   Tasks
-   Tags
-   Lead source tracking

## Phase 2 --- Inventory

-   Packages
-   Categories
-   Destinations
-   Pricing
-   Media library
-   Package matching

## Phase 3 --- Quotations

-   Quotation builder
-   Multiple package options
-   Pricing
-   Quotation status
-   Revision history
-   WhatsApp quotation sending

## Phase 4 --- WhatsApp Automation

-   Confirmation message
-   Quotation message
-   Template management
-   Morning follow-up
-   Evening follow-up
-   Automation rules
-   Stop/pause/resume logic
-   Message history

## Phase 5 --- CMS

-   Pages
-   Page Builder
-   Page revisions
-   Blog
-   FAQ
-   Testimonials
-   Banners
-   Homepage sections
-   Navigation/menu management

## Phase 6 --- Website Integration

Gradually replace hardcoded public content with CMS-driven content.

Recommended order:

`Packages → Destinations → Pages → Blog → Homepage Sections → Other Content`

The current public UI should remain visually stable during migration.

## Phase 7 --- Reports & Analytics

-   Dashboard
-   Lead analytics
-   Sales analytics
-   Conversion reports
-   Package performance
-   Destination performance
-   Staff performance
-   Marketing performance

## Phase 8 --- Production Hardening

-   Security review
-   Permission testing
-   Validation
-   Error handling
-   Performance optimization
-   Backup verification
-   Cron verification
-   WhatsApp delivery testing
-   Production deployment

------------------------------------------------------------------------

# 16. Core Design Principles

1.  **Do not destroy the existing website unnecessarily.**
2.  **Do not start coding before database architecture is agreed.**
3.  **Do not allow Claude Code to invent conflicting tables or duplicate
    features.**
4.  **Build reusable modules instead of one-off functionality.**
5.  **Keep the public website and admin panel logically separated.**
6.  **All business-critical actions should have history/audit records.**
7.  **Customer communication must be trackable.**
8.  **WhatsApp automation must be controllable and stoppable.**
9.  **SEO must be considered at the data-model level.**
10. **The system should be expandable without rebuilding the
    foundation.**

------------------------------------------------------------------------

# 17. Final Product Vision

The final ConnectMyTours platform will be:

**Travel Website + CMS + Page Builder + CRM + Lead Management + Customer
Database + Package Management + Quotation Engine + WhatsApp Automation +
Marketing + SEO + Reports**

The public website remains the customer-facing experience.

The admin panel becomes the operational center for managing the entire
travel business.

The system should be built so that future features such as online
booking, payments, invoices, loyalty programs, advanced marketing
automation, vendor management and AI-assisted sales can be added without
replacing the core architecture.
