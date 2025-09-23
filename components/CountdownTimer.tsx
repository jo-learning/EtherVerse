"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

export interface CountdownTimerProps {
  /** Total duration in seconds */
  seconds?: number;
  /** Target end timestamp in ms (Date.now() format). Overrides seconds if provided */
  targetTime?: number;
  /** Called when countdown hits zero (only fires once) */
  onComplete?: () => void;
  /** Optional className for outer wrapper */
  className?: string;
  /** Auto restart countdown after completion with same duration */
  autoRestart?: boolean;
  /** Interval granularity (ms). Default 1000 (1s). Can lower to 250ms for smoother UI. */
  intervalMs?: number;
  /** Optional label to show before time */
  label?: string;
  /** Render prop to customize display; receives remaining seconds */
  render?: (remainingSeconds: number) => React.ReactNode;
}

/**
 * A resilient countdown timer that survives re-renders, uses monotonic time, and supports auto restart.
 * Provide either `seconds` or a `targetTime` timestamp.
 */
export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  seconds = 60,
  targetTime,
  onComplete,
  className,
  autoRestart = false,
  intervalMs = 1000,
  label,
  render,
}) => {
  const [now, setNow] = useState<number>(() => Date.now());
  const [iteration, setIteration] = useState(0); // for autoRestart cycles
  const rafRef = useRef<number | null>(null);
  const doneRef = useRef(false);
  const startTimeRef = useRef<number>(Date.now());
  const durationRef = useRef<number>(seconds * 1000);

  // Initialize / update when props change
  useEffect(() => {
    if (targetTime) {
      durationRef.current = Math.max(targetTime - startTimeRef.current, 0);
    } else {
      durationRef.current = seconds * 1000;
    }
  }, [seconds, targetTime, iteration]);

  const tick = useCallback(() => {
    setNow(Date.now());
  }, []);

  // use setInterval for simplicity (raf could be overkill for 1s updates)
  useEffect(() => {
    doneRef.current = false;
    startTimeRef.current = Date.now();
    const id = setInterval(() => {
      tick();
    }, intervalMs);
    return () => clearInterval(id);
  }, [tick, intervalMs, iteration]);

  const elapsed = now - startTimeRef.current;
  const remainingMs = Math.max(durationRef.current - elapsed, 0);
  const remainingSeconds = Math.ceil(remainingMs / 1000); // user-friendly

  useEffect(() => {
    if (!doneRef.current && remainingMs <= 0) {
      doneRef.current = true;
      onComplete?.();
      if (autoRestart) {
        // small timeout to avoid immediate same frame restart confusion
        setTimeout(() => setIteration((i) => i + 1), 50);
      }
    }
  }, [remainingMs, onComplete, autoRestart]);

  const format = (totalSeconds: number) => {
    const s = Math.max(totalSeconds, 0);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className={className}>
      {label && <span className="mr-1 opacity-70 text-xs uppercase tracking-wide">{label}</span>}
      {render ? render(remainingSeconds) : (
        <span className="font-mono tabular-nums">{format(remainingSeconds)}</span>
      )}
      {autoRestart && (
        <span className="ml-2 text-[10px] opacity-50 align-middle">cycle {iteration + 1}</span>
      )}
    </div>
  );
};

export default CountdownTimer;