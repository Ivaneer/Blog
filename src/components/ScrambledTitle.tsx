// src/components/ScrambledTitle.tsx
import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin"

gsap.registerPlugin(ScrambleTextPlugin)

const ScrambledTitle = () => {
  const textRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (textRef.current) {
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
            text: "Ivaneer",
            chars: "lowerCase",
            speed: 1,
          },
          duration: 1.2,
        }
      )
    }
  }, [])

  return (
    <h1
      ref={textRef}
      className="text-6xl md:text-9xl font-extrabold tracking-tight relative z-10 text-green-400"
      style={{
        display: "inline-block",
        fontFamily: "'Fira Code', monospace",
      }}
    />
  )
}

export default ScrambledTitle
