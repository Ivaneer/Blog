import { useEffect } from "react";
import gsap from "gsap";
import { InertiaPlugin } from "gsap/InertiaPlugin";

gsap.registerPlugin(InertiaPlugin);

const Anim = () => {
  useEffect(() => {
    let oldX = 0, oldY = 0, deltaX = 0, deltaY = 0;
    const root = document.querySelector(".mwg_effect000");
    if (!root) return;

    const removeOverlayIfExists = () => {
      const existing = document.querySelector("#transition-overlay");
      if (existing) {
        existing.remove();
      }
    };

    // Remove overlay if user goes back
    window.addEventListener("popstate", removeOverlayIfExists);
    window.addEventListener("pageshow", removeOverlayIfExists);

    root.addEventListener("mousemove", (e) => {
      deltaX = e.clientX - oldX;
      deltaY = e.clientY - oldY;
      oldX = e.clientX;
      oldY = e.clientY;
    });

    root.querySelectorAll<HTMLElement>(".media").forEach((el) => {
      el.addEventListener("mouseenter", () => {
        const tl = gsap.timeline({ onComplete: () => tl.kill() });
        tl.timeScale(1.2);

        tl.to(el, {
          inertia: {
            x: { velocity: deltaX * 30, end: 0 },
            y: { velocity: deltaY * 30, end: 0 },
          },
        });

        tl.fromTo(
          el,
          { rotate: 0 },
          {
            duration: 0.4,
            rotate: (Math.random() - 0.5) * 30,
            yoyo: true,
            repeat: 1,
            ease: "power1.inOut",
          },
          "<"
        );
      });

      el.addEventListener("click", (e) => {
        e.preventDefault();
        removeOverlayIfExists(); // por si hubiera uno colgado

        const href = el.dataset.href;
        const title = el.querySelector("div")?.textContent ?? "Loading...";
        const rect = el.getBoundingClientRect();

        const overlay = document.createElement("div");
        overlay.id = "transition-overlay";
        overlay.style.position = "fixed";
        overlay.style.left = `${rect.left}px`;
        overlay.style.top = `${rect.top}px`;
        overlay.style.width = `${rect.width}px`;
        overlay.style.height = `${rect.height}px`;
        overlay.style.background = "#011627";
        overlay.style.borderRadius = "16px";
        overlay.style.zIndex = "9999";
        overlay.style.pointerEvents = "none";
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.color = "#43D9AD";
        overlay.style.fontSize = "2rem";
        overlay.style.fontWeight = "bold";
        overlay.style.fontFamily = "monospace";
        overlay.textContent = title;

        document.body.appendChild(overlay);

        gsap.to(overlay, {
          duration: 0.6,
          ease: "power2.inOut",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          fontSize: "3rem",
          borderRadius: 0,
          onComplete: () => {
            setTimeout(() => {
              window.location.href = href!;
            }, 0);
          }
        });
      });
    });

    // Clean up
    return () => {
      window.removeEventListener("popstate", removeOverlayIfExists);
      window.removeEventListener("pageshow", removeOverlayIfExists);
    };
  }, []);

  return null;
};

export default Anim;
