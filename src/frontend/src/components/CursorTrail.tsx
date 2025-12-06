import { useEffect, useRef, useState } from 'react';

const TRAIL_CONFIG = [
  { size: 26, color: 'var(--color-accent)', blur: 30, opacity: 0.35 },
  { size: 18, color: 'var(--color-accent-2)', blur: 20, opacity: 0.3 },
  { size: 12, color: 'rgba(255,255,255,0.8)', blur: 12, opacity: 0.25 }
];

type Position = { x: number; y: number };

export function CursorTrail() {
  const [enabled, setEnabled] = useState(false);
  const positionsRef = useRef<Position[]>(TRAIL_CONFIG.map(() => ({ x: -100, y: -100 })));
  const targetRef = useRef<Position>({ x: -100, y: -100 });
  const rafRef = useRef<number | null>(null);
  const dotsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const hasPointerMovedRef = useRef(false);
  const [hasPointerMoved, setHasPointerMoved] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(pointer: fine)');
    setEnabled(media.matches);
    const listener = () => setEnabled(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const handleMove = (event: PointerEvent) => {
      targetRef.current = { x: event.clientX, y: event.clientY };
      if (!hasPointerMovedRef.current) {
        hasPointerMovedRef.current = true;
        setHasPointerMoved(true);
      }
    };

    window.addEventListener('pointermove', handleMove);
    return () => window.removeEventListener('pointermove', handleMove);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const animate = () => {
      positionsRef.current.forEach((pos, index) => {
        const speed = 0.18 + index * 0.12;
        pos.x += (targetRef.current.x - pos.x) * speed;
        pos.y += (targetRef.current.y - pos.y) * speed;

        const dot = dotsRef.current[index];
        if (dot) {
          dot.style.left = `${pos.x}px`;
          dot.style.top = `${pos.y}px`;
          dot.style.opacity = hasPointerMovedRef.current ? String(TRAIL_CONFIG[index].opacity) : '0';
        }
      });
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [enabled]);

  if (!enabled) {
    return null;
  }

  return (
    <div className="cursor-trail-layer">
      {TRAIL_CONFIG.map((config, index) => (
        <span
          key={index}
          ref={el => {
            dotsRef.current[index] = el;
            if (el && !el.style.left) {
              el.style.left = '-100px';
              el.style.top = '-100px';
            }
          }}
          className={`cursor-trail-dot ${hasPointerMoved ? 'visible' : ''}`}
          style={{
            width: config.size,
            height: config.size,
            background: `radial-gradient(circle, ${config.color}, transparent 60%)`,
            filter: `blur(${config.blur}px)`,
            opacity: 0
          }}
        />
      ))}
    </div>
  );
}

export default CursorTrail;
