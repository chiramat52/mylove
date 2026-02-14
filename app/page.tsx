"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Settings, Volume2, VolumeX } from "lucide-react"
import { FloatingParticles } from "@/components/surprise/floating-particles"
import { Entrance } from "@/components/surprise/entrance"
import { Journey } from "@/components/surprise/journey"
import { NetflixExperience } from "@/components/surprise/netflix-experience"
import { AdminPanel } from "@/components/surprise/admin-panel"
import type { PhotoItem } from "@/components/surprise/photo-gallery"
import type { VideoItem } from "@/components/surprise/netflix-experience"
import { supabase } from "@/lib/supabaseClient"

// --- Interfaces ---
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
  musicUrl: string
  videoUrl?: string
  name1: string
  name2: string
  profileName1: string
  profileAvatar1: string
  profileColor1: string
  profileName2: string
  profileAvatar2: string
  profileColor2: string
}

// --- Default Data ---
const DEFAULT_SETTINGS: SiteSettings = {
  viewPassword: "021267",
  adminPassword: "06042552",
  startDate: "2025-12-02",
  musicUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // Example MP3
  videoUrl: "",
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

const DEFAULT_PHOTOS: PhotoItem[] = [
  { id: "1", title: "Our First Memory ❤️", src: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800" },
  { id: "2", title: "Sweet Moment 💕", src: "https://images.unsplash.com/photo-1544078751-58fee2d8a03b?w=800" },
  // สามารถเพิ่มรูปภาพ URL อื่นๆ ได้ที่นี่
]

const DEFAULT_VIDEOS: VideoItem[] = [
  {
    id: "1",
    title: "Special Moment ของเรา 💕",
    thumbnail: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
    url: "https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4",
  },
]

// --- Helper Function ---
function extractId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? match[2] : null
}

// --- Main Component ---
export default function Page() {
  const [phase, setPhase] = useState<"entrance" | "journey" | "netflix">("entrance")
  const [showAdmin, setShowAdmin] = useState(false)
  const [loaded, setLoaded] = useState(false)
  
  // 🔊 Audio States
  const [volume, setVolume] = useState(50)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [musicId, setMusicId] = useState<string | null>(null)

  // Data States
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)
  const [photos, setPhotos] = useState<PhotoItem[]>(DEFAULT_PHOTOS)
  const [videos, setVideos] = useState<VideoItem[]>(DEFAULT_VIDEOS)
  const [chapters, setChapters] = useState<StoryChapter[]>(DEFAULT_CHAPTERS)

  useEffect(() => {
    // --- Supabase Real-time Fetching ---
    const fetchData = async () => {
      // 1. Settings
      const { data: settingsData } = await supabase.from('site_settings').select('data').single()
      if (settingsData?.data) setSettings(settingsData.data)

      // 2. Photos
      const { data: photosData } = await supabase.from('gallery').select('*').order('created_at', { ascending: false })
      if (photosData) setPhotos(photosData)

      // 3. Videos
      const { data: videosData } = await supabase.from('videos').select('*').order('created_at', { ascending: true })
      if (videosData) setVideos(videosData)

      // 4. Chapters
      const { data: chaptersData } = await supabase.from('chapters').select('*').order('created_at', { ascending: true })
      if (chaptersData) setChapters(chaptersData)
    }

    fetchData()

    // --- Subscribe to Changes ---
    const channel = supabase.channel('realtime-content')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, (payload) => {
        if (payload.new && (payload.new as any).data) {
          setSettings((payload.new as any).data)
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery' }, () => {
        supabase.from('gallery').select('*').order('created_at', { ascending: false }).then(({ data }) => { if (data) setPhotos(data) })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'videos' }, () => {
        supabase.from('videos').select('*').order('created_at', { ascending: true }).then(({ data }) => { if (data) setVideos(data) })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chapters' }, () => {
        supabase.from('chapters').select('*').order('created_at', { ascending: true }).then(({ data }) => { if (data) setChapters(data) })
      })
      .subscribe()

    setLoaded(true)

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    // Check if music is YouTube or MP3
    const id = extractId(settings.musicUrl)
    setMusicId(id)

    // 🎵 Auto-play Audio Logic
    const attemptPlay = () => {
      if (id) {
        // YouTube logic handled by iframe/API
      } else if (audioRef.current) {
        audioRef.current.volume = volume / 100
        audioRef.current.play().catch((e) => {
          console.log("Autoplay blocked, waiting for interaction", e)
        })
      }
    }

    // Try playing immediately
    attemptPlay()

    // Add interaction listener just in case
    const handleInteraction = () => {
      attemptPlay()
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('keydown', handleInteraction)
    }

    window.addEventListener('click', handleInteraction)
    window.addEventListener('keydown', handleInteraction)

    return () => {
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('keydown', handleInteraction)
    }
  }, [settings.musicUrl]) // Re-run when musicUrl changes

  // Update YouTube volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100
    }
  }, [volume, isMuted])

  // Phase Handlers
  const handleEnter = useCallback(() => {
    // Music continues playing
    setPhase("journey")
  }, [])

  const handleAdmin = useCallback(() => {
    setShowAdmin(true)
    // Optional: Auto-jump to journey to see changes
    if (phase === "entrance") setPhase("journey")
  }, [phase])

  if (!loaded) return null

  return (
    <main className="relative min-h-screen overflow-x-hidden" style={{ background: "hsl(0, 0%, 5%)" }}>
      {/* 🎵 HTML5 Audio Player */}
      {musicId ? (
        <div className="hidden">
          <iframe
            width="0"
            height="0"
            src={`https://www.youtube.com/embed/${musicId}?autoplay=1&loop=1&playlist=${musicId}&controls=0`}
            title="Background Music"
            allow="autoplay; encrypted-media"
          />
        </div>
      ) : (
        <audio ref={audioRef} src={settings.musicUrl} loop />
      )}

      <FloatingParticles />

      {/* ⚙️ Hidden Settings Trigger (Always accessible via invisible hover on top right) */}
      {phase !== "entrance" && (
        <button
          onClick={() => setShowAdmin(true)}
          className="fixed top-4 right-4 z-50 p-2 text-white/20 hover:text-rose-500 transition-colors"
        >
          <Settings size={20} />
        </button>
      )}

      {/* --- Phases --- */}
      {phase === "entrance" && (
        <Entrance 
          onEnter={handleEnter} 
          viewPassword={settings.viewPassword} 
          adminPassword={settings.adminPassword} 
          onAdmin={handleAdmin} 
        />
      )}

      {phase === "journey" && (
        <Journey 
          startDate={settings.startDate} 
          photos={photos} 
          chapters={chapters} 
          coupleNames={{ name1: settings.name1, name2: settings.name2 }} 
          onContinue={() => setPhase("netflix")} 
        />
      )}

      {phase === "netflix" && (
        <NetflixExperience 
          videos={videos} 
          photos={photos} 
          chapters={chapters} 
          startDate={settings.startDate} 
          coupleNames={{ name1: settings.name1, name2: settings.name2 }} 
          profiles={[
            { name: settings.profileName1, avatar: settings.profileAvatar1, color: settings.profileColor1 },
            { name: settings.profileName2, avatar: settings.profileAvatar2, color: settings.profileColor2 }
          ]} 
          onBack={() => setPhase("journey")} 
        />
      )}

      {/* 🔊 Audio Control (Bottom Right) */}
      {phase !== "entrance" && (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 flex items-center gap-2 md:gap-3 bg-black/60 backdrop-blur-xl p-2 md:p-3 rounded-full border border-white/10 z-[100] shadow-2xl">
          <button 
            onClick={() => setIsMuted(!isMuted)} 
            className="text-rose-400 hover:text-rose-300 transition-colors"
          >
            {isMuted || volume === 0 ? <VolumeX size={22} /> : <Volume2 size={22} />}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-20 md:w-32 accent-rose-500 h-1 cursor-pointer bg-white/20 rounded-lg appearance-none"
          />
        </div>
      )}

      {/* 🛠 Admin Panel */}
      {showAdmin && (
        <AdminPanel 
          photos={photos} 
          videos={videos} 
          chapters={chapters} 
          settings={settings} 
          onUpdatePhotos={() => {}} 
          onUpdateVideos={() => {}} 
          onUpdateChapters={() => {}} 
          onUpdateSettings={() => {}} 
          onClose={() => setShowAdmin(false)} 
        />
      )}
    </main>
  )
}