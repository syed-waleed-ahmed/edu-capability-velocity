
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
  onresult: ((event: unknown) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
);

export function ChatInput() {
  const { selectedAgent, inputText, setInputText, sendMessage, isLoading } = useChatContext();
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [supportsSpeech, setSupportsSpeech] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
      setSupportsSpeech(Boolean(ctor));
    }
    setMounted(true);
  }, []);

  // Auto-request microphone permission on page load so the browser prompts
  // "Allow / Block" immediately instead of waiting for the user to click Mic.
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices) return;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
      } catch {
        // User denied or API unavailable — handled when they click Mic
      }
    })();
  }, []);

  // Auto-dismiss mic error after 8 seconds
  useEffect(() => {
    if (!micError) return;
    const timer = window.setTimeout(() => setMicError(null), 8000);
    return () => window.clearTimeout(timer);
  }, [micError]);

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

  const toggleListening = async () => {
    setMicError(null);

    const Ctor = typeof window !== "undefined" ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

    if (!supportsSpeech || !Ctor) {
      setMicError("Voice input is not available in this browser.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    // Step 1 & 2 combined: Request mic access via getUserMedia.
    // This handles both the initial prompt and re-checking after permission changes.
    // We skip the Permissions API check because it can return stale "denied" state
    // even after the user has re-enabled the microphone in site settings.
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
    } catch {
      setMicError(
        "Microphone access denied. Please enable it in your browser's address bar (click the lock/tune icon 🔒 → Site Settings → Microphone → Allow) and reload."
      );
      setIsListening(false);
      return;
    }

    // Step 3: Start speech recognition
    try {
      const recognition = new Ctor();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        const errCode = event.error || "unknown";
        if (errCode === "not-allowed") {
          setMicError(
            "Microphone blocked. Click the lock/tune icon 🔒 in your address bar → Site Settings → Microphone → Allow, then reload."
          );
        } else {
          setMicError(`Microphone error: ${errCode}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    } catch (err: unknown) {
      setIsListening(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setMicError("Microphone error: " + ((err as any)?.message || "unknown error"));
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
            <MicIcon />
            {isListening ? "Stop" : "Mic"}
          </button>
        )}

        <button
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className={styles.sendButton}
        >
          <SendIcon />
          Send
        </button>
      </form>
      {micError && (
        <div className={styles.micErrorBanner}>
          <span>{micError}</span>
          <button
            type="button"
            className={styles.micErrorDismiss}
            onClick={() => setMicError(null)}
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
