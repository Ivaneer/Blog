import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import {
  type Container,
  type ISourceOptions,
} from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

export default function Particles404() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);  // carga sólo lo básico necesario
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (container?: Container): Promise<void> => {
     console.log(container); // opcional para debug
  };

  const options: ISourceOptions = useMemo(() => ({
    background: {
      color: { value: "#0b0a0a" },
    },
    fpsLimit: 60,
    fullScreen: {
        enable: true,
        zIndex: 0,
      },
    interactivity: {
      events: {
        onHover: { enable: true, mode: "repulse" },
        resize: { enable: true, delay: 0.5 },
      },
      modes: {
        repulse: { distance: 100, duration: 0.4 },
      },
    },
    particles: {
      shape: {
        type: "char",
        options: {
          char: {
            value: ["4", "0", "4"],
            font: "Verdana",
            weight: "bold",
            fill: true,
          },
        },
      },
      size: { value: 16 },
      move: { enable: false },
      color: { value: "#C1FF00" },
      number: { value: 0, density: { enable: false } },
    },
    emitters: [
      {
        position: { x: 25, y: 50 },
        rate: { quantity: 1, delay: 0.01 },
        size: { width: 0, height: 0 },
        particles: {
          shape: {
            type: "char",
            options: { char: { value: "4", font: "Verdana", fill: true } },
          },
        },
      },
      {
        position: { x: 50, y: 50 },
        rate: { quantity: 1, delay: 0.01 },
        size: { width: 0, height: 0 },
        particles: {
          shape: {
            type: "char",
            options: { char: { value: "0", font: "Verdana", fill: true } },
          },
        },
      },
      {
        position: { x: 75, y: 50 },
        rate: { quantity: 1, delay: 0.01 },
        size: { width: 0, height: 0 },
        particles: {
          shape: {
            type: "char",
            options: { char: { value: "4", font: "Verdana", fill: true } },
          },
        },
      },
    ],
  }), []);

  if (!init) return null;

  return (
    <div className="absolute inset-0 z-0 w-screen h-screen">
  <Particles
    id="tsparticles"
    particlesLoaded={particlesLoaded}
    options={options}
  />
</div>

  );
}
