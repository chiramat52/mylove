"use client"

import { useRef, useEffect, useState } from "react"
import { ChevronDown } from "lucide-react"
import { TypewriterText } from "./typewriter-text"
import { LoveDuration } from "./love-duration"
import { PhotoGallery, type PhotoItem } from "./photo-gallery"

interface StoryChapter {
  id: string
  title: string
  text: string
  side: "left" | "right" | "center"
}

interface JourneyProps {
  startDate: string
  photos: PhotoItem[]
  chapters: StoryChapter[]
  coupleNames: { name1: string; name2: string }
  onContinue: () => void
}

function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
}: {
  children: React.ReactNode
  direction?: "up" | "left" | "right"
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const animClass = isVisible
    ? direction === "left"
      ? "animate-slide-in-left"
      : direction === "right"
        ? "animate-slide-in-right"
        : "animate-fade-in-up"
    : "opacity-0"

  return (
    <div ref={ref} className={animClass} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

export function Journey({ startDate, photos, chapters, coupleNames, onContinue }: JourneyProps) {
  const [showTypewriter, setShowTypewriter] = useState(true)

  return (
    <div className="min-h-screen">
      {/* Cinematic Opening */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, hsl(345, 50%, 10%) 0%, hsl(0, 0%, 5%) 70%)",
          }}
        />
        <div className="relative text-center max-w-2xl mx-auto">
          <p className="text-xs tracking-[0.4em] uppercase text-muted-foreground mb-6 font-light">
            {"เรื่องราวของ"}
          </p>
          <h1
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-light tracking-wider mb-4"
            style={{ color: "hsl(350, 40%, 80%)" }}
          >
            {coupleNames.name1}
            <span className="mx-3 md:mx-4" style={{ color: "hsl(350, 60%, 55%)" }}>
              {"&"}
            </span>
            {coupleNames.name2}
          </h1>

          <div className="h-px w-32 mx-auto my-8" style={{ backgroundColor: "hsl(350, 60%, 40%)" }} />

          {showTypewriter && (
            <div className="min-h-[60px]">
              <TypewriterText
                text="ทุกวินาทีที่ผ่านไป คือเรื่องราวที่เราสร้างร่วมกัน..."
                speed={70}
                className="text-base md:text-lg font-light leading-relaxed text-muted-foreground"
                onComplete={() => setTimeout(() => setShowTypewriter(false), 2000)}
              />
            </div>
          )}
          {!showTypewriter && (
            <p className="text-base md:text-lg font-light leading-relaxed text-muted-foreground animate-fade-in-up">
              {"ทุกวินาทีที่ผ่านไป คือเรื่องราวที่เราสร้างร่วมกัน..."}
            </p>
          )}
        </div>

        <div className="absolute bottom-10 animate-bounce">
          <ChevronDown className="w-6 h-6 text-muted-foreground" />
        </div>
      </section>

      {/* Love Duration */}
      <section className="relative py-20" style={{ background: "hsl(0, 0%, 4%)" }}>
        <ScrollReveal>
          <LoveDuration startDate={startDate} />
        </ScrollReveal>
      </section>

      {/* Story Timeline */}
      <section className="relative py-20 px-4">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, hsl(0, 0%, 4%) 0%, hsl(345, 30%, 7%) 50%, hsl(0, 0%, 5%) 100%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto">
          <ScrollReveal>
            <h2
              className="text-center text-base md:text-lg tracking-[0.3em] uppercase mb-12 md:mb-16 font-light"
              style={{ color: "hsl(350, 40%, 70%)" }}
            >
              {"เรื่องราวของเรา"}
            </h2>
          </ScrollReveal>

          {/* Timeline line */}
          <div
            className="hidden md:block absolute left-1/2 top-32 bottom-20 w-px"
            style={{ backgroundColor: "hsl(350, 40%, 20%)" }}
          />

          <div className="flex flex-col gap-12 md:gap-24">
            {chapters.map((chapter, i) => (
              <ScrollReveal
                key={chapter.id}
                direction={chapter.side === "left" ? "left" : chapter.side === "right" ? "right" : "up"}
                delay={i * 100}
              >
                <div
                  className={`relative w-full md:w-[45%] p-6 md:p-0 glass md:bg-transparent rounded-xl md:rounded-none ${
                    chapter.side === "right"
                      ? "md:ml-auto md:text-left"
                      : chapter.side === "center"
                        ? "md:w-full md:text-center"
                        : "md:text-right"
                  }`}
                >
                  {/* Timeline dot */}
                  <div
                    className="hidden md:block absolute top-2 w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: "hsl(350, 60%, 55%)",
                      boxShadow: "0 0 12px hsl(350, 60%, 55%)",
                      ...(chapter.side === "right"
                        ? { left: "-32px" }
                        : chapter.side === "center"
                          ? { left: "50%", transform: "translateX(-50%)" }
                          : { right: "-32px" }),
                    }}
                  />

                  <h3
                    className="text-xl md:text-2xl font-light mb-2 md:mb-3 tracking-wide"
                    style={{ color: "hsl(350, 40%, 80%)" }}
                  >
                    {chapter.title}
                  </h3>
                  <p className="text-muted-foreground font-light leading-relaxed text-sm md:text-base">
                    {chapter.text}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Photo Gallery */}
      <section className="relative py-20">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, hsl(0, 0%, 5%) 0%, hsl(345, 20%, 6%) 50%, hsl(0, 0%, 4%) 100%)",
          }}
        />
        <div className="relative">
          <ScrollReveal>
            <h2
              className="text-center text-base md:text-lg tracking-[0.3em] uppercase mb-8 md:mb-12 font-light"
              style={{ color: "hsl(350, 40%, 70%)" }}
            >
              {"ความทรงจำของเรา"}
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <PhotoGallery photos={photos} />
          </ScrollReveal>
        </div>
      </section>

      {/* Continue to Netflix - Netflix style CTA */}
      <section className="relative py-20 md:py-32 flex flex-col items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 80%, hsl(345, 50%, 10%) 0%, hsl(0, 0%, 4%) 70%)",
          }}
        />

        {/* Netflix logo glow */}
        <div
          className="absolute w-[300px] h-[300px] rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, hsl(350, 70%, 45%) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />

        <ScrollReveal>
          <div className="relative text-center flex flex-col items-center px-4">
            {/* LOVEFLIX text logo */}
            <h2
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-[0.15em] mb-6"
              style={{
                color: "hsl(350, 60%, 55%)",
                fontFamily: "var(--font-montserrat)",
                textShadow: "0 0 40px hsla(350, 60%, 50%, 0.4), 0 0 80px hsla(350, 60%, 40%, 0.2)",
              }}
            >
              LOVEFLIX
            </h2>

            <p className="text-muted-foreground font-light mb-8 text-sm md:text-base tracking-wide max-w-sm leading-relaxed">
              {"พร้อมจะดูความทรงจำของเราแบบ cinematic ไหม?"}
            </p>

            {/* Big Netflix-style play button */}
            <button
              onClick={onContinue}
              className="group relative flex items-center gap-3 px-10 md:px-14 py-4 md:py-5 rounded-md text-sm md:text-base font-semibold tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
              style={{
                backgroundColor: "hsl(0, 0%, 97%)",
                color: "hsl(0, 0%, 8%)",
              }}
            >
              {/* Hover shine */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: "linear-gradient(105deg, transparent 40%, rgba(220,120,140,0.15) 45%, rgba(220,120,140,0.15) 55%, transparent 60%)",
                  animation: "cta-shine 2s infinite",
                }}
              />
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current relative" stroke="none">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span className="relative">{"เข้าชมเลย"}</span>
            </button>

            {/* Or secondary info button */}
            <button
              onClick={onContinue}
              className="mt-4 flex items-center gap-2 px-8 py-3 rounded-md text-xs md:text-sm font-light tracking-wide transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
                color: "hsl(0, 0%, 80%)",
              }}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              {"ดูข้อมูลเพิ่มเติม"}
            </button>
          </div>
        </ScrollReveal>

        <style jsx>{`
          @keyframes cta-shine {
            0% { transform: translateX(-150%); }
            100% { transform: translateX(250%); }
          }
        `}</style>
      </section>
    </div>
  )
}
