"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Lock, Unlock, Shield } from "lucide-react"

interface Message {
  id: string
  content: string
  encrypted: boolean
  sender: "local" | "remote"
  timestamp: number
  hash: string
}

interface MessageTerminalProps {
  onMessageSent?: (content: string, encrypted: boolean) => void
}

export default function MessageTerminal({ onMessageSent }: MessageTerminalProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isEncrypted, setIsEncrypted] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const generateHash = () => {
    return Array.from({ length: 8 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("")
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Simulate incoming messages
  useEffect(() => {
    const responses = [
      "SIGNAL RECEIVED. PROCESSING.",
      "ACKNOWLEDGED. ENCRYPTION VERIFIED.",
      "DATA INTEGRITY CONFIRMED.",
      "ROUTING THROUGH SECURE TUNNEL.",
      "HANDSHAKE COMPLETE. CHANNEL OPEN.",
    ]

    const interval = setInterval(() => {
      if (messages.length > 0 && Math.random() > 0.7) {
        const newMessage: Message = {
          id: `msg-${Date.now()}`,
          content: responses[Math.floor(Math.random() * responses.length)],
          encrypted: Math.random() > 0.2,
          sender: "remote",
          timestamp: Date.now(),
          hash: generateHash(),
        }
        setMessages((prev) => [...prev, newMessage])
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content: input.trim(),
      encrypted: isEncrypted,
      sender: "local",
      timestamp: Date.now(),
      hash: generateHash(),
    }

    setMessages((prev) => [...prev, newMessage])
    onMessageSent?.(input.trim(), isEncrypted)
    setInput("")
  }

  return (
    <div className="border border-white/10 bg-white/[0.02] p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.3em] text-[#2563eb] mb-1">
            SECURE TERMINAL
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            End-to-end encrypted channel
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isEncrypted ? "bg-[#10b981]" : "bg-yellow-500"} animate-pulse`} />
          <span className="font-mono text-[10px] text-muted-foreground">
            {isEncrypted ? "E2E ACTIVE" : "UNENCRYPTED"}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto border border-white/10 bg-black/50 p-4 mb-4 min-h-0">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Shield className="w-8 h-8 text-[#2563eb]/30 mx-auto mb-2" />
              <p className="font-mono text-[10px] text-muted-foreground">
                AWAITING TRANSMISSION
              </p>
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mb-3 ${message.sender === "local" ? "ml-8" : "mr-8"}`}
            >
              <div
                className={`p-3 border ${
                  message.sender === "local"
                    ? message.encrypted
                      ? "border-[#8b5cf6]/30 bg-[#8b5cf6]/5"
                      : "border-[#06b6d4]/30 bg-[#06b6d4]/5"
                    : "border-white/10 bg-white/[0.02]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[8px] text-muted-foreground">
                    {message.sender === "local" ? "TX" : "RX"}
                  </span>
                  {message.encrypted ? (
                    <Lock className="w-3 h-3 text-[#8b5cf6]" />
                  ) : (
                    <Unlock className="w-3 h-3 text-[#06b6d4]" />
                  )}
                  <span className="font-mono text-[8px] text-muted-foreground ml-auto">
                    #{message.hash}
                  </span>
                </div>
                <p className="font-mono text-xs text-white/80">
                  {message.content}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsEncrypted(!isEncrypted)}
            className={`p-3 border transition-colors ${
              isEncrypted
                ? "border-[#8b5cf6]/50 bg-[#8b5cf6]/10 text-[#8b5cf6]"
                : "border-[#06b6d4]/50 bg-[#06b6d4]/10 text-[#06b6d4]"
            }`}
          >
            {isEncrypted ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>
          <div className="flex-1 border border-white/10 bg-white/[0.02] focus-within:border-[#2563eb]/50 transition-colors">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter message..."
              className="w-full bg-transparent px-4 py-3 font-mono text-sm text-white placeholder:text-white/30 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-3 border border-[#2563eb]/50 bg-[#2563eb]/10 text-[#2563eb] hover:bg-[#2563eb]/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="font-mono text-[9px] text-muted-foreground">
          {isEncrypted
            ? "MESSAGE WILL BE ENCRYPTED WITH AES-256-GCM"
            : "WARNING: MESSAGE WILL BE SENT UNENCRYPTED"}
        </p>
      </form>
    </div>
  )
}
