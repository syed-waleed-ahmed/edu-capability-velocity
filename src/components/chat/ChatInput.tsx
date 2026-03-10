
"use client";
import { useRef, useState, useEffect, FormEvent, KeyboardEvent } from "react";
import { useChatContext } from "@/context/ChatContext";
import styles from "./ChatInput.module.css";

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

export function ChatInput() {
  const { selectedAgent, inputText, setInputText, sendMessage, isLoading } = useChatContext();
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const [supportsSpeech, setSupportsSpeech] = useState(false);
  const [speechRecognitionCtor, setSpeechRecognitionCtor] = useState<SpeechRecognitionCtor | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
      setSpeechRecognitionCtor(() => ctor);
      setSupportsSpeech(Boolean(ctor));
    }
  }, []);

  useEffect(() => {
    if (!speechRecognitionCtor) {
      recognitionRef.current = null;
      return;
    }
    const recognition = new speechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setInputText((prev) => (prev ? `${prev} ${finalTranscript}` : finalTranscript));
      }
    };

    recognition.onerror = (event: any) => {
      setMicError("Microphone error: " + (event.error || "unknown"));
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [speechRecognitionCtor, setInputText]);

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
    setMicError(null);
    const recognition = recognitionRef.current;
    if (!recognition || !supportsSpeech || isLoading) {
      if (!supportsSpeech) {
        setMicError("Voice input is not available in this browser.");
      }
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
    } catch (err: any) {
      setIsListening(false);
      setMicError("Microphone error: " + (err?.message || "unknown error"));
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

        {mounted && (
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
        )}

        <button
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className={styles.sendButton}
        >
          Send
        </button>
      </form>
      {micError && (
        <div className={styles.hint} style={{ color: '#dc6e60', fontWeight: 500 }}>
          {micError}
        </div>
      )}
      <p className={styles.hint}>
        Enter to send, Shift+Enter for a new line
        {mounted ? (supportsSpeech ? " - mic enabled" : " - mic unavailable") : null}
      </p>
    </div>
  );


}
