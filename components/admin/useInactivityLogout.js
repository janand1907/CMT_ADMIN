"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Separate from useAuthStateRedirect() in AdminShell.jsx — that reacts to the
// session itself becoming invalid (revoked elsewhere, refresh failure); this
// reacts to the user simply not doing anything for a while, with a valid
// session the whole time. Both stay active together.
const WARNING_AFTER_MS = 25 * 60 * 1000;
const LOGOUT_AFTER_MS = 30 * 60 * 1000;
// Activity listeners fire far more often than the timer needs (mousemove can
// be dozens of events/sec) — only the first event per window actually resets
// the timers, so an active tab still does at most one reschedule per window
// instead of one per event.
const ACTIVITY_THROTTLE_MS = 5000;

const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];

export function useInactivityLogout(logoutAction, { warningAfterMs = WARNING_AFTER_MS, logoutAfterMs = LOGOUT_AFTER_MS } = {}) {
  const [showWarning, setShowWarning] = useState(false);
  const warningTimerRef = useRef(null);
  const logoutTimerRef = useRef(null);
  const lastResetRef = useRef(0);

  const signOutNow = useCallback(() => {
    logoutAction?.();
  }, [logoutAction]);

  const scheduleTimers = useCallback(() => {
    clearTimeout(warningTimerRef.current);
    clearTimeout(logoutTimerRef.current);
    warningTimerRef.current = setTimeout(() => setShowWarning(true), warningAfterMs);
    logoutTimerRef.current = setTimeout(signOutNow, logoutAfterMs);
  }, [warningAfterMs, logoutAfterMs, signOutNow]);

  const stayActive = useCallback(() => {
    setShowWarning(false);
    lastResetRef.current = Date.now();
    scheduleTimers();
  }, [scheduleTimers]);

  useEffect(() => {
    scheduleTimers();

    function onActivity() {
      // While the warning is showing, only an explicit "Stay Signed In" click
      // (stayActive, called directly) should reset — otherwise routine
      // scrolling/mouse movement while reading the warning would silently
      // dismiss it without the user ever making a choice.
      if (showWarning) return;
      const now = Date.now();
      if (now - lastResetRef.current < ACTIVITY_THROTTLE_MS) return;
      lastResetRef.current = now;
      scheduleTimers();
    }

    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, onActivity, { passive: true }));
    return () => {
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, onActivity));
      clearTimeout(warningTimerRef.current);
      clearTimeout(logoutTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showWarning, scheduleTimers]);

  return { showWarning, stayActive, signOutNow };
}
