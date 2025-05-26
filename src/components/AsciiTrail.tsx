import React, { useEffect, useRef } from "react"; 
import {
  Polyline,
  Renderer,
  Transform,
  Vec3,
  Color,
} from "ogl";

const vertexShader = `
  attribute vec3 position;
  attribute vec3 next;
  attribute vec3 prev;
  attribute vec2 uv;
  attribute float side;

  uniform vec2 uResolution;
  uniform float uDPR;
  uniform float uThickness;

  vec4 getPosition() {
      vec2 aspect = vec2(uResolution.x / uResolution.y, 1);
      vec2 nextScreen = next.xy * aspect;
      vec2 prevScreen = prev.xy * aspect;

      vec2 tangent = normalize(nextScreen - prevScreen);
      vec2 normal = vec2(-tangent.y, tangent.x);
      normal /= aspect;
      normal *= 1.0 - pow(abs(uv.y - 0.5) * 2.0, 2.0);

      float pixelWidth = 1.0 / (uResolution.y / uDPR);
      normal *= pixelWidth * uThickness;

      float dist = length(nextScreen - prevScreen);
      normal *= smoothstep(0.0, 0.02, dist);

      vec4 current = vec4(position, 1);
      current.xy -= normal * side;
      return current;
  }

  void main() {
      gl_Position = getPosition();
  }
`;

export default function TrailCanvas() {
  const canvasRef = useRef(null);
  const polylineRef = useRef(null);
  const rendererRef = useRef(null);
  const mouseRef = useRef(new Vec3());
  const mouseVelocityRef = useRef(new Vec3());
  const pointsRef = useRef([]);
  const sceneRef = useRef(null);

  useEffect(() => {
    const renderer = new Renderer({ dpr: 2, canvas: canvasRef.current, alpha: true });

    const gl = renderer.gl;
    rendererRef.current = renderer;
    gl.clearColor(0.0, 0.0, 0.0, 0.0);

    const scene = new Transform();
    sceneRef.current = scene;

    const count = 20;
    const points = [];
    for (let i = 0; i < count; i++) points.push(new Vec3());
    pointsRef.current = points;

    const polyline = new Polyline(gl, {
      points,
      vertex: vertexShader,
      uniforms: {
        uColor: { value: new Color("#00ff00") },
        uThickness: { value: 40 },
      },
    });
    polyline.mesh.setParent(scene);
    polylineRef.current = polyline;

    function resize() {
      renderer.setSize(window.innerWidth, window.innerHeight);
      if (polyline) polyline.resize();
    }
    window.addEventListener("resize", resize);
    resize();

    const spring = 0.06;
    const friction = 0.85;
    const mouse = mouseRef.current;
    const mouseVelocity = mouseVelocityRef.current;

    function updateMouse(e) {
      let x, y;
      if (e.changedTouches && e.changedTouches.length) {
        x = e.changedTouches[0].pageX;
        y = e.changedTouches[0].pageY;
      } else {
        x = e.pageX ?? e.clientX;
        y = e.pageY ?? e.clientY;
      }
      mouse.set(
        (x / gl.renderer.width) * 2 - 1,
        (y / gl.renderer.height) * -2 + 1,
        0
      );
    }

    if ("ontouchstart" in window) {
      window.addEventListener("touchstart", updateMouse);
      window.addEventListener("touchmove", updateMouse);
    } else {
      window.addEventListener("mousemove", updateMouse);
    }

    const tmp = new Vec3();

    function animate() {
      requestAnimationFrame(animate);
      const pts = pointsRef.current;

      for (let i = pts.length - 1; i >= 0; i--) {
        if (i === 0) {
          tmp.copy(mouse).sub(pts[i]).multiply(spring);
          mouseVelocity.add(tmp).multiply(friction);
          pts[i].add(mouseVelocity);
        } else {
          pts[i].lerp(pts[i - 1], 0.9);
        }
      }
      polylineRef.current.updateGeometry();
      renderer.render({ scene });
    }

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      if ("ontouchstart" in window) {
        window.removeEventListener("touchstart", updateMouse);
        window.removeEventListener("touchmove", updateMouse);
      } else {
        window.removeEventListener("mousemove", updateMouse);
      }
      renderer.dispose();
    };
  }, []);


return (
  <canvas
    ref={canvasRef}
    style={{
      display: "block",
      width: "100vw",
      height: "100vh",
      position: "fixed",
      top: 0,
      left: 0,
      pointerEvents: "none",
      zIndex: 0,
      backgroundColor: "transparent",
    }}
  />
);
}