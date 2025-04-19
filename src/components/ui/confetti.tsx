"use client";

import React from 'react';

interface ConfettiProps {
  active: boolean;
  config: any; // Replace 'any' with a more specific type if needed
}

export const Confetti: React.FC<ConfettiProps> = ({ active, config }) => {
  return active ? (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      {/* Implement your confetti animation here using libraries like react-confetti */}
      Confetti Effect (Placeholder)
    </div>
  ) : null;
};
