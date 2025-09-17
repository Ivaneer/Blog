// src/components/LiquidPathButton.tsx
import React, { useEffect, useRef } from "react";
import gsap from "gsap";

function spline(points: { x: number; y: number }[], tension = 1, close = true) {
  if (points.length < 2) return "";
  let d = `M${points[0].x},${points[0].y}`;
  const n = points.length;
  for (let i = 0; i < n - 1; i++) {
    const p0 = points[i === 0 ? i : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i + 2 < n ? points[i + 2] : p2;
    const cp1x = p1.x + ((p2.x - p0.x) / 6) * tension;
    const cp1y = p1.y + ((p2.y - p0.y) / 6) * tension;
    const cp2x = p2.x - ((p3.x - p1.x) / 6) * tension;
    const cp2y = p2.y - ((p3.y - p1.y) / 6) * tension;
    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return close ? d + "Z" : d;
}

function pointsInPath(path: SVGPathElement, detail: number) {
  const length = path.getTotalLength();
  const step = length / detail;
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < detail; i++) {
    const p = path.getPointAtLength(i * step);
    pts.push({ x: p.x, y: p.y });
  }
  return pts;
}

function createCoordsTransformer(svg: SVGSVGElement) {
  const pt = svg.createSVGPoint();
  return (e: MouseEvent) => {
    pt.x = e.clientX;
    pt.y = e.clientY;
    const { x, y } = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    return { x, y };
  };
}

const LiquidPathButton: React.FC<{ label: string }> = ({ label }) => {
  const pathRef = useRef<SVGPathElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const path = pathRef.current;
    const svg = svgRef.current;
    if (!path || !svg) return;

    const options = {
      detail: 32,
      tension: 1,
      close: true,
      range: { x: 22, y: 36 },
      axis: ["y"] as ("x" | "y")[],
    };

    const svgPoints = pointsInPath(path, options.detail);
    const originPoints = svgPoints.map((p) => ({ ...p }));
    const liquidPoints = svgPoints.map((p) => ({ ...p }));

    const transformCoords = createCoordsTransformer(svg);

    const pointDistance = Math.hypot(
      originPoints[0].x - originPoints[1].x,
      originPoints[0].y - originPoints[1].y
    );

    const maxDist = {
      x: options.axis.includes("x") ? pointDistance / 2.8 : 0,
      y: options.axis.includes("y") ? pointDistance / 2.8 : 0,
    };

    gsap.ticker.add(() => {
      gsap.set(path, {
        attr: { d: spline(liquidPoints, options.tension, options.close) },
      });
    });

    const moveHandler = (e: MouseEvent) => {
      const { x, y } = transformCoords(e);
      liquidPoints.forEach((point, i) => {
        const origin = originPoints[i];
        const distX = Math.abs(origin.x - x);
        const distY = Math.abs(origin.y - y);
        if (distX <= options.range.x && distY <= options.range.y) {
          const diff = { x: origin.x - x, y: origin.y - y };
          const target = { x: origin.x + diff.x, y: origin.y + diff.y };
          const newX = gsap.utils.clamp(origin.x - maxDist.x, origin.x + maxDist.x, target.x);
          const newY = gsap.utils.clamp(origin.y - maxDist.y, origin.y + maxDist.y, target.y);
          gsap.to(point, {
            x: newX,
            y: newY,
            ease: "sine",
            overwrite: true,
            duration: 0.22,
            onComplete() {
              gsap.to(point, {
                x: origin.x,
                y: origin.y,
                ease: "elastic.out(1.2,0.35)",
                duration: 1.4,
              });
            },
          });
        }
      });
    };

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!prefersReduced.matches) {
      window.addEventListener("mousemove", moveHandler);
    }

    return () => {
      window.removeEventListener("mousemove", moveHandler);
      gsap.ticker.remove(() => {});
    };
  }, []);

  return (
    <div className="relative z-10 flex justify-center items-center ">
      <svg
        ref={svgRef}
        viewBox="-40 -40 360 176"
        width="320"
        height="136"
        className="cursor-pointer relative z-10 absolute top-[20px] inset-x-0 mx-auto"
      >
        <defs>
          <filter id="blurFilter" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
  
        <path
          ref={pathRef}
          d="M40 0 H240 Q280 0 280 40 V56 Q280 96 240 96 H40 Q0 96 0 56 V40 Q0 0 40 0 Z"
          fill="rgba(0,0,0,0.35)"
          stroke="#43D9AD"
          strokeWidth="2.5"
          filter="url(#blurFilter)"
        />
  
        <text
          x="140"
          y="48"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#43D9AD"
          fontSize="20"
          fontWeight="bold"
        >
          {label}
        </text>
      </svg>
    </div>
  );  
};

export default LiquidPathButton;
