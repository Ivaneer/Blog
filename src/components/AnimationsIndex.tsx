// src/components/HomeIntro.tsx
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrambledTitle from './ScrambledTitle.tsx';
import Subtitles from './Subtitles.tsx';
import LiquidButtons from './LiquidButtons.tsx';

const HomeIntro: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      // título: desde el centro, grande y transparente
      tl.from(".intro-title", {
        y: 0,
        scale: 1.5,
        opacity: 0,
        duration: 1.2,
      });

      // subtítulo: desde más pequeño y opaco
      tl.from(".intro-subtitle", {
        y: 10,
        scale: 1.2,
        opacity: 0,
        duration: 1,
      }, "-=0.8"); // se solapa un poco con el título

      // botones: desde el centro y transparencia
      tl.from(".intro-buttons", {
        y: 0,
        scale: 1.3,
        opacity: 0,
        duration: 1.2,
      }, "-=0.5"); // solapamiento para un flujo más natural
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="text-center space-y-4">
      <h1 className="intro-title text-4xl md:text-6xl font-bold tracking-tight relative z-10">
        <ScrambledTitle client:only="react" />
      </h1>
      <p className="intro-subtitle text-xl md:text-2xl font-medium text-gray-300">
        <Subtitles client:only="react" />
      </p>
      <div className="intro-buttons mt-10 flex justify-center gap-3">
        <a href="/portfolio" className="inline-block">
          <LiquidButtons label="Portfolio" client:only="react" />
        </a>
        <a href="/blog" className="inline-block">
          <LiquidButtons label="Blog" client:only="react" />
        </a>
      </div>
    </div>
  );
};

export default HomeIntro;
