import { useCallback, useRef, useState } from 'react';

interface TiltState {
  rotateX: number;
  rotateY: number;
  mouseX: number;
  mouseY: number;
  mouseXPercent: number;
  mouseYPercent: number;
  isHovering: boolean;
}

export function useCardTilt(maxDeg = 15) {
  const [tilt, setTilt] = useState<TiltState>({
    rotateX: 0, rotateY: 0,
    mouseX: 0, mouseY: 0,
    mouseXPercent: 50, mouseYPercent: 50,
    isHovering: false,
  });

  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mx = e.clientX - centerX;
    const my = e.clientY - centerY;
    const rotateY = (mx / (rect.width / 2)) * maxDeg;
    const rotateX = -(my / (rect.height / 2)) * maxDeg;
    const pctX = ((e.clientX - rect.left) / rect.width) * 100;
    const pctY = ((e.clientY - rect.top) / rect.height) * 100;
    setTilt({ rotateX, rotateY, mouseX: mx, mouseY: my, mouseXPercent: pctX, mouseYPercent: pctY, isHovering: true });
  }, [maxDeg]);

  const onMouseEnter = useCallback(() => {
    setTilt(t => ({ ...t, isHovering: true }));
  }, []);

  const onMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0, mouseX: 0, mouseY: 0, mouseXPercent: 50, mouseYPercent: 50, isHovering: false });
  }, []);

  return { tilt, ref, onMouseMove, onMouseEnter, onMouseLeave };
}
