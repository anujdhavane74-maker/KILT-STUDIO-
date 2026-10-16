import { useEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import morrowBeanPreview from "@/assets/morrow-bean-preview.jpg";
import morrowBeanMobile from "@/assets/morrow-bean-mobile.jpg";

const MAX_TILT = 5.5; // Subtle restrained 3D tilt
const LERP_FACTOR = 0.085; // Natural smooth easing momentum

export function HeroShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const targetRotation = useRef({ x: 0, y: 0 });
  const currentRotation = useRef({ x: 0, y: 0 });
  const animFrameId = useRef<number | null>(null);
  const isHovered = useRef(false);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion.current = mediaQuery.matches;

    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
      if (e.matches && sceneRef.current) {
        sceneRef.current.style.transform = "none";
      }
    };

    mediaQuery.addEventListener("change", handleMotionChange);
    return () => {
      mediaQuery.removeEventListener("change", handleMotionChange);
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, []);

  const updateAnimation = () => {
    const dx = targetRotation.current.x - currentRotation.current.x;
    const dy = targetRotation.current.y - currentRotation.current.y;

    if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01 || isHovered.current) {
      currentRotation.current.x += dx * LERP_FACTOR;
      currentRotation.current.y += dy * LERP_FACTOR;

      if (sceneRef.current && !prefersReducedMotion.current) {
        const rx = currentRotation.current.x;
        const ry = currentRotation.current.y;
        sceneRef.current.style.transform = `perspective(1200px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
      }

      animFrameId.current = requestAnimationFrame(updateAnimation);
    } else {
      currentRotation.current.x = targetRotation.current.x;
      currentRotation.current.y = targetRotation.current.y;
      if (sceneRef.current) {
        if (targetRotation.current.x === 0 && targetRotation.current.y === 0) {
          sceneRef.current.style.transform = "none";
        } else if (!prefersReducedMotion.current) {
          sceneRef.current.style.transform = `perspective(1200px) rotateX(${targetRotation.current.x}deg) rotateY(${targetRotation.current.y}deg)`;
        }
      }
      animFrameId.current = null;
    }
  };

  const handlePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion.current || e.pointerType === "touch") return;
    isHovered.current = true;
    if (!animFrameId.current) {
      animFrameId.current = requestAnimationFrame(updateAnimation);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion.current || e.pointerType === "touch") return;
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const normX = Math.max(-1, Math.min(1, (x / rect.width - 0.5) * 2));
    const normY = Math.max(-1, Math.min(1, (y / rect.height - 0.5) * 2));

    targetRotation.current.x = normY * MAX_TILT;
    targetRotation.current.y = -normX * MAX_TILT;

    if (!animFrameId.current) {
      animFrameId.current = requestAnimationFrame(updateAnimation);
    }
  };

  const handlePointerLeave = () => {
    isHovered.current = false;
    targetRotation.current.x = 0;
    targetRotation.current.y = 0;
    if (!animFrameId.current) {
      animFrameId.current = requestAnimationFrame(updateAnimation);
    }
  };

  return (
    <div
      ref={containerRef}
      className="hero-showcase-wrapper"
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      aria-label="KILT STUDIO Featured Website Concepts"
    >
      {/* 4. Ambient Oval / Circular Background Lighting */}
      <div className="hero-ambient-lighting" aria-hidden="true">
        <div className="ambient-glow-oval" />
        <svg
          className="ambient-orbital-rings"
          viewBox="0 0 600 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer primary orbital ring */}
          <ellipse
            cx="300"
            cy="245"
            rx="275"
            ry="185"
            transform="rotate(-18 300 245)"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeDasharray="520 80 180 60"
            className="ring-outer"
          />
          {/* Inner secondary orbital ring */}
          <ellipse
            cx="295"
            cy="240"
            rx="225"
            ry="145"
            transform="rotate(-12 295 240)"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="360 90 140 50"
            className="ring-inner"
          />
          {/* Sweeping contour curve */}
          <path
            d="M 60,350 C 130,470 470,455 560,250"
            stroke="currentColor"
            strokeWidth="1.4"
            className="ring-sweep"
          />
        </svg>
      </div>

      {/* 3D Tilting Composition */}
      <div ref={sceneRef} className="hero-showcase-scene">
        {/* Mockup 1: Large Desktop Website Preview (Actual MORROW & BEAN demo) */}
        <div className="hero-mockup hero-mockup-desktop">
          {/* Floating Pill Tag 1 */}
          <div className="hero-glass-pill pill-top">
            <span className="pill-dot" />
            <span className="pill-text">Design that works harder</span>
          </div>

          <div className="mockup-header" aria-hidden="true">
            <span className="dot dot-red" />
            <span className="dot dot-yellow" />
            <span className="dot dot-green" />
            <span className="mockup-header-title">morrow-bean-cafe.vercel.app</span>
          </div>

          <a
            href="https://morrow-bean-cafe.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="mockup-link-wrapper"
            aria-label="View MORROW & BEAN live café website (opens in a new tab)"
          >
            <img
              src={morrowBeanPreview}
              alt="MORROW & BEAN — live website preview by KILT STUDIO"
              className="mockup-preview-img desktop-preview-img"
              width={1440}
              height={960}
              loading="eager"
            />
          </a>
        </div>

        {/* Mockup 2: Overlapping Mobile Device Preview (Actual MORROW & BEAN mobile responsive demo) */}
        <div className="hero-mockup hero-mockup-mobile">
          <div className="mockup-header" aria-hidden="true">
            <span className="dot dot-red" />
            <span className="dot dot-yellow" />
            <span className="dot dot-green" />
          </div>

          <a
            href="https://morrow-bean-cafe.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="mockup-link-wrapper"
            aria-label="View MORROW & BEAN mobile website preview (opens in a new tab)"
          >
            <img
              src={morrowBeanMobile}
              alt="MORROW & BEAN — mobile website preview by KILT STUDIO"
              className="mockup-preview-img mobile-preview-img"
              width={390}
              height={844}
              loading="eager"
            />
          </a>
        </div>

        {/* Sub-label under mobile mockup */}
        <a
          href="#work"
          className="hero-sublabel-link"
          aria-label="Explore KILT STUDIO digital work"
        >
          A STRONGER DIGITAL PRESENCE STARTS HERE <ArrowUpRight size={12} />
        </a>

        {/* Mockup 3: Overlapping Card (Front Left, Tilted - KILT / DIGITAL) */}
        <div className="hero-mockup hero-mockup-card">
          <div className="card-eyebrow">KILT / DIGITAL</div>
          <h3 className="card-headline">
            Built for
            <br />
            what's next.
          </h3>
          <a href="#work" className="card-explore-btn">
            EXPLORE <ArrowUpRight size={12} />
          </a>

          {/* Floating Pill Tag 2 */}
          <div className="hero-glass-pill pill-bottom">
            <span className="pill-dot" />
            <span className="pill-text">Strategy meets creativity</span>
          </div>
        </div>
      </div>
    </div>
  );
}
