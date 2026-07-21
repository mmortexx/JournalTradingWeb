"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Returns a ref + boolean indicating whether the element is in the viewport.
 * Used to lazy-mount expensive canvas/animation components only when visible,
 * dramatically reducing runtime memory when many such components exist on a page.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: { rootMargin?: string; once?: boolean } = {}
) {
  const { rootMargin = "200px", once = false } = options;
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setInView(true);
          if (once) obs.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [rootMargin, once]);

  return { ref, inView };
}
