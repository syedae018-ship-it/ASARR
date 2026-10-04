'use client';

import { useEffect, useRef } from 'react';

export function VortexStrandCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Mouse Parallax (subtle 5-8px displacement)
    let mouseX = 0.5;
    let mouseY = 0.5;
    let targetParallaxX = 0;
    let targetParallaxY = 0;
    let parallaxX = 0;
    let parallaxY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX / window.innerWidth;
      mouseY = e.clientY / window.innerHeight;
      targetParallaxX = (mouseX - 0.5) * 8;
      targetParallaxY = (mouseY - 0.5) * 5;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // =========================================================================
    // STRICT MAROON / BURGUNDY PALETTE (PURE MAROON, THIN FILAMENTS)
    // =========================================================================
    const MAROON_PALETTE = [
      { r: 117, g: 20, b: 35 }, // #751423 Primary Deep Maroon
      { r: 100, g: 16, b: 29 }, // #64101D Deep Burgundy
      { r: 90,  g: 15, b: 25 }, // #5A0F19 Dark Wine Maroon
      { r: 138, g: 38, b: 52 }, // #8A2634 Crimson Maroon
      { r: 154, g: 58, b: 69 }  // #9A3A45 Subtle Warm Maroon Accent
    ];

    // Responsive Canvas Resizing
    let width = 0;
    let height = 0;
    let dpr = 1;
    let isMobile = false;

    // Strands & Particles containers
    interface Strand {
      baseAngle: number;
      color: { r: number; g: number; b: number };
      alpha: number;
      lineWidth: number;
      radScale: number;
      twistMult: number;
      vMin: number;
      vMax: number;
    }

    interface Particle {
      strandIndex: number;
      baseV: number;
      speed: number;
      isAccent: boolean;
      twinkleFreq: number;
      twinklePhase: number;
      size: number;
    }

    let strands: Strand[] = [];
    let particles: Particle[] = [];

    const initSystem = () => {
      isMobile = width < 768;
      const strandCount = isMobile ? 420 : 760;
      const particleCount = isMobile ? 500 : 1200;

      strands = [];
      for (let s = 0; s < strandCount; s++) {
        const baseAngle = (s / strandCount) * Math.PI * 2;
        const color = MAROON_PALETTE[s % MAROON_PALETTE.length];
        
        // Thin, delicate filaments
        const alpha = isMobile
          ? (0.42 + ((s * 7) % 15) * 0.02)
          : (0.36 + ((s * 7) % 15) * 0.02); // 0.36 - 0.66
        const lineWidth = isMobile ? 0.65 : (0.75 + ((s * 5) % 9) * 0.04); // Fine 0.75 - 1.07px
        const radScale = 0.94 + ((s * 13) % 21) * 0.006;
        const twistMult = 0.96 + ((s * 11) % 17) * 0.005;

        // Staggered organic ends
        const vMin = -1.04 - 0.06 * Math.sin(s * 2.3);
        const vMax = 1.04 + 0.06 * Math.cos(s * 1.9);

        strands.push({
          baseAngle,
          color,
          alpha,
          lineWidth,
          radScale,
          twistMult,
          vMin,
          vMax
        });
      }

      particles = [];
      for (let i = 0; i < particleCount; i++) {
        const strandIndex = i % strandCount;
        const baseV = -0.98 + (i / particleCount) * 1.96;
        const speed = 0.035 + ((i * 11) % 13) * 0.003;
        const isAccent = (i % 5 === 0); // 20% warm-white sparks, 80% maroon
        const twinkleFreq = 1.8 + ((i * 7) % 11) * 0.25;
        const twinklePhase = ((i * 23) % 100) * 0.0628;
        const size = isAccent ? 0.95 : 1.15;

        particles.push({
          strandIndex,
          baseV,
          speed,
          isAccent,
          twinkleFreq,
          twinklePhase,
          size
        });
      }
    };

    const resize = () => {
      if (!container || !canvas || !ctx) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initSystem();
    };

    window.addEventListener('resize', resize, { passive: true });
    resize();

    // =========================================================================
    // SYMMETRICAL 3D VORTEX GEOMETRY (BOTTOM IS PERFECT LIKE THE TOP)
    // =========================================================================
    function getVortexPoint(
      v: number, 
      angle: number, 
      radScale: number, 
      cx: number, 
      cyWaist: number, 
      canvasW: number, 
      canvasH: number
    ) {
      let waistR: number;
      let topR: number;
      let bottomR: number;

      if (isMobile) {
        // Mobile-tailored proportions: perfectly frames text and buttons
        const mScale = canvasW / 390.0;
        waistR = 48 * mScale * radScale;
        topR = 215 * mScale * radScale;
        bottomR = 235 * mScale * radScale;
      } else {
        const dScale = Math.min(canvasW / 1554, canvasH / 1012);
        waistR = 102 * dScale * radScale;
        topR = 690 * dScale * radScale;
        bottomR = 720 * dScale * radScale;
      }

      let y: number;
      let r: number;

      if (v <= 0) {
        // Upper Funnel (Top Trumpet)
        const normV = Math.abs(v);
        y = cyWaist - normV * (cyWaist + 30);
        r = waistR + (topR - waistR) * Math.pow(normV, 1.76);
      } else {
        // Lower Funnel (Bottom Bell - Symmetrical & Clean)
        const normV = v;
        y = cyWaist + normV * (canvasH - cyWaist + 30);
        r = waistR + (bottomR - waistR) * Math.pow(normV, 1.76);
      }

      // Consistent, subtle perspective tilt (clean horizontal ellipses, zero tangles)
      const tilt = isMobile ? 0.08 : 0.10;

      const x3d = r * Math.cos(angle);
      const z3d = r * Math.sin(angle);

      return {
        x: cx + x3d,
        y: y + z3d * tilt,
        z: z3d,
        r: r
      };
    }

    // =========================================================================
    // 60 FPS RENDER LOOP
    // =========================================================================
    let lastTime = performance.now();
    let animTime = 0;
    let isVisible = true;
    let isIntersecting = true;
    let animationFrameId: number;

    const handleVisibilityChange = () => {
      isVisible = (document.visibilityState === 'visible');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Pause rendering when scrolled out of view on mobile/desktop
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isIntersecting = entry.isIntersecting;
      });
    }, { threshold: 0.05 });

    observer.observe(container);

    const OMEGA = (2 * Math.PI) / 30.0; // Steady 30s revolution

    function render(currentTime: number) {
      animationFrameId = requestAnimationFrame(render);
      if (!isVisible || !isIntersecting || !ctx) return;

      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      if (!prefersReducedMotion) {
        animTime += delta;
      } else {
        animTime = 5.0;
      }

      parallaxX += (targetParallaxX - parallaxX) * 0.05;
      parallaxY += (targetParallaxY - parallaxY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const cx = width * 0.5 + parallaxX;
      const cyWaist = height * 0.44 + parallaxY;

      // Source-over keeps pure maroon color constant without fading to white or pink
      ctx.globalCompositeOperation = 'source-over';

      const rotAngle = animTime * OMEGA;
      const pointsPerStrand = isMobile ? 44 : 58;

      // -----------------------------------------------------------------------
      // 1. RENDER ORGANIZED THIN MAROON STRANDS
      // -----------------------------------------------------------------------
      const strandLen = strands.length;
      for (let s = 0; s < strandLen; s++) {
        const strand = strands[s];
        const phi = strand.baseAngle + rotAngle;
        const c = strand.color;

        ctx.beginPath();

        const vRange = strand.vMax - strand.vMin;
        for (let p = 0; p <= pointsPerStrand; p++) {
          const t = p / pointsPerStrand;
          const v = strand.vMin + t * vRange;
          
          // Symmetric twist: twist(-v) = -twist(v) guarantees identical bottom flow
          const twist = (3.0 * v + 0.9 * Math.tanh(2.8 * v)) * strand.twistMult;
          const angle = phi + twist;
          const pt = getVortexPoint(v, angle, strand.radScale, cx, cyWaist, width, height);

          if (p === 0) {
            ctx.moveTo(pt.x, pt.y);
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        }

        ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${strand.alpha})`;
        ctx.lineWidth = strand.lineWidth;
        ctx.stroke();
      }

      // -----------------------------------------------------------------------
      // 2. RENDER DELICATE STARDUST PARTICLES
      // -----------------------------------------------------------------------
      const partLen = particles.length;
      for (let i = 0; i < partLen; i++) {
        const p = particles[i];
        const strand = strands[p.strandIndex];
        if (!strand) continue;

        const flowProg = !prefersReducedMotion ? p.speed * animTime : 0;
        const rawV = ((p.baseV + flowProg + 1.0) % 2.0) - 1.0;
        const v = rawV < -1.0 ? rawV + 2.0 : rawV;

        const phi = strand.baseAngle + rotAngle;
        const twist = (3.0 * v + 0.9 * Math.tanh(2.8 * v)) * strand.twistMult;
        const angle = phi + twist;
        const pt = getVortexPoint(v, angle, strand.radScale, cx, cyWaist, width, height);

        const depthFactor = (pt.z / Math.max(1, pt.r)) * 0.45 + 0.55;
        const twinkle = 0.55 + 0.45 * Math.sin(animTime * p.twinkleFreq + p.twinklePhase);
        const alpha = twinkle * depthFactor * (p.isAccent ? 0.85 : 0.70);

        if (alpha > 0.12) {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, p.size, 0, Math.PI * 2);

          if (p.isAccent) {
            // Crisp warm-white pinpoint sparkle
            ctx.fillStyle = `rgba(255, 245, 235, ${alpha * 0.9})`;
          } else {
            // Deep maroon pinpoint
            ctx.fillStyle = `rgba(138, 38, 52, ${alpha * 0.8})`;
          }

          ctx.fill();
        }
      }
    }

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer.disconnect();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-[3] overflow-hidden" 
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
