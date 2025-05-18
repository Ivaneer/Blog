import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);

requestAnimationFrame(() => {
  const tocLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>("#toc a"));

  // Scroll suave para TOC
  tocLinks.forEach(link => {
    const targetId = link.getAttribute("href")?.slice(1);
    const target = document.getElementById(targetId!);
    if (!target) return;

    link.addEventListener("click", (e) => {
      e.preventDefault();
      gsap.to(window, {
        duration: 0.8,
        scrollTo: { y: target, offsetY: 84 },
        ease: "power2.out",
      });
    });
  });

  // Animación para bloques <pre>
  gsap.utils.toArray("pre").forEach(pre => {
    gsap.from(pre, {
      scrollTrigger: {
        trigger: pre,
        start: "top 85%",
        end: "top 50%",
        scrub: true,
      },
      opacity: 0,
      y: 30,
      scale: 0.98,
      ease: "power2.out",
    });
  });

  // 🎯 Animación para botón de copiar
  document.querySelectorAll<HTMLButtonElement>(".copy-button").forEach(button => {
    // Hover sutil en el icono de copiar
    button.addEventListener("mouseenter", () => {
      gsap.to(button, {
        scale: 1.15,
        duration: 0.2,
        ease: "power2.out",
      });
    });
    button.addEventListener("mouseleave", () => {
      gsap.to(button, {
        scale: 1,
        duration: 0.2,
        ease: "power2.out",
      });
    });
  });
});
