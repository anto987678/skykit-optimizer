import { useEffect, useState } from 'react';

export function usePerformanceMode() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isLowPowerDevice, setIsLowPowerDevice] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPrefersReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    const cores = navigator.hardwareConcurrency || 0;
    const memory = (navigator as { deviceMemory?: number }).deviceMemory;
    const lowCores = cores > 0 && cores <= 4;
    const lowMemory = typeof memory === 'number' && memory > 0 && memory <= 4;
    setIsLowPowerDevice(lowCores || lowMemory);
  }, []);

  const shouldReduceMotion = prefersReducedMotion || isLowPowerDevice;

  return { shouldReduceMotion, prefersReducedMotion, isLowPowerDevice };
}

export default usePerformanceMode;
