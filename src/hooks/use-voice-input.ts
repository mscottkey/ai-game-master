
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

interface VoiceInputOptions {
  onTranscript: (transcript: string) => void;
  onEnd?: () => void;
  onError?: (event: any) => void;
}

// Type guard for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export const useVoiceInput = ({ onTranscript, onEnd, onError }: VoiceInputOptions) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      setIsSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
           onTranscript(finalTranscript);
        }
      };
      
      recognition.onend = () => {
        setIsListening(false);
        if (onEnd) {
          onEnd();
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        if (onError) {
          onError(event);
        }
        setIsListening(false);
      };

    }
  }, [onTranscript, onEnd, onError]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error("Could not start voice recognition: ", error);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  return { isListening, startListening, stopListening, isSupported, transcript: '' }; // transcript is handled by callback
};
