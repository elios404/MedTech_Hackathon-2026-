"use client";

import { useEffect, useState, useRef } from "react";

interface AnimatedCounterProps {
  value: number;
  duration?: number; // ms
  formatter?: (val: number) => string;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 900,
  formatter = (v) => v.toLocaleString(),
  className = "",
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const startValueRef = useRef(value);
  const startTimeRef = useRef<number | null>(null);
  const reqIdRef = useRef<number | null>(null);

  useEffect(() => {
    startValueRef.current = displayValue;
    startTimeRef.current = null;

    const animate = (time: number) => {
      if (!startTimeRef.current) startTimeRef.current = time;
      const progress = Math.min((time - startTimeRef.current) / duration, 1);
      
      // Smooth ease-out cubic curve (scoreboard smooth tick)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(
        startValueRef.current + (value - startValueRef.current) * easeOut
      );
      
      setDisplayValue(current);

      if (progress < 1) {
        reqIdRef.current = requestAnimationFrame(animate);
      }
    };

    reqIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
    };
  }, [value, duration]);

  return <span className={className}>{formatter(displayValue)}</span>;
}
