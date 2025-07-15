// src/components/ScrambledTitle.tsx
import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin"

gsap.registerPlugin(ScrambleTextPlugin)

const ScrambledTitle = () => {
  const textRef = useRef<HTMLHeadingElement>(null)
  const emojiRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (textRef.current && emojiRef.current) {
      gsap.fromTo(
        textRef.current,
        {
          scrambleText: {
            text: "",
            chars: "01",
            revealDelay: 0.3,
            speed: 0.8,
          },
        },
        {
          scrambleText: {
            text: "Hola, soy Ivaneer",
            chars: "lowerCase",
            speed: 1,
          },
          duration: 1.2,
          onComplete: () => {
            // Animar emoji saludando (wave)
            gsap.to(emojiRef.current, {
              rotation: 20,
              yoyo: true,
              repeat: -1,
              duration: 0.6,
              ease: "power1.inOut",
              transformOrigin: "70% 70%",
            })
          },
        }
      )
    }
  }, [])

  return (
    <h1
      className="text-4xl md:text-6xl font-bold tracking-tight relative z-10 font-mono text-green-400"
      style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
    >
      <span ref={textRef} />
      <span
        ref={emojiRef}
        style={{ display: "inline-block", color: "white" }}
        aria-label="mano saludando"
        role="img"
      >
        👋
      </span>
    </h1>
  )
}

export default ScrambledTitle
