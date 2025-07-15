import { useRef, useState, useEffect } from 'react';

interface CanvasSize {
  width: number;
  height: number;
}

export const useCanvasSize = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<CanvasSize>({ width: 0, height: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      setSize({
        width: rect.width,
        height: rect.height
      });
    };

    // Initial size calculation
    updateSize();

    // Create ResizeObserver to watch for size changes
    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });

    resizeObserver.observe(container);

    // Cleanup
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return { containerRef, size };
};