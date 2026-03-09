"use client";

import { ChatProvider } from "@/context/ChatContext";
import { ChatHeader } from "./ChatHeader";
import { ChatHistoryDrawer } from "./ChatHistoryDrawer";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import styles from "./ChatLayout.module.css";

export function ChatLayout() {
  return (
    <ChatProvider>
      <div className={styles.layout}>
        <ChatHeader />
        <section className={styles.workspace}>
          <div className={styles.chatPane}>
            <ChatMessages />
            <ChatInput />
          </div>
          <ChatHistoryDrawer />
        </section>
      </div>
    </ChatProvider>
  );
}
