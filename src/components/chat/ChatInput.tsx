"use client";

import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useChatContext } from "@/context/ChatContext";
import styles from "./ChatInput.module.css";

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
  resultIndex: number;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionCtor {
  new (): SpeechRecognitionLike;
}

declare global {
  interface Window {
    webkitSpeechRecognition?: SpeechRecognitionCtor;
    SpeechRecognition?: SpeechRecognitionCtor;
  }
}

export function ChatInput() {
  const { selectedAgent, inputText, setInputText, sendMessage, isLoading } =
    useChatContext();

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [isListening, setIsListening] = useState(false);

  const speechRecognitionCtor = useMemo<SpeechRecognitionCtor | undefined>(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    return window.SpeechRecognition ?? window.webkitSpeechRecognition;
  }, []);

  const supportsSpeech = Boolean(speechRecognitionCtor);

  useEffect(() => {
    if (!speechRecognitionCtor) {
      recognitionRef.current = null;
      return;
    }

    const recognition = new speechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      const transcripts: string[] = [];

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result?.[0]?.transcript?.trim();

        if (result?.isFinal && transcript) {
          transcripts.push(transcript);
        }
      }

      const spokenText = transcripts.join(" ").trim();
      if (!spokenText) {
        return;
      }

      setInputText((current) => {
        const prefix = current.trimEnd();
        return prefix ? `${prefix} ${spokenText}` : spokenText;
      });
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [setInputText, speechRecognitionCtor]);

  const handleSubmit = async (event?: FormEvent) => {
    event?.preventDefault();

    if (!inputText.trim() || isLoading) {
      return;
    }

    const text = inputText;
    setInputText("");
    await sendMessage({ text });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit();
    }
  };

  const toggleListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition || !supportsSpeech || isLoading) {
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      return;
    }

    try {
      recognition.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <textarea
          value={inputText}
          onChange={(event) => setInputText(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Ask ${selectedAgent.name} to generate learning materials...`}
          className={styles.input}
          rows={1}
          aria-label="Message input"
        />

        <button
          type="button"
          className={isListening ? styles.micButtonActive : styles.micButton}
          onClick={toggleListening}
          disabled={!supportsSpeech || isLoading}
          aria-label={isListening ? "Stop voice input" : "Start voice input"}
          title={
            supportsSpeech
              ? "Voice to text"
              : "Voice input is not available in this browser"
          }
        >
          {isListening ? "Stop" : "Mic"}
        </button>

        <button
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className={styles.sendButton}
        >
          Send
        </button>
      </form>
      <p className={styles.hint}>
        Enter to send, Shift+Enter for a new line
        {supportsSpeech ? " - mic enabled" : " - mic unavailable"}
      </p>
    </div>
  );
}
