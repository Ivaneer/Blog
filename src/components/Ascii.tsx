// src/components/AsciiEffect.tsx
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { AsciiEffect } from "three/examples/jsm/effects/AsciiEffect";

export default function AsciiEffectComponent() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let width = window.innerWidth;
    let height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, width / height, 1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);

    const effect = new AsciiEffect(renderer, " .:-=+*#%@", { invert: true });
    effect.setSize(width, height);
    effect.domElement.style.color = "green";
    effect.domElement.style.backgroundColor = "black";
    containerRef.current?.appendChild(effect.domElement);

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshNormalMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const animate = () => {
      requestAnimationFrame(animate);
      mesh.rotation.x += 0.01;
      mesh.rotation.y += 0.01;
      effect.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      effect.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (containerRef.current && effect.domElement.parentElement) {
        containerRef.current.removeChild(effect.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full"></div>;
}
