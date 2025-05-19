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

    const buttons = document.querySelectorAll<HTMLButtonElement>('[data-copy]');
  
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        const pre = button.closest('pre');
        const code = pre?.querySelector('code');
        if (!code) return;
  
        // Copiar texto
        navigator.clipboard.writeText(code.textContent || "");
  
        // Cambiar ícono al de "check"
        button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            class="icon-check w-4 h-4 stroke-white fill-none">
          <path d="M9 16.2l-3.5-3.5L4 14.2l5 5 12-12-1.5-1.5z"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                />
        </svg>
      `;

  
        // GSAP trazo animado
        const path = button.querySelector('path');
          if (path) {
            const length = path.getTotalLength();
            gsap.set(path, {
              strokeDasharray: length,
              strokeDashoffset: length,
            });
            gsap.to(path, {
              strokeDashoffset: 0,
              duration: 0.6,
              ease: "power2.out"
            });
          }

  
        // Volver al ícono original tras 2s
        setTimeout(() => {
          button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg"
                 viewBox="0 0 24 24"
                 class="icon-copy w-4 h-4 fill-current">
              <path d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z"/>
            </svg>
          `;
        }, 2000);
      });
    });
});
