"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  Play,
  Info,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Pause,
  Maximize,
  ArrowLeft,
  X,
  Heart,
  Clock,
  ImageIcon,
} from "lucide-react"
import Image from "next/image"
import type { PhotoItem } from "./photo-gallery"

export interface VideoItem {
  id: string
  title: string
  description?: string
  thumbnail: string
  videoUrl: string
  category?: string
}

interface StoryChapter {
  id: string
  title: string
  text: string
  side: "left" | "right" | "center"
}

interface NetflixExperienceProps {
  videos: VideoItem[]
  photos: PhotoItem[]
  chapters: StoryChapter[]
  profiles: { name: string; avatar: string; color: string }[]
  startDate: string
  coupleNames: { name1: string; name2: string }
  onBack: () => void
}

/* ──────── Profile Selection ──────── */
function ProfileSelection({
  profiles,
  onSelect,
}: {
  profiles: { name: string; avatar: string; color: string }[]
  onSelect: () => void
}) {
  const [entering, setEntering] = useState(false)

  const handleSelect = () => {
    setEntering(true)
    setTimeout(onSelect, 800)
  }

  return (
    <div
      className={`fixed inset-0 flex flex-col items-center justify-center transition-opacity duration-700 ${entering ? "opacity-0 scale-110" : "opacity-100 scale-100"}`}
      style={{ zIndex: 30, backgroundColor: "hsl(0,0%,5%)", transition: "opacity 0.7s, transform 0.7s" }}
    >
      <h2
        className="text-2xl md:text-4xl font-light tracking-wider mb-12 animate-fade-in-up"
        style={{ color: "hsl(0, 0%, 90%)" }}
      >
        {"ใครกำลังดูอยู่?"}
      </h2>
      <div className="flex flex-wrap justify-center gap-6 md:gap-8">
        {profiles.map((profile, i) => (
          <button
            key={i}
            onClick={handleSelect}
            className="group flex flex-col items-center gap-3 transition-transform duration-200 hover:scale-110 animate-fade-in-up"
            style={{ animationDelay: `${200 + i * 150}ms` }}
          >
            <div
              className="w-28 h-28 md:w-36 md:h-36 rounded-lg overflow-hidden border-2 border-transparent group-hover:border-[hsl(350,60%,65%)] transition-all relative"
              style={{ backgroundColor: profile.color }}
            >
              {profile.avatar ? (
                <Image
                  src={profile.avatar}
                  alt={profile.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-4xl md:text-5xl font-light"
                  style={{ color: "hsl(0,0%,90%)" }}
                >
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors font-light">
              {profile.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ──────── Video Player ──────── */
function VideoPlayer({
  video,
  onClose,
}: {
  video: VideoItem
  onClose: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const controlsTimer = useRef<NodeJS.Timeout | null>(null)

  const hideControlsLater = useCallback(() => {
    if (controlsTimer.current) clearTimeout(controlsTimer.current)
    controlsTimer.current = setTimeout(() => setShowControls(false), 3000)
  }, [])

  useEffect(() => {
    hideControlsLater()
    return () => { if (controlsTimer.current) clearTimeout(controlsTimer.current) }
  }, [hideControlsLater])

  const handleMouseMove = () => {
    setShowControls(true)
    hideControlsLater()
  }

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) videoRef.current.pause()
    else videoRef.current.play()
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    const pct = (videoRef.current.currentTime / videoRef.current.duration) * 100
    setProgress(isNaN(pct) ? 0 : pct)
  }

  return (
    <div
      className="fixed inset-0 bg-black flex flex-col"
      style={{ zIndex: 60 }}
      onMouseMove={handleMouseMove}
    >
      {/* Top bar */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 md:p-6 flex items-center gap-4 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}
        style={{ zIndex: 2, background: "linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)" }}
      >
        <button onClick={onClose} className="text-foreground/70 hover:text-foreground transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h3 className="text-sm md:text-base font-light tracking-wide" style={{ color: "hsl(0,0%,85%)" }}>
          {video.title}
        </h3>
      </div>

      {/* Video area */}
      <div className="flex-1 flex items-center justify-center cursor-pointer" onClick={togglePlay}>
        <video
          ref={videoRef}
          src={video.videoUrl}
          autoPlay
          muted={isMuted}
          onTimeUpdate={handleTimeUpdate}
          className="w-full h-full object-contain"
          playsInline
        />
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Play className="w-16 h-16" style={{ color: "hsl(0,0%,95%)" }} />
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 md:p-6 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}
        style={{ zIndex: 2, background: "linear-gradient(0deg, rgba(0,0,0,0.7) 0%, transparent 100%)" }}
      >
        <div
          className="w-full h-1 bg-[hsl(0,0%,20%)] rounded-full mb-4 cursor-pointer group"
          onClick={(e) => {
            if (!videoRef.current) return
            const rect = e.currentTarget.getBoundingClientRect()
            const pct = (e.clientX - rect.left) / rect.width
            videoRef.current.currentTime = pct * videoRef.current.duration
          }}
        >
          <div
            className="h-full rounded-full transition-all relative"
            style={{ width: `${progress}%`, backgroundColor: "hsl(350, 60%, 55%)" }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: "hsl(350, 60%, 55%)" }} />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="text-foreground/80 hover:text-foreground transition-colors">
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            <button onClick={toggleMute} className="text-foreground/80 hover:text-foreground transition-colors">
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
          <button
            onClick={() => videoRef.current?.requestFullscreen?.()}
            className="text-foreground/80 hover:text-foreground transition-colors"
          >
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ──────── Photo Lightbox ──────── */
function PhotoLightbox({
  photos,
  initialIndex,
  onClose,
}: {
  photos: PhotoItem[]
  initialIndex: number
  onClose: () => void
}) {
  const [index, setIndex] = useState(initialIndex)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft" && index > 0) setIndex(index - 1)
      if (e.key === "ArrowRight" && index < photos.length - 1) setIndex(index + 1)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [index, photos.length, onClose])

  return (
    <div
      className="fixed inset-0 bg-black/95 flex items-center justify-center"
      style={{ zIndex: 60 }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-foreground/70 hover:text-foreground transition-colors"
        style={{ zIndex: 2 }}
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      {index > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); setIndex(index - 1) }}
          className="absolute left-4 md:left-8 text-foreground/50 hover:text-foreground transition-colors"
          style={{ zIndex: 2 }}
          aria-label="Previous"
        >
          <ChevronLeft className="w-10 h-10" />
        </button>
      )}

      {index < photos.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); setIndex(index + 1) }}
          className="absolute right-4 md:right-8 text-foreground/50 hover:text-foreground transition-colors"
          style={{ zIndex: 2 }}
          aria-label="Next"
        >
          <ChevronRight className="w-10 h-10" />
        </button>
      )}

      <div className="relative max-w-5xl max-h-[90vh] w-full mx-8" onClick={(e) => e.stopPropagation()}>
        <Image
          src={photos[index].src}
          alt={photos[index].caption || "Memory"}
          width={1400}
          height={900}
          className="object-contain w-full h-full max-h-[82vh] rounded-lg animate-netflix-zoom"
        />
        {photos[index].caption && (
          <p className="text-center mt-4 text-sm font-light" style={{ color: "hsl(350, 40%, 80%)" }}>
            {photos[index].caption}
          </p>
        )}
        <p className="text-center mt-1 text-xs text-muted-foreground">
          {index + 1} / {photos.length}
        </p>
      </div>
    </div>
  )
}

