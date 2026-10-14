import { useEffect, useRef } from "react";
import logo3d from "@/assets/kilt-3d-logo.png";

const MAX_TILT = 6; // Maximum tilt angle in degrees (hard limit <= 8)
const LERP_FACTOR = 0.08; // Smooth easing factor for realistic momentum

export function HeroLogo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const targetRotation = useRef({ x: 0, y: 0 });
  const currentRotation = useRef({ x: 0, y: 0 });
  const animFrameId = useRef<number | null>(null);
  const isHovered = useRef(false);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    // Check user preference for reduced motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion.current = mediaQuery.matches;

    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
      if (e.matches && cardRef.current) {
        cardRef.current.style.transform = "none";
        cardRef.current.style.filter = "";
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

    // Continue lerping if distance is noticeable or currently hovered
    if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01 || isHovered.current) {
      currentRotation.current.x += dx * LERP_FACTOR;
      currentRotation.current.y += dy * LERP_FACTOR;

      if (cardRef.current) {
        const rx = currentRotation.current.x;
        const ry = currentRotation.current.y;
        cardRef.current.style.transform = `perspective(1000px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
        cardRef.current.style.filter = `drop-shadow(${(-ry * 1.5).toFixed(1)}px ${(rx * 1.2 + 15).toFixed(1)}px 35px rgba(0, 0, 0, 0.75)) drop-shadow(0 0 45px rgba(184, 239, 67, 0.16))`;
      }

      animFrameId.current = requestAnimationFrame(updateAnimation);
    } else {
      // Snapped to rest position
      currentRotation.current.x = targetRotation.current.x;
      currentRotation.current.y = targetRotation.current.y;
      if (cardRef.current) {
        if (targetRotation.current.x === 0 && targetRotation.current.y === 0) {
          cardRef.current.style.transform = "none";
          cardRef.current.style.filter = "";
        } else {
          cardRef.current.style.transform = `perspective(1000px) rotateX(${targetRotation.current.x}deg) rotateY(${targetRotation.current.y}deg)`;
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

    // Calculate normalized cursor coordinate from -1 to 1 relative to center
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const normX = Math.max(-1, Math.min(1, (x / rect.width - 0.5) * 2));
    const normY = Math.max(-1, Math.min(1, (y / rect.height - 0.5) * 2));

    // Tilt toward the cursor:
    // Cursor at top (normY < 0) -> top comes forward (negative rotateX)
    // Cursor at right (normX > 0) -> right comes forward (negative rotateY)
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
      className="hero-3d-logo-wrapper"
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      aria-label="KILT STUDIO 3D Logo"
      role="img"
    >
      <div ref={cardRef} className="hero-3d-logo-card">
        <img
          src={logo3d}
          alt="KILT STUDIO 3D Metallic Logo with neon lime underglow"
          width={2172}
          height={724}
          fetchPriority="high"
          draggable={false}
          className="hero-3d-logo-img"
        />
      </div>
    </div>
  );
}
