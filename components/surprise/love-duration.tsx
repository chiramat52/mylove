"use client"

import { useState, useEffect } from "react"

interface LoveDurationProps {
  startDate: string
}

interface Duration {
  years: number
  months: number
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calcDuration(startDate: string): Duration {
  const start = new Date(startDate)
  const now = new Date()
  const diff = now.getTime() - start.getTime()

  const totalSeconds = Math.floor(diff / 1000)
  const totalMinutes = Math.floor(totalSeconds / 60)
  const totalHours = Math.floor(totalMinutes / 60)
  const totalDays = Math.floor(totalHours / 24)

  const years = Math.floor(totalDays / 365.25)
  const remainDays = totalDays - Math.floor(years * 365.25)
  const months = Math.floor(remainDays / 30.44)
  const days = Math.floor(remainDays - months * 30.44)
  const hours = totalHours % 24
  const minutes = totalMinutes % 60
  const seconds = totalSeconds % 60

  return { years, months, days, hours, minutes, seconds }
}

const labels = ["ปี", "เดือน", "วัน", "ชั่วโมง", "นาที", "วินาที"]

export function LoveDuration({ startDate }: LoveDurationProps) {
  const [duration, setDuration] = useState<Duration>(calcDuration(startDate))

  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(calcDuration(startDate))
    }, 1000)
    return () => clearInterval(interval)
  }, [startDate])

  const values = [
    duration.years,
    duration.months,
    duration.days,
    duration.hours,
    duration.minutes,
    duration.seconds,
  ]

  return (
    <div className="py-16 px-4">
      <h2
        className="text-center text-lg md:text-xl tracking-widest uppercase mb-2 font-light"
        style={{ color: "hsl(350, 40%, 70%)" }}
      >
        {"เราคบกันมาแล้ว"}
      </h2>
      <div className="flex flex-wrap justify-center gap-3 md:gap-4 mt-8 max-w-2xl mx-auto">
        {values.map((val, i) => (
          <div
            key={labels[i]}
            className="glass rounded-xl p-4 md:p-5 flex flex-col items-center min-w-[80px] md:min-w-[100px]"
          >
            <span
              className="text-3xl md:text-4xl font-light tabular-nums"
              style={{ color: "hsl(350, 60%, 70%)" }}
            >
              {String(val).padStart(2, "0")}
            </span>
            <span className="text-xs text-muted-foreground mt-1 font-light">{labels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
