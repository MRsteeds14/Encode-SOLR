/**
 * Celebration Animations for SOLR-ARC Demo
 * Fun confetti effects for successful actions
 */

import confetti from 'canvas-confetti';

// Confetti for registration success
export function celebrateRegistration() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#8B5CF6', '#EC4899', '#06B6D4'],
  });
}

// Confetti for minting success
export function celebrateMinting() {
  const duration = 2000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#8B5CF6', '#A78BFA'],
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#EC4899', '#F472B6'],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
}

// Confetti for redemption success
export function celebrateRedemption() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ['#06B6D4', '#22D3EE'],
  });
  fire(0.2, {
    spread: 60,
    colors: ['#8B5CF6', '#A78BFA'],
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    colors: ['#EC4899', '#F472B6'],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
    colors: ['#10B981', '#34D399'],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
    colors: ['#F59E0B', '#FBBF24'],
  });
}

// Generic celebration
export function celebrate() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });
}
