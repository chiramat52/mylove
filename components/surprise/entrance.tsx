"use client"

import { useState, useEffect, useCallback, useRef } from "react"

function HeartIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

interface EntranceProps {
  onEnter: () => void
  viewPassword: string
  adminPassword: string
  onAdmin: () => void
}

export function Entrance({ onEnter, viewPassword, adminPassword, onAdmin }: EntranceProps) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [shake, setShake] = useState(false)
  const [counting, setCounting] = useState(false)
  const [count, setCount] = useState(3)
  const [fadeOut, setFadeOut] = useState(false)
  const [cardVisible, setCardVisible] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Card enter animation
  useEffect(() => {
    const t = setTimeout(() => setCardVisible(true), 300)
    return () => clearTimeout(t)
  }, [])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (counting) return

      if (password === adminPassword) {
        setCounting(true)
        // After countdown finishes, trigger admin
        return
      }

      if (password === viewPassword) {
        setCounting(true)
        return
      }

      // Wrong password
      setError("รหัสไม่ถูกต้อง ลองใหม่อีกครั้ง")
      setShake(true)
      setTimeout(() => setShake(false), 500)
      setPassword("")
      inputRef.current?.focus()
    },
    [password, viewPassword, adminPassword, counting]
  )

  // Countdown logic
  useEffect(() => {
    if (!counting) return

    if (count === 0) {
      setFadeOut(true)
      const timer = setTimeout(() => {
        if (password === adminPassword) {
          onAdmin()
        } else {
          onEnter()
        }
      }, 800)
      return () => clearTimeout(timer)
    }

    const timer = setTimeout(() => {
      setCount((prev) => prev - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [counting, count, onEnter, onAdmin, password, adminPassword])

  return (
    <div
      className="fixed inset-0 flex items-center justify-center transition-opacity duration-700"
      style={{
        zIndex: 10,
        opacity: fadeOut ? 0 : 1,
      }}
    >
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, hsl(345, 70%, 12%) 0%, hsl(0, 0%, 5%) 50%, hsl(345, 50%, 8%) 100%)",
        }}
      />

      {/* Decorative glow */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-10"
        style={{
          background: "radial-gradient(circle, hsl(350, 60%, 50%) 0%, transparent 70%)",
          top: "-10%",
          right: "-10%",
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full opacity-10"
        style={{
          background: "radial-gradient(circle, hsl(350, 60%, 40%) 0%, transparent 70%)",
          bottom: "-5%",
          left: "-5%",
        }}
      />

      {/* Countdown overlay */}
      {counting && count > 0 && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 20 }}>
          <div
            key={count}
            className="flex flex-col items-center gap-4"
            style={{ animation: "countdown-pop 0.9s ease-out forwards" }}
          >
            <span
              className="font-mono font-bold tabular-nums"
              style={{
                fontSize: "clamp(100px, 25vw, 200px)",
                color: "hsl(350, 60%, 65%)",
                textShadow: "0 0 60px hsla(350, 60%, 55%, 0.5), 0 0 120px hsla(350, 60%, 45%, 0.3)",
                lineHeight: 1,
              }}
            >
              {count}
            </span>
          </div>
        </div>
      )}

      {/* Flash when count hits 0 */}
      {counting && count === 0 && (
        <div
          className="absolute inset-0"
          style={{
            zIndex: 20,
            background: "hsl(350, 60%, 65%)",
            animation: "flash-out 0.8s ease-out forwards",
          }}
        />
      )}

      {/* Main card */}
      <div
        className={`relative glass-strong rounded-2xl p-8 md:p-12 mx-4 max-w-md w-full animate-pulse-glow transition-all duration-700 ${shake ? "animate-[shake_0.5s_ease-in-out]" : ""}`}
        style={{
          boxShadow: "0 0 60px rgba(180, 80, 100, 0.1), inset 0 1px 0 rgba(255,255,255,0.1)",
          opacity: counting ? 0 : cardVisible ? 1 : 0,
          transform: counting ? "scale(0.9)" : cardVisible ? "scale(1) translateY(0)" : "scale(0.95) translateY(20px)",
        }}
      >
        {/* Heart icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <HeartIcon
              className="w-12 h-12 animate-heartbeat"
              style={{ color: "hsl(350, 60%, 65%)" }}
            />
            <div
              className="absolute inset-0 w-12 h-12 rounded-full blur-xl opacity-40"
              style={{ backgroundColor: "hsl(350, 60%, 65%)" }}
            />
          </div>
        </div>

        {/* Title */}
        <h1
          className="text-center text-2xl md:text-3xl font-light tracking-wider mb-2"
          style={{ color: "hsl(350, 40%, 80%)" }}
        >
          Our Memories
        </h1>
        <p className="text-center text-muted-foreground text-sm mb-8 font-light leading-relaxed">
          {"ใส่รหัสเพื่อเข้าสู่ความทรงจำของเรา..."}
        </p>

        {/* Password form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError("")
              }}
              placeholder="Enter password"
              className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-light tracking-wide outline-none transition-all duration-300 focus:ring-1"
              style={{
                backgroundColor: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "hsl(0, 0%, 90%)",
              }}
              autoFocus
            />
          </div>

          {error && (
            <p className="text-xs font-light text-center" style={{ color: "hsl(350, 60%, 60%)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            className="group relative w-full py-3.5 rounded-xl font-medium text-sm tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
            style={{
              background: "linear-gradient(135deg, hsl(350, 60%, 45%), hsl(345, 70%, 30%))",
              color: "hsl(350, 40%, 92%)",
            }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 45%, rgba(255,255,255,0.12) 55%, transparent 60%)",
                animation: "shine 2s infinite",
              }}
            />
            <span className="relative flex items-center justify-center gap-2">
              <HeartIcon className="w-4 h-4" style={{ color: "currentColor" }} />
              {"เข้าสู่ความทรงจำ"}
            </span>
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-[rgba(255,255,255,0.06)]">
          <p className="text-center text-xs text-muted-foreground font-light opacity-50">
            {"Made with love"}
          </p>
        </div>
      </div>

      {/* Keyframes */}
      <style jsx>{`
        @keyframes countdown-pop {
          0% {
            opacity: 0;
            transform: scale(2.5);
          }
          20% {
            opacity: 1;
            transform: scale(1);
          }
          80% {
            opacity: 1;
            transform: scale(1.05);
          }
          100% {
            opacity: 0;
            transform: scale(0.5);
          }
        }
        @keyframes flash-out {
          0% {
            opacity: 0.8;
          }
          100% {
            opacity: 0;
          }
        }
        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  )
}
