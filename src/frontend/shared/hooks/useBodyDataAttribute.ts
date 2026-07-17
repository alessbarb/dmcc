import { useEffect } from "react";

/**
 * Sets document.body.dataset[name] for the caller's mounted lifetime,
 * restoring whatever value (or absence) was there before. Lets CSS target
 * body[data-x="y"] instead of reaching into the DOM with :has() to detect
 * "is this component currently mounted/open".
 */
export function useBodyDataAttribute(name: string, value: string): void {
  useEffect(() => {
    const { body } = document;
    const previous = body.dataset[name];
    body.dataset[name] = value;
    return () => {
      if (previous === undefined) delete body.dataset[name];
      else body.dataset[name] = previous;
    };
  }, [name, value]);
}
