import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadAll } from "@tsparticles/all";
import { type Container, type ISourceOptions } from "@tsparticles/engine";

const Particles404 = () => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadAll(engine);
    }).then(() => setInit(true));
  }, []);

  const particlesLoaded = async (container?: Container): Promise<void> => {
    console.log("Particles loaded", container);
  };

  const options: ISourceOptions = useMemo(() => ({
    background: {
      color: { value: "#000000" },
    },
    fpsLimit: 60,
    detectRetina: true,
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: ["bubble"],
        },
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
      number: {
        value: 400,
        density: { enable: false },
      },
      color: {
        value: "#c1ff00",
      },
      links: {
        enable: true,
        distance: 40,
        color: "#c1ff00",
        opacity: 0.3,
        width: 1,
      },
      move: {
        enable: true,
        speed: 1.2, // Más rápido
        random: true,
        outModes: {
          default: "bounce", // para que no salgan del path
        },
      },
      opacity: {
        value: 0.8,
        random: { enable: true, minimumValue: 0.5 },
      },
      size: {
        value: 1.5,
        random: true,
      },
      shape: {
        type: "circle",
      },
    },
    polygon: {
      draw: {
        enable: false,
      },
      enable: true,
      scale: 1.5,
      type: "inline",
      inline: {
        arrangement: "equidistant",
      },
      move: {
        type: "path",
        radius: 12, // margen dentro del path
      },
      url: "/404.svg",
    },
  }), []);

  return init ? (
    <Particles id="tsparticles" particlesLoaded={particlesLoaded} options={options} />
  ) : null;
};

export default Particles404;
