import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadAll } from "@tsparticles/all";
import type { ISourceOptions } from "@tsparticles/engine";

const Particles404 = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(loadAll).then(() => setReady(true));
  }, []);

  const options: ISourceOptions = useMemo(() => ({
    background: { color: { value: "#000000" } },
    fpsLimit: 60,
    detectRetina: true,
    interactivity: {
      events: {
        onHover: { enable: true, mode: ["bubble"] },
        resize: true,
      },
      modes: {
        bubble: {
          distance: 80,
          duration: 0.6,
          size: 4,
          opacity: 1,
        },
      },
    },
    particles: {
      number: { value: 500, size: 1 },
      color: { value: "#c1ff00" },
      links: {
        enable: true,
        distance: 40,
        color: "#c1ff00",
        opacity: 0.3,
        width: 1,
      },
      move: {
        enable: true,
        speed: 1,
        random: true,
        outModes: { default: "bounce" },
      },
      opacity: {
        value: 0.8,
        random: { enable: true, minimumValue: 0.5 },
      },
      size: {
        value: 1.5,
        random: true,
      },
      shape: { type: "circle" },
    },
    polygon: {
      draw: { enable: false },
      enable: true,
      scale: 1.5,
      type: "inline",
      inline: { arrangement: "equidistant" },
      move: { type: "path", radius: 12 },
      url: "/404.svg",
    },
  }), []);

  return ready && <Particles id="tsparticles" options={options} />;
};

export default Particles404;
