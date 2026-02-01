"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Github, Shield, Radio, Wifi, Lock } from "lucide-react"
import dynamic from "next/dynamic"

const PacketVisualizer = dynamic(() => import("@/components/PacketVisualizer"), {
  ssr: false,
  loading: () => <div className="h-96 border border-white/10 animate-pulse" />,
})

const MessageTerminal = dynamic(() => import("@/components/MessageTerminal"), {
  ssr: false,
  loading: () => <div className="h-full border border-white/10 animate-pulse" />,
})

interface Stats {
  packetsTransmitted: number
  bytesTransferred: number
  encryptionRate: number
  latency: number
}

export default function EchoProtocolPage() {
  const [stats, setStats] = useState<Stats>({
    packetsTransmitted: 0,
    bytesTransferred: 0,
    encryptionRate: 100,
    latency: 12,
  })
  const [isConnected, setIsConnected] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        packetsTransmitted: prev.packetsTransmitted + Math.floor(Math.random() * 10),
        bytesTransferred: prev.bytesTransferred + Math.floor(Math.random() * 2048),
        encryptionRate: 95 + Math.random() * 5,
        latency: 8 + Math.random() * 20,
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleMessageSent = (content: string, encrypted: boolean) => {
    setStats((prev) => ({
      ...prev,
      packetsTransmitted: prev.packetsTransmitted + 1,
      bytesTransferred: prev.bytesTransferred + content.length * (encrypted ? 2 : 1),
    }))
  }

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="font-mono text-xs tracking-wider text-muted-foreground hover:text-white transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              BACK
            </Link>
            <span className="font-mono text-[10px] tracking-[0.3em] text-[#2563eb]">
              OBARO LABS
            </span>
            <span className="font-mono text-[10px] tracking-wider text-muted-foreground">
              // ECHO PROTOCOL v1.0
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/kloudski/echo-protocol"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs tracking-wider text-muted-foreground hover:text-white transition-colors flex items-center gap-2"
            >
              <Github className="w-4 h-4" />
              SOURCE
            </a>
          </div>
        </div>
      </header>

      {/* Status Bar */}
      <div className="border-b border-white/10 px-6 py-3 flex items-center justify-between bg-white/[0.01]">
        <div className="flex items-center gap-8">
          <button
            onClick={() => setIsConnected(!isConnected)}
            className="flex items-center gap-2"
          >
            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-[#10b981]" : "bg-[#ef4444]"} animate-pulse`} />
            <span className="font-mono text-[10px] tracking-wider text-muted-foreground">
              {isConnected ? "MESH ACTIVE" : "DISCONNECTED"}
            </span>
          </button>
          <div className="flex items-center gap-4 font-mono text-[10px]">
            <span className="text-muted-foreground">
              <Radio className="w-3 h-3 inline mr-1" />
              PACKETS: <span className="text-[#2563eb]">{stats.packetsTransmitted}</span>
            </span>
            <span className="text-muted-foreground">
              <Wifi className="w-3 h-3 inline mr-1" />
              TRANSFER: <span className="text-[#06b6d4]">{formatBytes(stats.bytesTransferred)}</span>
            </span>
            <span className="text-muted-foreground">
              <Lock className="w-3 h-3 inline mr-1" />
              ENCRYPTED: <span className="text-[#8b5cf6]">{stats.encryptionRate.toFixed(1)}%</span>
            </span>
            <span className="text-muted-foreground">
              <Shield className="w-3 h-3 inline mr-1" />
              LATENCY: <span className="text-[#10b981]">{stats.latency.toFixed(0)}ms</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <p className="font-mono text-[10px] tracking-[0.3em] text-[#2563eb] mb-2">
            01 — SECURE COMMUNICATIONS
          </p>
          <h1 className="text-4xl font-light tracking-tight text-white">
            P2P Echo Protocol
          </h1>
          <p className="font-mono text-sm text-muted-foreground mt-2">
            End-to-end encrypted mesh network with real-time packet inspection
          </p>
        </motion.div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <PacketVisualizer />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="h-[600px]"
          >
            <MessageTerminal onMessageSent={handleMessageSent} />
          </motion.div>
        </div>

        {/* Protocol Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 border border-white/10 bg-white/[0.02] p-6"
        >
          <p className="font-mono text-[10px] tracking-[0.3em] text-[#2563eb] mb-4">
            PROTOCOL SPECIFICATION
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="font-mono text-[10px] text-muted-foreground mb-1">ENCRYPTION</p>
              <p className="font-mono text-sm text-white">AES-256-GCM</p>
            </div>
            <div>
              <p className="font-mono text-[10px] text-muted-foreground mb-1">KEY EXCHANGE</p>
              <p className="font-mono text-sm text-white">X25519</p>
            </div>
            <div>
              <p className="font-mono text-[10px] text-muted-foreground mb-1">SIGNATURE</p>
              <p className="font-mono text-sm text-white">Ed25519</p>
            </div>
            <div>
              <p className="font-mono text-[10px] text-muted-foreground mb-1">TRANSPORT</p>
              <p className="font-mono text-sm text-white">WebRTC / QUIC</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-4 mt-8">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] tracking-widest text-muted-foreground">
            OBARO LABS // ECHO PROTOCOL ALPHA
          </p>
          <p className="font-mono text-[10px] tracking-widest text-muted-foreground">
            © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </main>
  )
}
