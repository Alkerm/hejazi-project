'use client';

import React from 'react';

/**
 * Vibrant, lightweight dynamic background featuring floating glowing energy orbs
 * and rising particle specks representing solar energy and smart security technology.
 * Fully optimized with pure CSS GPU compositing.
 */
export function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none"
    >
      {/* Dynamic Glowing Energy Orbs */}
      <div className="ambient-orb ambient-orb-1" />
      <div className="ambient-orb ambient-orb-2" />
      <div className="ambient-orb ambient-orb-3" />
      <div className="ambient-orb ambient-orb-4" />

      {/* Floating Energy Particle Specks */}
      <div className="energy-particle particle-1" />
      <div className="energy-particle particle-2" />
      <div className="energy-particle particle-3" />
      <div className="energy-particle particle-4" />
      <div className="energy-particle particle-5" />
      <div className="energy-particle particle-6" />

      {/* Ambient Gradient Wave Overlay */}
      <div className="ambient-wave" />
    </div>
  );
}
