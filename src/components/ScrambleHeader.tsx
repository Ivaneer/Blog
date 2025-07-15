import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

gsap.registerPlugin(ScrambleTextPlugin);

interface ScrambleLinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  text: string;
  href: string;
}

export default function ScrambleLink({ text, href, className = "", ...props }: ScrambleLinkProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const el = ref.current;

    const onHover = () => {
      gsap.to(el, {
        duration: 0.5,
        scrambleText: {
          text,
          chars: "!<>-_\\/[]{}—=+*^?#________",
          speed: 0.8,
        },
        overwrite: true,
      });
    };

    el.addEventListener("mouseenter", onHover);

    return () => {
      el.removeEventListener("mouseenter", onHover);
    };
  }, [text]);

  return (
    <a href={href} ref={ref} className={`${className} inline-block`} {...props}>
      {text}
    </a>
  );
}
