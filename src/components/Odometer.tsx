"use client";

import { useEffect, useState, useRef } from "react";

const CHARS = "0123456789";

interface OdometerProps {
  value: string;
  delay?: number;
}

export default function Odometer({ value, delay = 0 }: OdometerProps) {
  const [display, setDisplay] = useState(
    value.replace(/[0-9]/g, "0") // Start with all zeros
  );
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        } else {
          setInView(false);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Respect reduced motion
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!inView) {
      setDisplay(value.replace(/[0-9]/g, "0"));
      return;
    }
    if (prefersReduced) {
      setDisplay(value);
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout>;
    let intervalId: ReturnType<typeof setInterval>;

    timeoutId = setTimeout(() => {
      let iteration = 0;
      const maxIterations = 20; // How many times to spin

      intervalId = setInterval(() => {
        setDisplay((prev) =>
          value
            .split("")
            .map((char, i) => {
              // If it's not a number (like '+', 'k'), just show it
              if (!/[0-9]/.test(char)) return char;
              // If we've passed the threshold for this specific digit, settle on the real char
              // Stagger the settling from left to right
              if (iteration > maxIterations - (value.length - i) * 3) return char;
              // Otherwise, pick a random number
              return CHARS[Math.floor(Math.random() * CHARS.length)];
            })
            .join("")
        );

        iteration++;
        if (iteration > maxIterations) {
          clearInterval(intervalId);
          setDisplay(value);
        }
      }, 50); // Spin speed
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [inView, value, delay]);

  return (
    <span ref={ref} className="inline-block tabular-nums tracking-tight">
      {display}
    </span>
  );
}
