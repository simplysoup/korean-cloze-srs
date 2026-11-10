import {
  createContext, useCallback, useContext, useEffect, useRef, useState,
  type ReactNode,
} from 'react';
import type { VocabController } from '../contracts';
import { filterDeckPrompts, type VocabularyMode } from './presentation';
import {
  advanceSession, createSession, currentPrompt, repeatMissed,
  retryNearMiss, sessionKey, withFeedback, type VocabularySessionState,
} from './session-state';

interface VocabularyRuntime {
  controller: VocabController | null;
  session: VocabularySessionState | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  openSession: (mode: VocabularyMode, deckId: string | null) => Promise<void>;
  submit: (answer: string) => Promise<void>;
  reveal: () => Promise<void>;
  next: () => void;
  retry: () => void;
  reviewMissed: () => void;
  clearError: () => void;
}

const Context = createContext<VocabularyRuntime | null>(null);

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

/**
 * This provider holds ONLY the active presentation queue while mounted.
 * Every review is committed by the injected VocabController, never by a
 * parallel UI scheduler. The integration lead mounts it above the router.
 * Remounting a route restores the active queue; app restart re-queries the
 * controller so previously saved answers are never fabricated.
 */
export function VocabularyProvider({
  controller, children,
}: {
  controller: VocabController | null;
  children: ReactNode;
}) {
  const [session, setSession] = useState<VocabularySessionState | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<VocabularySessionState | null>(null);
  const requestRef = useRef(0);
  const previousController = useRef(controller);
  const busyRef = useRef(false);

  const put = useCallback((next: VocabularySessionState | null) => {
    sessionRef.current = next;
    setSession(next);
  }, []);

  useEffect(() => {
    // On first mount there is no previous queue to invalidate. On account
    // change, Agent 00 must also key/remount the provider by account ID.
    if (previousController.current === controller) return;
    previousController.current = controller;
    requestRef.current += 1;
    sessionRef.current = null;
    Promise.resolve().then(() => {
      setSession(null);
      setError(null);
    });
  }, [controller]);

  const openSession = useCallback(async (mode: VocabularyMode, deckId: string | null) => {
    if (!controller) {
      setError('Vocabulary review is not connected yet.');
      return;
    }
    const key = sessionKey(mode, deckId);
    const existing = sessionRef.current;
    if (existing?.key === key && existing.phase !== 'complete') {
      setSession(existing);
      setLoading(false);
      setError(null);
      return;
    }
    const request = ++requestRef.current;
    setLoading(true);
    setError(null);
    try {
      const underlyingMode = mode === 'missed' ? 'review' : mode;
      // VocabController v1 offers a global queue only. Request all currently
      // available starter prompts before filtering to a selected deck.
      // Agent 00 should add a deck-scoped query for future large catalogs.
      const missedProgress = async () => {
        if (mode !== 'missed') return [];
        if (deckId) return controller.getProgress(deckId);
        const decks = await controller.listDecks();
        const perDeck = await Promise.all(decks.map((deck) => controller.getProgress(deck.id)));
        return perDeck.flat();
      };
      const [prompts, progress] = await Promise.all([
        controller.getSession(underlyingMode, 500),
        missedProgress(),
      ]);
      if (request !== requestRef.current) return;
      const missedIds = mode === 'missed'
        ? new Set(progress.filter((p) => p.lapseCount > 0).map((p) => p.entryId))
        : undefined;
      put(createSession(mode, deckId, filterDeckPrompts(prompts, deckId, missedIds)));
    } catch (cause) {
      if (request === requestRef.current) {
        setError(errorMessage(cause, 'Could not load vocabulary. Try again.'));
      }
    } finally {
      if (request === requestRef.current) setLoading(false);
    }
  }, [controller, put]);

  const submit = useCallback(async (answer: string) => {
    if (!controller || busyRef.current) return;
    const current = sessionRef.current;
    const prompt = current && current.phase === 'question' ? currentPrompt(current) : null;
    if (!prompt || !answer.trim()) return;
    busyRef.current = true;
    setSaving(true);
    setError(null);
    try {
      const result = await controller.submitAnswer(prompt.id, answer.trim());
      const latest = sessionRef.current;
      if (latest?.phase === 'question' && currentPrompt(latest)?.id === prompt.id) {
        put(withFeedback(latest, { kind: 'graded', result }));
      }
    } catch (cause) {
      setError(errorMessage(cause, 'Could not save that answer. Try again.'));
    } finally {
      busyRef.current = false;
      setSaving(false);
    }
  }, [controller, put]);

  const reveal = useCallback(async () => {
    if (!controller || busyRef.current) return;
    const current = sessionRef.current;
    const prompt = current && current.phase === 'question' ? currentPrompt(current) : null;
    if (!prompt) return;
    busyRef.current = true;
    setSaving(true);
    setError(null);
    try {
      const result = await controller.revealAnswer(prompt.id);
      const latest = sessionRef.current;
      if (latest?.phase === 'question' && currentPrompt(latest)?.id === prompt.id) {
        put(withFeedback(latest, { kind: 'revealed', result }));
      }
    } catch (cause) {
      setError(errorMessage(cause, 'Could not reveal this answer. Try again.'));
    } finally {
      busyRef.current = false;
      setSaving(false);
    }
  }, [controller, put]);

  const next = useCallback(() => {
    const current = sessionRef.current;
    if (current) put(advanceSession(current));
  }, [put]);
  const retry = useCallback(() => {
    const current = sessionRef.current;
    if (current) put(retryNearMiss(current));
  }, [put]);
  const reviewMissed = useCallback(() => {
    const current = sessionRef.current;
    if (current) put(repeatMissed(current));
  }, [put]);

  return (
    <Context.Provider value={{
      controller, session, loading, saving, error, openSession,
      submit, reveal, next, retry, reviewMissed, clearError: () => setError(null),
    }}>
      {children}
    </Context.Provider>
  );
}

/** Null means Agent 00 has not mounted the real controller provider yet. */
export function useVocabularyRuntime(): VocabularyRuntime | null {
  return useContext(Context);
}
