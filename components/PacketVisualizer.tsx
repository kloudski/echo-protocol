"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface Packet {
  id: string
  sender: string
  receiver: string
  size: number
  encrypted: boolean
  timestamp: number
  status: "pending" | "transit" | "delivered" | "failed"
  payload: string
}

export default function PacketVisualizer() {
  const [packets, setPackets] = useState<Packet[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // Generate packets periodically
    const interval = setInterval(() => {
      const newPacket: Packet = {
        id: `pkt-${Date.now()}`,
        sender: `NODE_${Math.floor(Math.random() * 8).toString(16).toUpperCase()}`,
        receiver: `NODE_${Math.floor(Math.random() * 8).toString(16).toUpperCase()}`,
        size: Math.floor(Math.random() * 1024) + 64,
        encrypted: Math.random() > 0.2,
        timestamp: Date.now(),
        status: "pending",
        payload: Array.from({ length: 32 }, () =>
          Math.floor(Math.random() * 256).toString(16).padStart(2, "0")
        ).join(" "),
      }

      setPackets((prev) => {
        const updated = [...prev, newPacket].slice(-20)
        // Update statuses
        return updated.map((p) => {
          const age = Date.now() - p.timestamp
          if (age > 3000) return { ...p, status: Math.random() > 0.1 ? "delivered" : "failed" }
          if (age > 1000) return { ...p, status: "transit" }
          return p
        })
      })
    }, 800)

    return () => clearInterval(interval)
  }, [])

  // Draw network visualization
  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = "#0a0a0a"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw network nodes
    const nodes = 8
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(canvas.width, canvas.height) * 0.35

    // Draw connections
    ctx.strokeStyle = "rgba(37, 99, 235, 0.1)"
    ctx.lineWidth = 1

    for (let i = 0; i < nodes; i++) {
      const angle1 = (i / nodes) * Math.PI * 2
      const x1 = centerX + Math.cos(angle1) * radius
      const y1 = centerY + Math.sin(angle1) * radius

      for (let j = i + 1; j < nodes; j++) {
        const angle2 = (j / nodes) * Math.PI * 2
        const x2 = centerX + Math.cos(angle2) * radius
        const y2 = centerY + Math.sin(angle2) * radius

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }
    }

    // Draw nodes
    for (let i = 0; i < nodes; i++) {
      const angle = (i / nodes) * Math.PI * 2
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius

      // Node glow
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 20)
      gradient.addColorStop(0, "rgba(37, 99, 235, 0.3)")
      gradient.addColorStop(1, "rgba(37, 99, 235, 0)")
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(x, y, 20, 0, Math.PI * 2)
      ctx.fill()

      // Node
      ctx.fillStyle = "#2563eb"
      ctx.beginPath()
      ctx.arc(x, y, 6, 0, Math.PI * 2)
      ctx.fill()

      // Node label
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
      ctx.font = "10px monospace"
      ctx.textAlign = "center"
      ctx.fillText(`${i.toString(16).toUpperCase()}`, x, y + 20)
    }

    // Draw active packet paths
    const transitPackets = packets.filter((p) => p.status === "transit")
    transitPackets.forEach((packet) => {
      const senderIdx = parseInt(packet.sender.split("_")[1], 16)
      const receiverIdx = parseInt(packet.receiver.split("_")[1], 16)

      const angle1 = (senderIdx / nodes) * Math.PI * 2
      const angle2 = (receiverIdx / nodes) * Math.PI * 2

      const x1 = centerX + Math.cos(angle1) * radius
      const y1 = centerY + Math.sin(angle1) * radius
      const x2 = centerX + Math.cos(angle2) * radius
      const y2 = centerY + Math.sin(angle2) * radius

      // Animated line
      ctx.strokeStyle = packet.encrypted ? "#8b5cf6" : "#06b6d4"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()

      // Packet indicator
      const progress = (Date.now() - packet.timestamp - 1000) / 2000
      const px = x1 + (x2 - x1) * Math.min(1, Math.max(0, progress))
      const py = y1 + (y2 - y1) * Math.min(1, Math.max(0, progress))

      ctx.fillStyle = packet.encrypted ? "#8b5cf6" : "#06b6d4"
      ctx.beginPath()
      ctx.arc(px, py, 4, 0, Math.PI * 2)
      ctx.fill()
    })
  }, [packets])

  return (
    <div className="border border-white/10 bg-white/[0.02] p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.3em] text-[#2563eb] mb-1">
            NETWORK TOPOLOGY
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            Real-time packet visualization
          </p>
        </div>
        <div className="flex gap-4 font-mono text-[10px]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
            <span className="text-muted-foreground">ENCRYPTED</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#06b6d4]" />
            <span className="text-muted-foreground">PLAINTEXT</span>
          </div>
        </div>
      </div>

      <div className="relative aspect-square border border-white/10 bg-black/50">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="w-full h-full"
        />
      </div>

      {/* Packet Log */}
      <div className="mt-4 h-32 overflow-y-auto border border-white/10 bg-white/[0.01] p-3">
        <p className="font-mono text-[10px] tracking-wider text-muted-foreground mb-2">
          PACKET LOG
        </p>
        <AnimatePresence>
          {packets.slice(-5).reverse().map((packet) => (
            <motion.div
              key={packet.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="font-mono text-[10px] flex items-center gap-2 py-1 border-b border-white/5"
            >
              <span className={`w-2 h-2 rounded-full ${
                packet.status === "delivered" ? "bg-[#10b981]" :
                packet.status === "failed" ? "bg-[#ef4444]" :
                packet.status === "transit" ? "bg-[#2563eb]" :
                "bg-white/30"
              }`} />
              <span className="text-muted-foreground">
                {packet.sender} → {packet.receiver}
              </span>
              <span className={packet.encrypted ? "text-[#8b5cf6]" : "text-[#06b6d4]"}>
                {packet.encrypted ? "ENC" : "PLN"}
              </span>
              <span className="text-white/50">{packet.size}B</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
