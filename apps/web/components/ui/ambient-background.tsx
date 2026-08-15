'use client';

/**
 * Lightweight ambient background with slowly drifting gradient orbs.
 * Pure CSS animations — zero JS overhead, zero layout shift.
 * Uses the Half Link brand palette (coral / terracotta / warm sand).
 */
export function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="ambient-bg"
    >
      <div className="ambient-orb ambient-orb-1" />
      <div className="ambient-orb ambient-orb-2" />
      <div className="ambient-orb ambient-orb-3" />
    </div>
  );
}