/* ──────── Scrollable Row ──────── */
function ScrollRow({ children, title }: { children: React.ReactNode; title: string }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 10)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }, [])

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    el?.addEventListener("scroll", checkScroll)
    window.addEventListener("resize", checkScroll)
    return () => {
      el?.removeEventListener("scroll", checkScroll)
      window.removeEventListener("resize", checkScroll)
    }
  }, [checkScroll])

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -400 : 400, behavior: "smooth" })
  }

  return (
    <div className="mb-8 md:mb-10 group/row relative">
      <h3
        className="text-sm md:text-base font-medium mb-3 md:mb-4 px-4 md:px-12 tracking-wide"
        style={{ color: "hsl(0,0%,85%)" }}
      >
        {title}
      </h3>

      {/* Scroll arrows */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-10 bottom-0 w-10 md:w-12 flex items-center justify-center bg-gradient-to-r from-[hsl(0,0%,5%)] to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity"
          style={{ zIndex: 5 }}
        >
          <ChevronLeft className="w-6 h-6 text-foreground/80" />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-10 bottom-0 w-10 md:w-12 flex items-center justify-center bg-gradient-to-l from-[hsl(0,0%,5%)] to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity"
          style={{ zIndex: 5 }}
        >
          <ChevronRight className="w-6 h-6 text-foreground/80" />
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex gap-2 md:gap-3 overflow-x-auto px-4 md:px-12 pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        {children}
      </div>
    </div>
  )
}

