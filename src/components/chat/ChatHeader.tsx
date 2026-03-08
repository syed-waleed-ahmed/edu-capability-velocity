"use client";

import { useChatContext } from "@/context/ChatContext";
import { AGENTS } from "@/config/agents.config";
import Link from "next/link";
import styles from "./ChatHeader.module.css";

export function ChatHeader() {
  const { selectedAgent, setSelectedAgentId, clearMessages } = useChatContext();

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <span className={styles.brandIcon}>⚡</span>
        <div>
          <h1 className={styles.brandTitle}>EDU Capability Velocity</h1>
          <p className={styles.brandSubtitle}>Micro-Experience Prototypes</p>
        </div>
      </div>

      <div className={styles.actions}>
        <div className={styles.agentTabs}>
          {AGENTS.map((agent) => {
            const isActive = selectedAgent.id === agent.id;
            return (
              <button
                key={agent.id}
                className={isActive ? styles.agentTabActive : styles.agentTab}
                onClick={() => setSelectedAgentId(agent.id)}
                style={
                  isActive
                    ? {
                        background: `${agent.color}22`,
                        borderColor: `${agent.color}44`,
                        color: agent.color,
                      }
                    : undefined
                }
              >
                <span className={styles.tabIcon}>{agent.icon}</span>
                {agent.name}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className={styles.resetButton}
          onClick={clearMessages}
        >
          New chat
        </button>

        <div className={styles.legalLinks}>
          <Link className={styles.legalLink} href="/legal/terms">
            Terms
          </Link>
          <Link className={styles.legalLink} href="/legal/privacy">
            Privacy
          </Link>
        </div>
      </div>
    </header>
  );
}
