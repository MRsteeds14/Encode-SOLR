import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";

export default function Web3Background() {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const particlesOptions = {
    background: { color: { value: "transparent" } },
    fpsLimit: 60,
    interactivity: {
      events: {
        onHover: { enable: true, mode: "repulse" },
        onClick: { enable: true, mode: "push" },
      },
      modes: {
        repulse: { distance: 120 },
        push: { quantity: 6 },
      },
    },
    particles: {
      number: { value: 105, density: { enable: true, area: 800 } },
      color: { 
        value: "#10B981"
      },
      shape: { type: "triangle" },
      opacity: { 
        value: 0.8,
        random: { enable: true, minimumValue: 0.3 }
      },
      size: { 
        value: { min: 3, max: 8 },
        random: { enable: true, minimumValue: 2 }
      },
      links: {
        enable: true,
        distance: 180,
        color: "#3B82F6",
        opacity: 0.6,
        width: 1,
      },
      move: {
        enable: true,
        speed: 2,
        direction: "none" as const,
        outModes: { default: "bounce" as const },
        random: true,
      },
    },
    detectRetina: true,
  };

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={particlesOptions}
      className="absolute inset-0 z-0"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