/* ──────── Love Duration ──────── */
function useLoveDuration(startDate: string) {
  const [duration, setDuration] = useState({ years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const calc = () => {
      const start = new Date(startDate)
      const now = new Date()
      const diff = now.getTime() - start.getTime()
      const ts = Math.floor(diff / 1000)
      const tm = Math.floor(ts / 60)
      const th = Math.floor(tm / 60)
      const td = Math.floor(th / 24)
      const years = Math.floor(td / 365.25)
      const rd = td - Math.floor(years * 365.25)
      const months = Math.floor(rd / 30.44)
      const days = Math.floor(rd - months * 30.44)
      setDuration({ years, months, days, hours: th % 24, minutes: tm % 60, seconds: ts % 60 })
    }
    calc()
    const iv = setInterval(calc, 1000)
    return () => clearInterval(iv)
  }, [startDate])

  return duration
}

/* ──────── Story Detail Modal ──────── */
function StoryDetailModal({
  chapters,
  onClose,
}: {
  chapters: StoryChapter[]
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 bg-black/90 overflow-y-auto"
      style={{ zIndex: 55 }}
    >
      <div className="max-w-3xl mx-auto py-16 px-4 md:px-8">
        <button
          onClick={onClose}
          className="fixed top-6 right-6 text-foreground/70 hover:text-foreground transition-colors"
          style={{ zIndex: 2 }}
        >
          <X className="w-6 h-6" />
        </button>

        <h2
          className="text-center text-xl md:text-3xl font-light tracking-wider mb-12"
          style={{ color: "hsl(350, 40%, 80%)" }}
        >
          {"เรื่องราวของเรา"}
        </h2>

        <div className="flex flex-col gap-10 md:gap-14">
          {chapters.map((chapter, i) => (
            <div
              key={chapter.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: "hsl(350, 60%, 55%)", boxShadow: "0 0 8px hsl(350, 60%, 55%)" }}
                />
                <h3
                  className="text-base md:text-lg font-light tracking-wide"
                  style={{ color: "hsl(350, 40%, 75%)" }}
                >
                  {chapter.title}
                </h3>
              </div>
              <p className="text-muted-foreground font-light leading-relaxed text-sm md:text-base pl-5">
                {chapter.text}
              </p>
              {i < chapters.length - 1 && (
                <div className="w-px h-8 ml-1 mt-4" style={{ backgroundColor: "hsl(350, 40%, 20%)" }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ──────── Main Netflix Experience ──────── */
export function NetflixExperience({
  videos,
  photos,
  chapters,
  profiles,
  startDate,
  coupleNames,
  onBack,
}: NetflixExperienceProps) {
  const [profileSelected, setProfileSelected] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [showStory, setShowStory] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const duration = useLoveDuration(startDate)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handler)
    return () => window.removeEventListener("scroll", handler)
  }, [])

  if (!profileSelected) {
    return <ProfileSelection profiles={profiles} onSelect={() => setProfileSelected(true)} />
  }

  if (selectedVideo) {
    return <VideoPlayer video={selectedVideo} onClose={() => setSelectedVideo(null)} />
  }

  if (lightboxIndex !== null && photos.length > 0) {
    return <PhotoLightbox photos={photos} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
  }

  if (showStory) {
    return <StoryDetailModal chapters={chapters} onClose={() => setShowStory(false)} />
  }

  // Group videos by category
  const categories: Record<string, VideoItem[]> = {}
  videos.forEach((v) => {
    const cat = v.category || "Our Collection"
    if (!categories[cat]) categories[cat] = []
    categories[cat].push(v)
  })

  const featured = videos[0]
  const durationLabels = ["ปี", "เดือน", "วัน", "ชั่วโมง", "นาที", "วินาที"]
  const durationValues = [duration.years, duration.months, duration.days, duration.hours, duration.minutes, duration.seconds]

  return (
    <div className="min-h-screen" style={{ backgroundColor: "hsl(0, 0%, 5%)" }}>
      {/* Sticky Netflix header */}
      <header
        className={`fixed top-0 left-0 right-0 px-4 md:px-8 py-3 md:py-4 flex items-center justify-between transition-all duration-500 ${scrolled ? "shadow-lg" : ""}`}
        style={{
          zIndex: 20,
          background: scrolled
            ? "rgba(10, 5, 7, 0.95)"
            : "linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%)",
          backdropFilter: scrolled ? "blur(20px)" : "none",
        }}
      >
        <div className="flex items-center gap-4 md:gap-6">
          <button onClick={onBack} className="text-foreground/50 hover:text-foreground transition-colors">
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <h1
            className="text-xl md:text-2xl lg:text-3xl font-bold tracking-[0.15em]"
            style={{ color: "hsl(350, 60%, 55%)", fontFamily: "var(--font-montserrat)" }}
          >
            LOVEFLIX
          </h1>
        </div>

        {/* Right side: compact duration + optional clip cover */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1 text-xs" style={{ color: "hsl(350, 40%, 70%)" }}>
            <Heart className="w-3 h-3 mr-1 animate-heartbeat" style={{ fill: "hsl(350, 60%, 55%)", color: "hsl(350, 60%, 55%)" }} />
            <span>{duration.years}y {duration.months}m {duration.days}d</span>
          </div>

          {featured?.thumbnail && (
            <button
              onClick={() => setSelectedVideo(featured)}
              className="w-10 h-10 md:w-12 md:h-12 rounded overflow-hidden border border-transparent hover:border-[hsl(350,60%,65%)] transition-all"
              aria-label="Play featured clip"
            >
              <div className="relative w-full h-full">
                <Image src={featured.thumbnail} alt={featured.title || "Clip cover"} fill className="object-cover" />
              </div>
            </button>
          )}
        </div>
      </header>

      {/* Hero Billboard */}
      <section className="relative h-[85vh] md:h-[90vh]">
        {featured && featured.thumbnail ? (
          <div className="absolute inset-0">
            <Image src={featured.thumbnail} alt={featured.title} fill className="object-cover" priority />
          </div>
        ) : photos.length > 0 && photos[0].src ? (
          <div className="absolute inset-0">
            <Image src={photos[0].src} alt="Our story" fill className="object-cover" priority />
          </div>
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse at 30% 40%, hsl(345, 60%, 15%) 0%, hsl(0, 0%, 5%) 70%)" }}
          />
        )}

        {/* Gradient overlays */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(0deg, hsl(0,0%,5%) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.5) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.6) 0%, transparent 60%)" }}
        />

        {/* Hero content */}
        <div className="absolute bottom-20 md:bottom-28 left-4 md:left-12 max-w-xl" style={{ zIndex: 2 }}>
          <p className="text-xs tracking-[0.3em] uppercase mb-3 font-light" style={{ color: "hsl(350, 60%, 65%)" }}>
            {"เรื่องราวของ"}
          </p>
          <h2
            className="text-4xl md:text-6xl lg:text-7xl font-light tracking-wider mb-2"
            style={{ color: "hsl(0,0%,97%)" }}
          >
            {coupleNames.name1}
            <span className="mx-2 md:mx-3" style={{ color: "hsl(350, 60%, 60%)" }}>{"&"}</span>
            {coupleNames.name2}
          </h2>

          {featured?.description && (
            <p className="text-sm md:text-base text-foreground/70 font-light leading-relaxed mb-6 line-clamp-2 max-w-md">
              {featured.description}
            </p>
          )}
          {!featured?.description && (
            <p className="text-sm md:text-base text-foreground/70 font-light leading-relaxed mb-6 max-w-md">
              {"ทุกวินาทีที่ผ่านไป คือเรื่องราวที่เราสร้างร่วมกัน..."}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            {featured && (
              <button
                onClick={() => setSelectedVideo(featured)}
                className="flex items-center gap-2 px-5 md:px-7 py-2.5 md:py-3 rounded-md text-sm font-medium transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: "hsl(0,0%,97%)", color: "hsl(0,0%,8%)" }}
              >
                <Play className="w-5 h-5 fill-current" />
                {"เล่น"}
              </button>
            )}
            {chapters.length > 0 && (
              <button
                onClick={() => featured && setSelectedVideo(featured)}
                className="flex items-center gap-2 px-5 md:px-7 py-2.5 md:py-3 rounded-md text-sm font-medium transition-all hover:opacity-80 active:scale-95"
                style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "hsl(0,0%,90%)" }}
              >
                <Play className="w-5 h-5" />
                {"เล่น"}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Content rows */}
      <div className="relative -mt-16 md:-mt-20 pb-24" style={{ zIndex: 3 }}>

        {/* Duration strip */}
        <div className="mb-8 md:mb-10 px-4 md:px-12">
          <div className="glass rounded-xl p-4 md:p-6 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4" style={{ color: "hsl(350, 60%, 65%)" }} />
              <span className="text-xs tracking-[0.2em] uppercase font-light" style={{ color: "hsl(350, 40%, 70%)" }}>
                {"เราคบกันมาแล้ว"}
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              {durationValues.map((val, i) => (
                <div key={durationLabels[i]} className="flex flex-col items-center min-w-[52px] md:min-w-[70px]">
                  <span
                    className="text-2xl md:text-3xl font-light tabular-nums"
                    style={{ color: "hsl(350, 60%, 70%)" }}
                  >
                    {String(val).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] md:text-xs text-muted-foreground font-light">{durationLabels[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Photo Album Row */}
        {photos.length > 0 && (
          <ScrollRow title="ความทรงจำของเรา">
            {photos.map((photo, i) => (
              <div
                key={photo.id}
                className="group relative flex-shrink-0 w-[160px] md:w-[200px] rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:z-10"
                onClick={() => setLightboxIndex(i)}
              >
                <div className="aspect-[3/4] relative">
                  {photo.src ? (
                    <Image
                      src={photo.src}
                      alt={photo.caption || `Memory ${i + 1}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="200px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "hsl(345, 40%, 12%)" }}>
                      <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {photo.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-xs font-light line-clamp-2" style={{ color: "hsl(350, 40%, 90%)" }}>
                        {photo.caption}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </ScrollRow>
        )}

        {/* Video rows by category */}
        {Object.entries(categories).map(([category, catVideos]) => (
          <ScrollRow key={category} title={category}>
            {catVideos.map((video) => (
              <div
                key={video.id}
                className="group relative flex-shrink-0 w-[220px] md:w-[280px] rounded-md overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:z-10"
                onClick={() => setSelectedVideo(video)}
              >
                <div className="aspect-video relative">
                  {video.thumbnail ? (
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="280px"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: "hsl(345, 40%, 12%)" }}
                    >
                      <Play className="w-10 h-10" style={{ color: "hsl(350, 60%, 55%)" }} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300" style={{ backgroundColor: "rgba(220, 120, 140, 0.9)" }}>
                      <Play className="w-5 h-5 ml-0.5 fill-current" style={{ color: "hsl(0,0%,100%)" }} />
                    </div>
                  </div>
                </div>
                <div className="p-2.5" style={{ backgroundColor: "hsl(0,0%,7%)" }}>
                  <p className="text-xs md:text-sm font-medium truncate" style={{ color: "hsl(0,0%,87%)" }}>
                    {video.title}
                  </p>
                  {video.description && (
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5 font-light">
                      {video.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </ScrollRow>
        ))}

        {/* Story chapters as a "series" row */}
        {chapters.length > 0 && (
          <ScrollRow title="บทแห่งความทรงจำ">
            {chapters.map((chapter, i) => (
              <div
                key={chapter.id}
                className="group relative flex-shrink-0 w-[220px] md:w-[280px] rounded-md overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:z-10"
                onClick={() => setShowStory(true)}
              >
                <div
                  className="aspect-video relative flex flex-col items-center justify-center p-4 text-center"
                  style={{
                    background: `linear-gradient(135deg, hsl(345, ${40 + i * 8}%, ${12 + i * 3}%) 0%, hsl(0, 0%, 8%) 100%)`,
                  }}
                >
                  <span className="text-3xl md:text-4xl font-light mb-2" style={{ color: "hsl(350, 60%, 60%)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-xs font-light line-clamp-2 px-2" style={{ color: "hsl(0,0%,75%)" }}>
                    {chapter.title}
                  </p>
                </div>
                <div className="p-2.5" style={{ backgroundColor: "hsl(0,0%,7%)" }}>
                  <p className="text-[11px] text-muted-foreground font-light line-clamp-2">
                    {chapter.text}
                  </p>
                </div>
              </div>
            ))}
          </ScrollRow>
        )}

        {/* Empty states */}
        {videos.length === 0 && photos.length === 0 && chapters.length === 0 && (
          <div className="text-center py-24 px-4">
            <Heart
              className="w-16 h-16 mx-auto mb-6 animate-heartbeat"
              style={{ color: "hsl(350, 60%, 40%)", fill: "hsl(350, 60%, 40%)" }}
            />
            <p className="text-foreground/50 font-light text-sm mb-2">
              {"ยังไม่มีเนื้อหา"}
            </p>
            <p className="text-muted-foreground font-light text-xs">
              {"เพิ่มรูปภาพ วิดีโอ และเรื่องราวได้ในหน้า Admin"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
