import React, { useEffect, useRef } from 'react';
import {
  Renderer,
  Camera,
  Transform,
  Mesh,
  Program,
  Geometry,
  Texture,
  Vec3,
  Color,
  Polyline,
  RenderTarget,
} from 'ogl';

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

const fragmentShader = `
  precision highp float;
  uniform vec3 uColor;
  void main() {
    gl_FragColor = vec4(uColor, 1.0);
  }
`;

const asciiVertexShader = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0, 1);
  }
`;

const asciiFragmentShader = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D tMap;
  uniform vec2 uMapResolution;
  const float pixelSize = 8.0;
  const float chars = 16.0;
  const float rows = 4.0;
  const float cols = 4.0;

  float luminance(vec3 color) {
    return dot(color, vec3(0.299, 0.587, 0.114));
  }

  void main() {
    vec2 resolution = uMapResolution;
    vec2 uv = floor(vUv * resolution / pixelSize) * pixelSize / resolution;
    vec3 color = texture2D(tMap, uv).rgb;
    float lum = luminance(color);
    float index = floor(lum * (chars - 1.0));
    float row = floor(index / cols);
    float col = mod(index, cols);
    vec2 charUv = fract(vUv * resolution / pixelSize);
    vec2 glyphUv = (vec2(col, row) + charUv) / vec2(cols, rows);
    vec3 glyph = texture2D(tMap, glyphUv).rgb;
    gl_FragColor = vec4(glyph, 1.0);
  }
`;

export default function AsciiTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const renderer = new Renderer({ dpr: 2, canvas: canvasRef.current!, alpha: true });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    const camera = new Camera(gl);
    camera.position.z = 5;

    const scene = new Transform();

    const count = 20;
    const points: Vec3[] = [];
    for (let i = 0; i < count; i++) points.push(new Vec3());

    const polyline = new Polyline(gl, {
      points,
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uColor: { value: new Color('#00ff00') },
        uThickness: { value: 40 },
        uResolution: { value: [gl.canvas.width, gl.canvas.height] },
        uDPR: { value: renderer.dpr },
      },
    });
    polyline.mesh.setParent(scene);

    let renderTarget = new RenderTarget(gl, {
      width: window.innerWidth,
      height: window.innerHeight,
      depth: false,
    });

    const asciiProgram = new Program(gl, {
      vertex: asciiVertexShader,
      fragment: asciiFragmentShader,
      uniforms: {
        tMap: { value: renderTarget.texture },
        uMapResolution: { value: [renderTarget.width, renderTarget.height] },
      },
    });

    const geometry = new Geometry(gl, {
      position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
    });

    const quad = new Mesh(gl, { geometry, program: asciiProgram });

    function resize() {
      renderer.setSize(window.innerWidth, window.innerHeight);

      polyline.mesh.program.uniforms.uResolution.value = [gl.canvas.width, gl.canvas.height];

      renderTarget.dispose();
      renderTarget = new RenderTarget(gl, {
        width: window.innerWidth,
        height: window.innerHeight,
        depth: false,
      });

      asciiProgram.uniforms.tMap.value = renderTarget.texture;
      asciiProgram.uniforms.uMapResolution.value = [renderTarget.width, renderTarget.height];
    }
    window.addEventListener('resize', resize);
    resize();

    const mouse = new Vec3();
    const mouseVelocity = new Vec3();
    const tmp = new Vec3();
    const spring = 0.06;
    const friction = 0.85;

    function updateMouse(e: MouseEvent | TouchEvent) {
      let x: number, y: number;
      if (e instanceof TouchEvent && e.touches.length > 0) {
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
      } else if (e instanceof MouseEvent) {
        x = e.clientX;
        y = e.clientY;
      } else {
        return;
      }
      mouse.set(
        (x / gl.renderer.width) * 2 - 1,
        (y / gl.renderer.height) * -2 + 1,
        0
      );
    }

    window.addEventListener('mousemove', updateMouse);
    window.addEventListener('touchmove', updateMouse);

    function animate() {
      requestAnimationFrame(animate);

      for (let i = points.length - 1; i >= 0; i--) {
        if (i === 0) {
          tmp.copy(mouse).sub(points[i]).multiply(spring);
          mouseVelocity.add(tmp).multiply(friction);
          points[i].add(mouseVelocity);
        } else {
          points[i].lerp(points[i - 1], 0.9);
        }
      }
      polyline.updateGeometry();

      // Render trail to the renderTarget framebuffer
      renderer.render({ scene, camera, target: renderTarget });

      // Render ascii quad on screen using renderTarget texture
      renderer.render({ scene: quad, camera: null as any });
    }

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', updateMouse);
      window.removeEventListener('touchmove', updateMouse);
      renderer.dispose();
      renderTarget.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 0,
        backgroundColor: 'transparent',
      }}
    />
  );
}
