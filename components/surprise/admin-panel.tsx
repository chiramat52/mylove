"use client"

import { useState } from "react"
import {
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  Video,
  Settings,
  BookOpen,
  Save,
  Music,
} from "lucide-react"
import type { PhotoItem } from "./photo-gallery"
import type { VideoItem } from "./netflix-experience"
import { supabase } from "@/lib/supabaseClient"

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

interface AdminPanelProps {
  photos: PhotoItem[]
  videos: VideoItem[]
  chapters: StoryChapter[]
  settings: SiteSettings
  onUpdatePhotos: (photos: PhotoItem[]) => void
  onUpdateVideos: (videos: VideoItem[]) => void
  onUpdateChapters: (chapters: StoryChapter[]) => void
  onUpdateSettings: (settings: SiteSettings) => void
  onClose: () => void
}

type Tab = "photos" | "videos" | "chapters" | "settings"

export function AdminPanel({
  photos,
  videos,
  chapters,
  settings,
  onUpdatePhotos,
  onUpdateVideos,
  onUpdateChapters,
  onUpdateSettings,
  onClose,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("photos")
  const [localSettings, setLocalSettings] = useState<SiteSettings>(settings)
  const [isUploading, setIsUploading] = useState(false)

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "photos", label: "รูปภาพ", icon: <ImageIcon className="w-4 h-4" /> },
    { key: "videos", label: "วิดีโอ", icon: <Video className="w-4 h-4" /> },
    { key: "chapters", label: "เรื่องราว", icon: <BookOpen className="w-4 h-4" /> },
    { key: "settings", label: "ตั้งค่า", icon: <Settings className="w-4 h-4" /> },
  ]

  const inputClass =
    "w-full px-4 py-3 md:py-2.5 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-foreground placeholder:text-muted-foreground text-base md:text-sm focus:outline-none focus:border-primary/50 transition-colors"
  const labelClass = "block text-xs text-muted-foreground mb-1.5 font-light"

  // Helper to upload file to Supabase Storage
  const uploadFile = async (file: File, bucket: string) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file)
      
      if (uploadError) throw uploadError
      
      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName)
      return data.publicUrl
    } catch (error: any) {
      alert(`Upload failed: ${error.message}`)
      return null
    }
  }

  // Function to save settings (Music & Video URLs)
  const handleSaveSettings = async () => {
    setIsUploading(true)
    try {
      const { error } = await supabase.from('site_settings').upsert({ id: 1, data: localSettings })
      if (error) throw error
      
      alert("บันทึกการตั้งค่าเรียบร้อยแล้ว!")
      onUpdateSettings(localSettings)
    } catch (error: any) {
      alert("เกิดข้อผิดพลาด: " + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center sm:p-4" style={{ zIndex: 50 }}>
      <div
        className="glass-strong rounded-t-2xl sm:rounded-2xl w-full h-[85vh] sm:h-auto sm:max-w-2xl sm:max-h-[90vh] flex flex-col overflow-hidden transition-all"
        style={{ boxShadow: "0 0 60px rgba(0,0,0,0.5)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-[rgba(255,255,255,0.08)]">
          <h2 className="text-base md:text-lg font-medium" style={{ color: "hsl(350, 40%, 80%)" }}>
            Admin Panel
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[rgba(255,255,255,0.08)] overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-3 text-[11px] sm:text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? "border-b-2 text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              style={activeTab === tab.key ? { borderColor: "hsl(350, 60%, 55%)" } : {}}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 pb-10 sm:pb-5">
          {/* Photos Tab */}
          {activeTab === "photos" && (
            <div className="flex flex-col gap-4">
              <button
                onClick={async () => {
                  // Create empty placeholder in DB
                  await supabase.from('gallery').insert([{ src: "", caption: "" }])
                }
                }
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-90"
                style={{
                  backgroundColor: "rgba(220, 120, 140, 0.15)",
                  color: "hsl(350, 60%, 70%)",
                }}
              >
                <Plus className="w-4 h-4" /> {"เพิ่มรูปภาพ"}
              </button>
              {photos.map((photo, i) => (
                <div key={photo.id} className="glass rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{"รูปที่"} {i + 1}</span>
                    <button
                      onClick={() => supabase.from('gallery').delete().eq('id', photo.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <label className={labelClass}>{"เลือกรูปภาพ"}</label>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setIsUploading(true)
                            try {
                              const publicUrl = await uploadFile(file, 'memories')
                              if (publicUrl) {
                                await supabase.from('gallery').update({ src: publicUrl }).eq('id', photo.id)
                              }
                            } finally {
                              setIsUploading(false)
                            }
                          }
                        }}
                        className="flex-1 px-3 py-3 md:py-2.5 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-foreground text-sm file:mr-3 file:bg-[hsl(350,60%,55%)] file:text-white file:border-0 file:px-2 file:py-1 file:rounded file:cursor-pointer file:text-xs cursor-pointer"
                      />
                      {photo.src && (
                        <img src={photo.src} alt="Preview" className="w-10 h-10 rounded object-cover" />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>{"คำอธิบาย"}</label>
                    <input
                      type="text"
                      value={photo.caption || ""}
                      onChange={(e) => { 
                        // For text inputs, we might want to debounce, but for simplicity we update local state via parent or just trigger DB update on blur/change
                        // Here we trigger DB update immediately (Real-time)
                        supabase.from('gallery').update({ caption: e.target.value }).eq('id', photo.id)
                      }}
                      placeholder="วันที่เราเจอกัน..."
                      className={inputClass}
                    />
                  </div>
                </div>
              ))}
              {photos.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-8 font-light">
                  {"ยังไม่มีรูปภาพ กดเพิ่มรูปเพื่อเริ่มต้น"}
                </p>
              )}
            </div>
          )}

          {/* Videos Tab */}
          {activeTab === "videos" && (
            <div className="flex flex-col gap-4">
              <button
                onClick={() => 
                  supabase.from('videos').insert([{
                      title: "",
                      description: "",
                      thumbnail: "",
                      videoUrl: "",
                      category: "Our Collection",
                  }])
                }
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-90"
                style={{
                  backgroundColor: "rgba(220, 120, 140, 0.15)",
                  color: "hsl(350, 60%, 70%)",
                }}
              >
                <Plus className="w-4 h-4" /> {"เพิ่มวิดีโอ"}
              </button>
              {videos.map((video, i) => (
                <div key={video.id} className="glass rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{"วิดีโอที่"} {i + 1}</span>
                    <button
                      onClick={() => supabase.from('videos').delete().eq('id', video.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <label className={labelClass}>{"ชื่อวิดีโอ"}</label>
                    <input
                      type="text"
                      value={video.title}
                      onChange={(e) => {
                        supabase.from('videos').update({ title: e.target.value }).eq('id', video.id)
                      }}
                      placeholder="วิดีโอของเรา"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{"คำอธิบาย"}</label>
                    <input
                      type="text"
                      value={video.description || ""}
                      onChange={(e) => {
                        supabase.from('videos').update({ description: e.target.value }).eq('id', video.id)
                      }}
                      placeholder="เรื่องราวสุดพิเศษ..."
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{"เลือกวิดีโอ"}</label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setIsUploading(true)
                          try {
                            const publicUrl = await uploadFile(file, 'videos')
                            if (publicUrl) {
                              await supabase.from('videos').update({ videoUrl: publicUrl }).eq('id', video.id)
                            }
                          } finally {
                            setIsUploading(false)
                          }
                        }
                      }}
                      className="w-full px-3 py-2.5 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-foreground text-sm file:mr-3 file:bg-[hsl(350,60%,55%)] file:text-white file:border-0 file:px-2 file:py-1 file:rounded file:cursor-pointer file:text-xs cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{"เลือก Thumbnail"}</label>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setIsUploading(true)
                            try {
                              const publicUrl = await uploadFile(file, 'memories')
                              if (publicUrl) {
                                await supabase.from('videos').update({ thumbnail: publicUrl }).eq('id', video.id)
                              }
                            } finally {
                              setIsUploading(false)
                            }
                          }
                        }}
                        className="flex-1 px-3 py-2.5 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-foreground text-sm file:mr-3 file:bg-[hsl(350,60%,55%)] file:text-white file:border-0 file:px-2 file:py-1 file:rounded file:cursor-pointer file:text-xs cursor-pointer"
                      />
                      {video.thumbnail && (
                        <img src={video.thumbnail} alt="Thumbnail preview" className="w-10 h-10 rounded object-cover" />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>{"หมวดหมู่"}</label>
                    <input
                      type="text"
                      value={video.category || ""}
                      onChange={(e) => {
                        supabase.from('videos').update({ category: e.target.value }).eq('id', video.id)
                      }}
                      placeholder="Our Collection"
                      className={inputClass}
                    />
                  </div>
                </div>
              ))}
              {videos.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-8 font-light">
                  {"ยังไม่มีวิดีโอ กดเพิ่มวิดีโอเพื่อเริ่มต้น"}
                </p>
              )}
            </div>
          )}

          {/* Chapters Tab */}
          {activeTab === "chapters" && (
            <div className="flex flex-col gap-4">
              <button
                onClick={() => supabase.from('chapters').insert([{ title: "", text: "", side: "left" }])
                }
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-90"
                style={{
                  backgroundColor: "rgba(220, 120, 140, 0.15)",
                  color: "hsl(350, 60%, 70%)",
                }}
              >
                <Plus className="w-4 h-4" /> {"เพิ่มบท"}
              </button>
              {chapters.map((chapter, i) => (
                <div key={chapter.id} className="glass rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{"บทที่"} {i + 1}</span>
                    <button
                      onClick={() => supabase.from('chapters').delete().eq('id', chapter.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <label className={labelClass}>{"หัวข้อ"}</label>
                    <input
                      type="text"
                      value={chapter.title}
                      onChange={(e) => {
                        supabase.from('chapters').update({ title: e.target.value }).eq('id', chapter.id)
                      }}
                      placeholder="วันแรกที่เราเจอกัน"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{"เนื้อหา"}</label>
                    <textarea
                      value={chapter.text}
                      onChange={(e) => {
                        supabase.from('chapters').update({ text: e.target.value }).eq('id', chapter.id)
                      }}
                      placeholder="เล่าเรื่องราวที่เกิดขึ้น..."
                      className={`${inputClass} min-h-[80px] resize-y`}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{"ตำแหน่ง"}</label>
                    <select
                      value={chapter.side}
                      onChange={(e) => {
                        supabase.from('chapters').update({ side: e.target.value }).eq('id', chapter.id)
                      }}
                      className={inputClass}
                    >
                      <option value="left">{"ซ้าย"}</option>
                      <option value="right">{"ขวา"}</option>
                      <option value="center">{"กลาง"}</option>
                    </select>
                  </div>
                </div>
              ))}
              {chapters.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-8 font-light">
                  {"ยังไม่มีเรื่องราว กดเพิ่มบทเพื่อเริ่มเล่า"}
                </p>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="flex flex-col gap-4">
              <div className="glass rounded-xl p-4 flex flex-col gap-3">
                <h3 className="text-sm font-medium" style={{ color: "hsl(350, 40%, 80%)" }}>
                  {"ชื่อคู่รัก"}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>{"ชื่อคนที่ 1"}</label>
                    <input
                      type="text"
                      value={localSettings.name1}
                      onChange={(e) => setLocalSettings({ ...localSettings, name1: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{"ชื่อคนที่ 2"}</label>
                    <input
                      type="text"
                      value={localSettings.name2}
                      onChange={(e) => setLocalSettings({ ...localSettings, name2: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="glass rounded-xl p-4 flex flex-col gap-3">
                <h3 className="text-sm font-medium" style={{ color: "hsl(350, 40%, 80%)" }}>
                  {"วันที่เริ่มต้น"}
                </h3>
                <div>
                  <label className={labelClass}>{"วันที่คบกัน"}</label>
                  <input
                    type="date"
                    value={localSettings.startDate}
                    onChange={(e) => setLocalSettings({ ...localSettings, startDate: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="glass rounded-xl p-4 flex flex-col gap-3">
                <h3 className="text-sm font-medium" style={{ color: "hsl(350, 40%, 80%)" }}>
                  {"เพลงพื้นหลัง (MP3)"}
                </h3>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className={labelClass}>{"URL เพลง (YouTube หรือ MP3)"}</label>
                    <input
                      type="text"
                      value={localSettings.musicUrl || ""}
                      onChange={(e) => setLocalSettings({ ...localSettings, musicUrl: e.target.value })}
                      placeholder="https://youtu.be/..."
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{"URL วิดีโอหลัก (หน้า Netflix)"}</label>
                  <input
                    type="text"
                    value={localSettings.videoUrl || ""}
                    onChange={(e) => setLocalSettings({ ...localSettings, videoUrl: e.target.value })}
                    placeholder="https://..."
                    className={inputClass}
                  />
                  </div>
                </div>
              </div>

              <div className="glass rounded-xl p-4 flex flex-col gap-3">
                <h3 className="text-sm font-medium" style={{ color: "hsl(350, 40%, 80%)" }}>
                  {"รหัสผ่าน"}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>{"รหัสดู"}</label>
                    <input
                      type="text"
                      value={localSettings.viewPassword}
                      onChange={(e) => setLocalSettings({ ...localSettings, viewPassword: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{"รหัส Admin"}</label>
                    <input
                      type="text"
                      value={localSettings.adminPassword}
                      onChange={(e) => setLocalSettings({ ...localSettings, adminPassword: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="glass rounded-xl p-4 flex flex-col gap-3">
                <h3 className="text-sm font-medium" style={{ color: "hsl(350, 40%, 80%)" }}>
                  {"โปรไฟล์ Netflix"}
                </h3>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-3">
                    <label className={labelClass}>{"โปรไฟล์ที่ 1"}</label>
                    <input
                      type="text"
                      value={localSettings.profileName1}
                      onChange={(e) => setLocalSettings({ ...localSettings, profileName1: e.target.value })}
                      placeholder="ชื่อ"
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={localSettings.profileAvatar1}
                      onChange={(e) => setLocalSettings({ ...localSettings, profileAvatar1: e.target.value })}
                      placeholder="URL รูปโปรไฟล์"
                      className={inputClass}
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <label className={labelClass}>{"โปรไฟล์ที่ 2"}</label>
                    <input
                      type="text"
                      value={localSettings.profileName2}
                      onChange={(e) => setLocalSettings({ ...localSettings, profileName2: e.target.value })}
                      placeholder="ชื่อ"
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={localSettings.profileAvatar2}
                      onChange={(e) => setLocalSettings({ ...localSettings, profileAvatar2: e.target.value })}
                      placeholder="URL รูปโปรไฟล์"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveSettings}
                disabled={isUploading}
                className="flex items-center justify-center gap-2 px-6 py-3.5 md:py-3 rounded-xl text-base md:text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                style={{
                  background: "linear-gradient(135deg, hsl(350, 60%, 45%), hsl(345, 70%, 30%))",
                  color: "hsl(350, 40%, 90%)",
                }}
              >
                {isUploading ? (
                  <span className="animate-pulse">{"กำลังบันทึก..."}</span>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> {"บันทึกการตั้งค่า"}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
