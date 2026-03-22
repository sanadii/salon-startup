import { useEffect, useRef, type RefObject } from 'react';

/**
 * Basic modal a11y: initial focus, Escape to close, aria-modal.
 */
export function useModalAccessibility(
  isOpen: boolean,
  onClose: () => void,
  rootRef: RefObject<HTMLElement | null>
) {
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const root = rootRef.current;
    const focusable = root?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previouslyFocused.current?.focus?.();
    };
  }, [isOpen, onClose, rootRef]);
}
