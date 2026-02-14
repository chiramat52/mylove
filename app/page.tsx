"use client"

import { useState, useEffect, useCallback } from "react"
import { Settings } from "lucide-react"
import { FloatingParticles } from "@/components/surprise/floating-particles"
import { Entrance } from "@/components/surprise/entrance"
import { Journey } from "@/components/surprise/journey"
import { NetflixExperience } from "@/components/surprise/netflix-experience"
import { AdminPanel } from "@/components/surprise/admin-panel"
import type { PhotoItem } from "@/components/surprise/photo-gallery"
import type { VideoItem } from "@/components/surprise/netflix-experience"

interface StoryChapter {
  id: string
  title: string
  text: string
  side: "left" | "right" | "center"
}

interface SiteSettings {
  viewPassword: string
  adminPassword: string
  startDate: string
  name1: string
  name2: string
  profileName1: string
  profileAvatar1: string
  profileColor1: string
  profileName2: string
  profileAvatar2: string
  profileColor2: string
}

const DEFAULT_SETTINGS: SiteSettings = {
  viewPassword: "021267",
  adminPassword: "06042552",
  startDate: "2025-12-02",
  name1: "Chiramet",
  name2: "Kotchrada",
  profileName1: "My Love",
  profileAvatar1: "",
  profileColor1: "hsl(345, 50%, 25%)",  
  profileName2: "Darling",
  profileAvatar2: "",
  profileColor2: "hsl(350, 60%, 30%)",
}

const DEFAULT_CHAPTERS: StoryChapter[] = [
  {
    id: "1",
    title: "วันแรกที่เราเจอกัน",
    text: "เค้ารู้สึกว่าเธอเป็นคนพิเศษมากว่าใคร แต่ตอนนั้นเธอเจ้าชู้เลยม่อยากจะเปิดใจให้ใครง่ายๆ แต่เค้าก็ไม่ยอมแพ้ และในที่สุดเธอก็ยอมให้โอกาสเราได้รู้จักกันมากขึ้น",
    side: "left",
  },
  {
    id: "2",
    title: "เดทแรกของเรา",
    text: "เค้าได้ไปดูหนังกับครั้งเเรกเค้ารู้สึกอุ่นใจมากที่เธอคอยอ้อน คอยกอดเค้าไม่เคยได้รับความรู้สึกนั้นเลย",
    side: "right",
  },
  {
    id: "3",
    title: "ตอนเธอขอให้เค้าขอเธอเป็นแฟน",
    text: "เอาจริงๆ ตอนนั้นเค้ารู้สึกกับเธอมาตั้งนานแล้ว เพราะตลอดระยะเวลาที่เธอจีบเค้าเค้าคิดว่าเธอคือคนที่จะคอยอยู่ข้างเค้าตลอดคอยเป็นให้เค้าคอยกอดตลอด",
    side: "left",
  },
  {
    id: "4",
    title: "ครบรอบ 1 ปี",
    text: "มันเป็นความรู้สึกที่เร็วมากที่เราผ่านมาด้วยกันได้ขนาดนี้ มันมีทั้งความสุขและความท้าทาย แต่เราก็ผ่านมันมาด้วยกัน และเค้ารู้สึกขอบคุณที่มีเธออยู่ข้างเค้า เค้ารักเธอมากๆนะคะ เค้าขะอยู๋เคียงข้างเธอไม่ว่าจะเป็นยังไงก็ตาม",
    side: "center",
  },
]

type Phase = "entrance" | "journey" | "netflix"

function getStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function setStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage full - ignore
  }
}

export default function Page() {
  const [phase, setPhase] = useState<Phase>("entrance")
  const [showAdmin, setShowAdmin] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [chapters, setChapters] = useState<StoryChapter[]>(DEFAULT_CHAPTERS)

  // Load from localStorage on mount
  useEffect(() => {
    setSettings(getStorage("surprise-settings", DEFAULT_SETTINGS))
    setPhotos(getStorage("surprise-photos", []))
    setVideos(getStorage("surprise-videos", []))
    setChapters(getStorage("surprise-chapters", DEFAULT_CHAPTERS))
    setLoaded(true)
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    if (!loaded) return
    setStorage("surprise-settings", settings)
  }, [settings, loaded])

  useEffect(() => {
    if (!loaded) return
    setStorage("surprise-photos", photos)
  }, [photos, loaded])

  useEffect(() => {
    if (!loaded) return
    setStorage("surprise-videos", videos)
  }, [videos, loaded])

  useEffect(() => {
    if (!loaded) return
    setStorage("surprise-chapters", chapters)
  }, [chapters, loaded])

  const handleEnter = useCallback(() => {
    setPhase("journey")
  }, [])

  const handleAdmin = useCallback(() => {
    setShowAdmin(true)
    setPhase("journey")
  }, [])

  if (!loaded) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: "hsl(0, 0%, 5%)" }}>
        <div className="animate-heartbeat">
          <svg
            viewBox="0 0 24 24"
            className="w-12 h-12"
            fill="hsl(350, 60%, 55%)"
            stroke="none"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
      </div>
    )
  }

  return (
    <main className="relative min-h-screen" style={{ background: "hsl(0, 0%, 5%)" }}>
      {/* Particles always visible */}
      <FloatingParticles />

      {/* Admin toggle - triple-click anywhere to show admin */}
      {phase !== "entrance" && (
        <button
          onClick={() => setShowAdmin(true)}
          className="fixed top-4 right-4 glass rounded-full p-2.5 text-muted-foreground hover:text-foreground transition-colors opacity-0 hover:opacity-60"
          style={{ zIndex: 25 }}
          aria-label="Admin Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      )}

      {/* Phase: Entrance */}
      {phase === "entrance" && (
        <Entrance
          onEnter={handleEnter}
          viewPassword={settings.viewPassword}
          adminPassword={settings.adminPassword}
          onAdmin={handleAdmin}
        />
      )}

      {/* Phase: Journey - scroll storytelling */}
      {phase === "journey" && (
        <Journey
          startDate={settings.startDate}
          photos={photos}
          chapters={chapters}
          coupleNames={{ name1: settings.name1, name2: settings.name2 }}
          onContinue={() => setPhase("netflix")}
        />
      )}

      {/* Phase: Netflix-style memories */}
      {phase === "netflix" && (
        <NetflixExperience
          videos={videos}
          photos={photos}
          chapters={chapters}
          startDate={settings.startDate}
          coupleNames={{ name1: settings.name1, name2: settings.name2 }}
          profiles={[
            {
              name: settings.profileName1,
              avatar: settings.profileAvatar1,
              color: settings.profileColor1,
            },
            {
              name: settings.profileName2,
              avatar: settings.profileAvatar2,
              color: settings.profileColor2,
            },
          ]}
          onBack={() => setPhase("journey")}
        />
      )}

      {/* Admin Panel */}
      {showAdmin && (
        <AdminPanel
          photos={photos}
          videos={videos}
          chapters={chapters}
          settings={settings}
          onUpdatePhotos={setPhotos}
          onUpdateVideos={setVideos}
          onUpdateChapters={setChapters}
          onUpdateSettings={(s) => {
            setSettings(s)
            setShowAdmin(false)
          }}
          onClose={() => setShowAdmin(false)}
        />
      )}
    </main>
  )
}
