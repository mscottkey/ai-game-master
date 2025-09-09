
"use client";

import { useState, useEffect, useCallback } from 'react';

export const useTTS = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);

      // This ensures that isSpeaking is reset if the user navigates away or closes the tab.
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

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error("SpeechSynthesis Error", e);
      setIsSpeaking(false);
    };

    window.speechSynthesis.cancel(); // Clear any previous utterances
    window.speechSynthesis.speak(utterance);
  }, [isSupported, isSpeaking]);

  return { speak, isSpeaking, isSupported };
};
