import { useEffect, useRef, useState, memo } from "react";
import { Check } from "lucide-react";
import { studioConfig } from "@/lib/studio-config";

export interface Founder {
  key: "anuj" | "krishna" | "amit";
  name: string;
  initial: string;
  role: string;
  tagline: string;
  skills: string[];
}

interface TeamShowcaseProps {
  founders: Founder[];
}

const MAX_TILT = 5.5; // Restrained tilt angle in degrees (hard clamp <= 6)
const LERP_FACTOR = 0.085; // Smooth spring-like momentum factor

// Precise focal point adjustment for each founder's portrait composition
const FOCAL_POINTS: Record<Founder["key"], string> = {
  anuj: "center 15%",
  krishna: "center 15%",
  amit: "center 12%",
};

const FounderCard = memo(function FounderCard({
  founder,
  index,
}: {
  founder: Founder;
  index: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const targetRotation = useRef({ x: 0, y: 0 });
  const currentRotation = useRef({ x: 0, y: 0 });
  const animFrameId = useRef<number | null>(null);
  const isHovered = useRef(false);
  const prefersReducedMotion = useRef(false);

  const [glare, setGlare] = useState<{ x: number; y: number; opacity: number }>({
    x: 50,
    y: 50,
    opacity: 0,
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion.current = mediaQuery.matches;

    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
      if (e.matches) {
        if (cardRef.current) cardRef.current.style.transform = "none";
        if (portraitRef.current) portraitRef.current.style.transform = "none";
      }
    };

    mediaQuery.addEventListener("change", handleMotionChange);
    return () => {
      mediaQuery.removeEventListener("change", handleMotionChange);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, []);

  const updateAnimation = () => {
    const dx = targetRotation.current.x - currentRotation.current.x;
    const dy = targetRotation.current.y - currentRotation.current.y;

    if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01 || isHovered.current) {
      currentRotation.current.x += dx * LERP_FACTOR;
      currentRotation.current.y += dy * LERP_FACTOR;

      const rx = currentRotation.current.x;
      const ry = currentRotation.current.y;

      if (cardRef.current) {
        cardRef.current.style.transform = `perspective(1000px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(${isHovered.current ? -5 : 0}px) scale3d(${isHovered.current ? 1.012 : 1}, ${isHovered.current ? 1.012 : 1}, 1)`;
      }

      if (portraitRef.current) {
        // Optical parallax: portrait layer floats forward and shifts subtly opposite to tilt
        portraitRef.current.style.transform = `translateZ(24px) translateX(${(-ry * 0.6).toFixed(1)}px) translateY(${(rx * 0.6).toFixed(1)}px)`;
      }

      animFrameId.current = requestAnimationFrame(updateAnimation);
    } else {
      currentRotation.current.x = targetRotation.current.x;
      currentRotation.current.y = targetRotation.current.y;

      if (cardRef.current) {
        if (targetRotation.current.x === 0 && targetRotation.current.y === 0) {
          cardRef.current.style.transform = "none";
        } else {
          cardRef.current.style.transform = `perspective(1000px) rotateX(${targetRotation.current.x}deg) rotateY(${targetRotation.current.y}deg)`;
        }
      }

      if (portraitRef.current) {
        portraitRef.current.style.transform = "none";
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

    // Dynamic tilt toward pointer
    targetRotation.current.x = -normY * MAX_TILT;
    targetRotation.current.y = normX * MAX_TILT;

    // Specular glare tracking coordinates
    setGlare({
      x: Math.round((x / rect.width) * 100),
      y: Math.round((y / rect.height) * 100),
      opacity: 0.18,
    });

    if (!animFrameId.current) {
      animFrameId.current = requestAnimationFrame(updateAnimation);
    }
  };

  const handlePointerLeave = () => {
    isHovered.current = false;
    targetRotation.current.x = 0;
    targetRotation.current.y = 0;
    setGlare((prev) => ({ ...prev, opacity: 0 }));

    if (!animFrameId.current) {
      animFrameId.current = requestAnimationFrame(updateAnimation);
    }
  };

  const portraitSrc = studioConfig.portraits[founder.key];
  const focalPoint = FOCAL_POINTS[founder.key] || "center 15%";

  return (
    <div
      ref={containerRef}
      className="founder-card-wrapper"
      style={{ "--card-index": index } as React.CSSProperties}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <article ref={cardRef} className="founder-card" tabIndex={0} aria-label={`${founder.name} — ${founder.role}`}>
        {/* Dynamic Specular Sheen Glare */}
        <div
          className="founder-card-glare"
          style={{
            opacity: glare.opacity,
            background: `radial-gradient(circle 380px at ${glare.x}% ${glare.y}%, rgba(184, 239, 67, 0.18), transparent 70%)`,
          }}
          aria-hidden="true"
        />

        {/* 3D Floating Portrait Layer */}
        <div ref={portraitRef} className="founder-portrait-wrap">
          <div className="founder-portrait">
            {portraitSrc ? (
              <img
                src={portraitSrc}
                alt={`${founder.name}, co-founder of KILT STUDIO`}
                loading="lazy"
                decoding="async"
                width={800}
                height={1000}
                style={{ objectPosition: focalPoint }}
                className="founder-portrait-img"
              />
            ) : (
              <>
                <span aria-hidden="true">{founder.initial}✳</span>
                <small>PORTRAIT COMING SOON</small>
              </>
            )}
            {/* Editorial Vignette Blend Overlay */}
            <div className="founder-portrait-vignette" aria-hidden="true" />
          </div>

          {/* Floating Studio Badge */}
          <div className="founder-badge" aria-hidden="true">
            <span className="founder-badge-dot" />
            <span>KILT · 0{index + 1}</span>
          </div>
        </div>

        {/* Content Section with Subtle 3D Depth */}
        <div className="founder-content">
          <div className="founder-header">
            <h3>{founder.name}</h3>
            <span className="founder-role">{founder.role}</span>
          </div>
          <p className="founder-text">{founder.tagline}</p>
          <ul className="founder-skills" aria-label={`Core responsibilities of ${founder.name}`}>
            {founder.skills.map((s) => (
              <li key={s}>
                <Check size={12} strokeWidth={2.5} aria-hidden="true" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </article>
    </div>
  );
});

export function TeamShowcase({ founders }: TeamShowcaseProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    // Reveal immediately if user prefers reduced motion or IntersectionObserver is not available
    if (
      typeof window === "undefined" ||
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setIsRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          setIsRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    if (gridRef.current) {
      observer.observe(gridRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={gridRef}
      className={`founder-grid ${isRevealed ? "is-revealed" : ""}`}
      role="region"
      aria-label="KILT STUDIO Founders"
    >
      {founders.map((founder, index) => (
        <FounderCard key={founder.key} founder={founder} index={index} />
      ))}
    </div>
  );
}
