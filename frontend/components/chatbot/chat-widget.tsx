"use client";

import { useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
};

type ChatResponse = {
  success: boolean;
  data?: {
    answer: string;
    source: string;
  };
  message?: string;
};

type ChatWidgetProps = {
  position?: "left" | "right" | "bottom";
};

async function askChatbot(question: string) {
  const response = await fetch("/api/chatbot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  const payload = (await response.json()) as ChatResponse;

  if (!response.ok || !payload.data?.answer) {
    return payload.message ?? "Sorry, I could not find an answer from the project database.";
  }

  return payload.data.answer;
}

export default function ChatWidget({ position = "bottom" }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hi! I am the Smart Commerce rule + database chatbot. Ask me about products, orders, dashboards, low stock, demand forecast, accounts, or project setup.",
      sender: "bot",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSendMessage() {
    const currentInput = inputValue.trim();

    if (!currentInput || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: currentInput,
      sender: "user",
    };

    setMessages((current) => [...current, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const answer = await askChatbot(currentInput);
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: answer,
        sender: "bot",
      };

      setMessages((current) => [...current, botMessage]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: `bot-${Date.now()}`,
          text: "The chatbot service is unavailable right now. Please try again.",
          sender: "bot",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  const positionClasses = {
    left: "left-4 bottom-4",
    right: "right-4 bottom-4",
    bottom: "left-1/2 -translate-x-1/2 bottom-4",
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 font-sans`}>
      {isOpen && (
        <div className="mb-4 flex max-h-[32rem] w-[calc(100vw-2rem)] max-w-96 flex-col rounded-lg border border-gray-200 bg-white shadow-2xl animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between rounded-t-lg bg-orange-600 p-4 text-white">
            <div>
              <h3 className="text-lg font-bold">Smart Commerce Support</h3>
              <p className="text-xs opacity-90">Rule + project database answers</p>
            </div>
            <button
              type="button"
              aria-label="Close chat"
              onClick={() => setIsOpen(false)}
              className="rounded p-1 text-white hover:bg-orange-700"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs rounded-lg px-4 py-2 ${
                    message.sender === "user"
                      ? "rounded-br-none bg-orange-600 text-white"
                      : "rounded-bl-none bg-gray-200 text-gray-900"
                  }`}
                >
                  <p className="whitespace-pre-line text-sm leading-relaxed">{message.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-lg rounded-bl-none bg-gray-200 px-4 py-2 text-gray-900">
                  <div className="flex space-x-2">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500 delay-100" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500 delay-200" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-b-lg border-t border-gray-200 bg-white p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    void handleSendMessage();
                  }
                }}
                placeholder="Ask about project data..."
                className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-600 focus:outline-none"
              />
              <button
                type="button"
                aria-label="Send message"
                onClick={() => void handleSendMessage()}
                disabled={isLoading}
                className="rounded-lg bg-orange-600 p-2 text-white hover:bg-orange-700 disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        aria-label={isOpen ? "Close chat" : "Open chat"}
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full bg-orange-600 p-4 text-white shadow-lg transition-all duration-300 hover:bg-orange-700"
      >
        <MessageCircle size={24} />
      </button>
    </div>
  );
}
