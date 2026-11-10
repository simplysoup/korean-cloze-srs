import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { useIsFocused } from 'expo-router';

/**
 * On web, pressing Enter advances to the next card/step while `enabled`
 * (e.g. after an answer is submitted and the Next button is showing).
 *
 * - Ignored while typing in an input/textarea/select: their Enter submits
 *   the answer (via onSubmitEditing), not advance.
 * - Ignored while a button is focused: its own Enter activates it, so
 *   the handler never double-fires with the button.
 * - Gated on the screen being focused, so a background tab's listener
 *   can't steal Enter from the tab the user is actually on.
 * - No-op on native (no keyboard Enter there).
 *
 * The callback is kept in a ref, so it is always the latest one without
 * re-registering the listener on every render.
 */
export function useEnterToAdvance(enabled: boolean, onAdvance: () => void): void {
  const isFocused = useIsFocused();
  const advanceRef = useRef(onAdvance);
  // Keep the ref on the latest callback (in an effect — refs must not be
  // written during render). No dep array: it re-syncs after every render.
  useEffect(() => {
    advanceRef.current = onAdvance;
  });
  const active = enabled && isFocused;

  useEffect(() => {
    if (Platform.OS !== 'web' || !active) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const tag = target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (tag === 'BUTTON' || target.getAttribute('role') === 'button') return;
      e.preventDefault();
      advanceRef.current();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [active]);
}
