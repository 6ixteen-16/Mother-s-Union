"use client";

import { useEffect, useState } from "react";

/**
 * Attaches IntersectionObserver to all direct children of the returned ref
 * that have the class `reveal` or `reveal-3d`. Each child becomes visible
 * as it scrolls into the viewport. Stagger delays come from the element's
 * own `style.transitionDelay`.
 * Uses a MutationObserver to automatically observe dynamically added elements.
 */
export function useRevealChildren<T extends HTMLElement = HTMLDivElement>() {
  const [node, setNode] = useState<T | null>(null);

  useEffect(() => {
    if (!node) return;

    const SELECTOR = ".reveal, .reveal-3d, .reveal-3d-left, .reveal-3d-right, .reveal-left, .reveal-right, .reveal-up";

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          } else {
            // Optional: remove to repeat animation on scroll up
            entry.target.classList.remove("is-visible");
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -32px 0px" }
    );

    // Observe initial targets
    node.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => observer.observe(el));

    // Watch for dynamically added elements (like async data)
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((nodeObj) => {
          if (nodeObj instanceof HTMLElement) {
            if (nodeObj.matches(SELECTOR)) {
              observer.observe(nodeObj);
            }
            nodeObj.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
              observer.observe(el);
            });
          }
        });
      });
    });

    mutationObserver.observe(node, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [node]);

  return setNode;
}
