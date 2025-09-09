
"use client";

import { useState, useEffect, useCallback } from 'react';

export const useTTS = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);

      const handleBeforeUnload = () => {
        window.speechSynthesis.cancel();
      };
      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!isSupported) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Clear any previous utterances that might be lingering
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      // Check if this is still the current utterance before setting state
      if (utteranceRef.current === utterance) {
        setIsSpeaking(false);
      }
    };
    utterance.onerror = (event) => {
      // This is a known issue in some browsers when speech is cancelled.
      // We can safely ignore the 'canceled' error.
      if ((event as SpeechSynthesisErrorEvent).error === 'canceled') {
        if (utteranceRef.current === utterance) {
           setIsSpeaking(false);
        }
        return;
      }
      console.error("SpeechSynthesis Error", event);
      if (utteranceRef.current === utterance) {
        setIsSpeaking(false);
      }
    };

    window.speechSynthesis.speak(utterance);
  }, [isSupported, isSpeaking]);

  return { speak, isSpeaking, isSupported };
};
