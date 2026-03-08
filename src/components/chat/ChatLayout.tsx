"use client";

import { ChatProvider } from "@/context/ChatContext";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import styles from "./ChatLayout.module.css";

export function ChatLayout() {
  return (
    <ChatProvider>
      <div className={styles.layout}>
        <ChatHeader />
        <ChatMessages />
        <ChatInput />
      </div>
    </ChatProvider>
  );
}
