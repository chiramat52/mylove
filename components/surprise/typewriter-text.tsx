"use client"

import { useState, useEffect } from "react"

interface TypewriterTextProps {
  text: string
  speed?: number
  delay?: number
  onComplete?: () => void
  className?: string
}

export function TypewriterText({
  text,
  speed = 60,
  delay = 0,
  onComplete,
  className = "",
}: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState("")
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), delay)
    return () => clearTimeout(startTimer)
  }, [delay])

  useEffect(() => {
    if (!started) return

    let index = 0
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1))
        index++
      } else {
        clearInterval(interval)
        onComplete?.()
      }
    }, speed)

    return () => clearInterval(interval)
  }, [started, text, speed, onComplete])

  return (
    <span className={className}>
      {displayText}
      {started && displayText.length < text.length && (
        <span
          className="inline-block w-0.5 h-[1.1em] ml-0.5 align-text-bottom"
          style={{
            backgroundColor: "hsl(350, 60%, 65%)",
            animation: "typewriter-blink 0.8s ease-in-out infinite",
          }}
        />
      )}
    </span>
  )
}
