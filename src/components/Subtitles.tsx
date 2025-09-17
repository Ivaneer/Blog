// src/components/FlipSubtitles.tsx
import { useEffect, useRef, useState } from "react"
import gsap from "gsap"

const subtitles = [
  "Pentester y apasionado por la ciberseguridad",
  "Administrador de sistemas QKD",
  "Entusiasta de los CTF",
  "DevSecOps y automatización",
  "Sysadmin",
  "Apasionado por el hacking ético",
]

const FlipSubtitles = () => {
  const textRef = useRef<HTMLParagraphElement>(null)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!textRef.current) return

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 4 })

    tl.to(textRef.current, {
      y: 30,
      opacity: 0,
      duration: 0.5,
      ease: "power1.in",
      onComplete: () => {
        setIndex((prev) => (prev + 1) % subtitles.length)
      },
    })
      .to(textRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power1.out",
      })

    return () => {
      tl.kill()
    }
  }, [])

  return (
    <p
      ref={textRef}
      className="text-xl md:text-2xl font-medium text-gray-300 font-mono relative z-10"
      style={{ height: "2.5rem", overflow: "hidden" }}
    >
      {subtitles[index]}
    </p>
  )
}

export default FlipSubtitles
