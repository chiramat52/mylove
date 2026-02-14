"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Volume2, VolumeX } from "lucide-react"
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
  name1: string
  name2: string
  profileName1: string
  profileAvatar1: string
  profileColor1: string
  profileName2: string
  profileAvatar2: string
  profileColor2: string
}

// --- Default Data (Fallback) ---
const DEFAULT_SETTINGS: SiteSettings = {
  viewPassword: "021267",
  adminPassword: "06042552",
  startDate: "2025-12-02",
  musicUrl: "https://www.youtube.com/watch?v=OYPiXBIgvJ8",
  name1: "Chiramet",
  name2: "Kotchrada",
  profileName1: "My Love",
  profileAvatar1: "",
  profileColor1: "hsl(345, 50%, 25%)",  
  profileName2: "Darling",
  profileAvatar2: "",
  profileColor2: "hsl(350, 60%, 30%)",
}

// --- Helpers ---
function extractId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? match[2] : null
}

export default function Page() {
  const [phase, setPhase] = useState<"entrance" | "journey" | "netflix">("entrance")
  const [showAdmin, setShowAdmin] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [volume, setVolume] = useState(50)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [musicId, setMusicId] = useState<string | null>(null)

  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [chapters, setChapters] = useState<StoryChapter[]>([])

  // 1. ดึงข้อมูลครั้งแรกจาก Supabase
  useEffect(() => {
    const fetchData = async () => {
      const { data: sData } = await supabase.from('site_settings').select('data').single()
      if (sData?.data) setSettings(sData.data)

      const { data: pData } = await supabase.from('gallery').select('*').order('created_at', { ascending: false })
      if (pData) setPhotos(pData.map(p => ({ id: p.id, src: p.image_url, title: p.caption })))

      const { data: vData } = await supabase.from('videos').select('*').order('created_at', { ascending: true })
      if (vData) setVideos(vData)

      const { data: cData } = await supabase.from('chapters').select('*').order('created_at', { ascending: true })
      if (cData) setChapters(cData)
      
      setLoaded(true)
    }
    fetchData()

    // 2. ระบบ Real-time: อัปเดตทันทีเมื่อแอดมินแก้ไขข้อมูล
    const channel = supabase.channel('realtime-content')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, (payload) => {
        if (payload.new && (payload.new as any).data) setSettings((payload.new as any).data)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery' }, () => {
        supabase.from('gallery').select('*').order('created_at', { ascending: false }).then(({ data }) => {
          if (data) setPhotos(data.map(p => ({ id: p.id, src: p.image_url, title: p.caption })))
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  // 3. ระบบจัดการเสียง (YouTube vs HTML5)
  useEffect(() => {
    const id = extractId(settings.musicUrl)
    setMusicId(id)
    if (!id && audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100
      audioRef.current.play().catch(() => {})
    }
  }, [settings.musicUrl, volume, isMuted])

  const handleEnter = useCallback(() => { setPhase("journey") }, [])

  if (!loaded) return null

  return (
    <main className="relative min-h-screen bg-[#0D0D0D]">
      {/* Hidden Music Player */}
      {musicId ? (
        <div className="hidden">
          <iframe 
            src={`https://www.youtube.com/embed/${musicId}?autoplay=1&loop=1&playlist=${musicId}&controls=0`} 
            allow="autoplay; encrypted-media" 
          />
        </div>
      ) : (
        <audio ref={audioRef} src={settings.musicUrl} loop />
      )}

      <FloatingParticles />

      {/* --- Phases --- */}
      {phase === "entrance" && (
        <Entrance onEnter={handleEnter} viewPassword={settings.viewPassword} adminPassword={settings.adminPassword} onAdmin={() => setShowAdmin(true)} />
      )}

      {phase === "journey" && (
        <Journey startDate={settings.startDate} photos={photos} chapters={chapters} coupleNames={{ name1: settings.name1, name2: settings.name2 }} onContinue={() => setPhase("netflix")} />
      )}

      {phase === "netflix" && (
        <NetflixExperience 
          videos={videos} photos={photos} chapters={chapters} startDate={settings.startDate} 
          coupleNames={{ name1: settings.name1, name2: settings.name2 }}
          profiles={[
            { name: settings.profileName1, avatar: settings.profileAvatar1, color: settings.profileColor1 },
            { name: settings.profileName2, avatar: settings.profileAvatar2, color: settings.profileColor2 }
          ]}
          onBack={() => setPhase("journey")}
          onAdmin={() => setShowAdmin(true)} // เข้า Admin ผ่านหน้าโปรไฟล์ (ซ่อนปุ่มฟันเฟือง)
        />
      )}

      {/* 🔊 ปุ่มปรับเสียงมุมขวาล่าง */}
      {phase !== "entrance" && (
        <div className="fixed bottom-6 right-6 flex items-center gap-3 bg-black/40 backdrop-blur-md p-3 rounded-full border border-white/10 z-[100] group">
          <button onClick={() => setIsMuted(!isMuted)} className="text-rose-400 transition-colors hover:text-rose-300">
            {isMuted || volume === 0 ? <VolumeX size={22} /> : <Volume2 size={22} />}
          </button>
          <input 
            type="range" min="0" max="100" value={volume} 
            onChange={(e) => setVolume(Number(e.target.value))} 
            className="w-0 overflow-hidden group-hover:w-24 transition-all duration-300 accent-rose-500 cursor-pointer"
          />
        </div>
      )}

      {/* 🛠 Admin Panel - ระบบจัดการข้อมูล Real-time */}
      {showAdmin && (
        <AdminPanel 
          photos={photos} videos={videos} chapters={chapters} settings={settings}
          onUpdatePhotos={async (newPhotos) => {
            // 1. ฟังก์ชัน ลบรูปภาพ
            if (newPhotos.length < photos.length) {
              const deleted = photos.find(p => !newPhotos.find(np => np.id === p.id))
              if (deleted) await supabase.from('gallery').delete().eq('id', deleted.id)
            } 
            // 2. ฟังก์ชัน เพิ่มรูปภาพ
            else if (newPhotos.length > photos.length) {
              const latest = newPhotos[newPhotos.length - 1]
              if (latest) await supabase.from('gallery').insert([{ image_url: latest.src, caption: latest.title }])
            }
            setPhotos(newPhotos)
          }}
          onUpdateSettings={async (newSettings) => {
            // อัปเดตเพลงและรหัสผ่าน
            const { error } = await supabase.from('site_settings').update({ data: newSettings }).eq('id', 1)
            if (!error) setSettings(newSettings)
          }}
          onClose={() => setShowAdmin(false)} 
        />
      )}
    </main>
  )
} 