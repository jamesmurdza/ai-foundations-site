/**
 * Visibility-aware polling.
 *
 * The dashboard's live views (applicants list, comment thread, notification
 * bell) used to poll on a plain `setInterval`, which kept firing in a hidden
 * tab. Browsers throttle background timers to roughly once a minute — still far
 * more often than the 5 minutes of quiet Neon needs to scale the compute to
 * zero, so a single forgotten tab pinned the database awake around the clock.
 * That idle uptime, not query volume, was the entire compute bill.
 *
 * A poller only fires while the tab is visible. `hiddenMs` opts a caller into a
 * slow background poll for features that must keep working out of view (the
 * bell's desktop notifications); `null` means stop completely, which is the
 * cheapest option.
 *
 * Timers are injectable so the scheduling logic is testable without a DOM.
 */

export type PollTimers = {
  setTimeout: (fn: () => void, ms: number) => number;
  clearTimeout: (id: number) => void;
};

export type PollerOptions = {
  /** Interval while the tab is visible. */
  visibleMs: number;
  /** Interval while hidden, or null to stop polling entirely. */
  hiddenMs: number | null;
  isVisible: () => boolean;
  run: () => void;
  timers?: PollTimers;
};

export type Poller = {
  start: () => void;
  stop: () => void;
  /** Call from a `visibilitychange` listener. */
  onVisibilityChange: () => void;
};

/** Delay before the next poll, or null when polling should pause. */
export function nextDelay(
  visible: boolean,
  visibleMs: number,
  hiddenMs: number | null,
): number | null {
  return visible ? visibleMs : hiddenMs;
}

const defaultTimers: PollTimers = {
  setTimeout: (fn, ms) => setTimeout(fn, ms) as unknown as number,
  clearTimeout: (id) => clearTimeout(id),
};

export function createPoller({
  visibleMs,
  hiddenMs,
  isVisible,
  run,
  timers = defaultTimers,
}: PollerOptions): Poller {
  let handle: number | null = null;
  let stopped = false;

  const cancel = () => {
    if (handle !== null) {
      timers.clearTimeout(handle);
      handle = null;
    }
  };

  const schedule = () => {
    cancel();
    if (stopped) return;
    const delay = nextDelay(isVisible(), visibleMs, hiddenMs);
    if (delay === null) return;
    handle = timers.setTimeout(() => {
      handle = null;
      tick();
    }, delay);
  };

  // A tick that lands while hidden with hidden polling off is dropped, not run:
  // the reschedule below parks it until the tab comes back.
  const tick = () => {
    if (stopped) return;
    if (isVisible() || hiddenMs !== null) run();
    schedule();
  };

  return {
    start: () => {
      stopped = false;
      tick();
    },
    stop: () => {
      stopped = true;
      cancel();
    },
    onVisibilityChange: () => {
      if (stopped) return;
      // Coming back into view: refresh at once so the tab is never stale, then
      // resume the fast cadence. Going out of view: just reschedule (or pause).
      if (isVisible()) tick();
      else schedule();
    },
  };
}
