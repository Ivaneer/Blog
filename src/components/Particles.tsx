import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import {
  type Container,
  type ISourceOptions,
  MoveDirection,
  OutMode,
} from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

export default function Particles404() {
  const [init, setInit] = useState(false);

  // Inicializar una sola vez el engine con los presets slim
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  const particlesLoaded = async (container?: Container): Promise<void> => {
    console.log("Particles loaded:", container);
  };

  const options: ISourceOptions = useMemo(
    () => ({
      background: {
        color: { value: "#000" },
      },
      detectRetina: true,
      fpsLimit: 60,
      interactivity: {
        events: {
          onHover: { enable: true, mode: "bubble" },
          resize: true,
        },
        modes: {
          bubble: {
            color: "#00ff00",
            distance: 100,
            duration: 2,
            opacity: 1,
            size: 10,
          },
        },
      },
      particles: {
        color: { value: "#ffffff" },
        links: {
          enable: true,
          color: "#ffffff",
          distance: 50,
          opacity: 0.5,
          width: 1,
        },
        move: {
          direction: MoveDirection.none,
          enable: true,
          outModes: { default: OutMode.bounce },
          random: false,
          speed: 1,
          straight: false,
        },
        number: {
          density: { enable: true, area: 800 },
          value: 100,
        },
        opacity: {
          value: 0.5,
        },
        shape: { type: "circle" },
        size: { value: { min: 1, max: 3 } },
      },
    }),
    [],
  );

  return init ? (
    <Particles
      id="tsparticles"
      particlesLoaded={particlesLoaded}
      options={options}
    />
  ) : null;
}
