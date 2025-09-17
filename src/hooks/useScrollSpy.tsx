import { useState, useEffect, useRef } from 'react';

/**
 * A custom hook that implements a scroll spy.
 * It observes which element is currently visible in the viewport and returns its ID.
 * @param {string[]} selectors - An array of CSS selectors for the elements to be spied on.
 * @param {IntersectionObserverInit} [options] - Optional configuration for the IntersectionObserver.
 * @returns {string | null} The ID of the currently active element, or null.
 */
export function useScrollSpy(
  selectors: string[],
  options?: IntersectionObserverInit
) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const elements = selectors.map(selector => document.querySelector(selector));

    observer.current?.disconnect();
    observer.current = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    }, options);

    elements.forEach(el => {
      if (el) {
        observer.current?.observe(el);
      }
    });

    return () => observer.current?.disconnect();
  }, [selectors, options]);

  return activeId;
}
