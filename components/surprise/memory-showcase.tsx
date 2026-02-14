"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { X, ChevronLeft, ChevronRight, Play } from "lucide-react"
import Image from "next/image"

export interface MemoryItem {
  image: string
  caption: string
}

export interface VideoMemory {
  title: string
  url: string
  thumbnail: string
}

interface MemoryShowcaseProps {
  memories: MemoryItem[]
  video?: VideoMemory
}

export function MemoryShowcase({ memories, video }: MemoryShowcaseProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set())
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const [playingVideo, setPlayingVideo] = useState(false)

  // ตั้งค่า Intersection Observer เพื่อโหลดอนุภาคแลฟ์ลี่ของรูปภาพ
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = Number(entry.target.getAttribute("data-index"))
          if (entry.isIntersecting) {
            setVisibleItems((prev) => new Set([...prev, idx]))
          }
        })
      },
      { threshold: 0.15 }
    )

    itemRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <>
      {/* ส่วนหัวขอ */}
      <div className="px-4 md:px-8 max-w-7xl mx-auto mb-12">
        <div className="relative mb-8">
          <h2
            className="text-3xl md:text-4xl font-light text-center mb-3"
            style={{ color: "hsl(350, 40%, 85%)" }}
          >
            {"ความทรงจำของเรา"}
          </h2>
          <p className="text-center text-sm md:text-base text-muted-foreground font-light mb-6">
            {"12 วินาทีที่เราสร้างร่วมกัน"}
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="h-px flex-1 max-w-32" style={{ backgroundColor: "hsl(350, 60%, 30%)" }} />
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "hsl(350, 60%, 55%)", boxShadow: "0 0 12px hsl(350, 60%, 55%)" }}
            />
            <div className="h-px flex-1 max-w-32" style={{ backgroundColor: "hsl(350, 60%, 30%)" }} />
          </div>
        </div>
      </div>

      {/* ส่วนตารางรูป 12 ภาพ + ส่วนวิดีโอ */}
      <div className="px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* ด้านซ้าย: 12 รูปในตารางขนาด 3x4 */}
          <div className="md:col-span-2">
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              {memories.map((memory, i) => (
                <div
                  key={i}
                  ref={(el) => { itemRefs.current[i] = el }}
                  data-index={i}
                  className={`group relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all duration-500 ${
                    visibleItems.has(i) ? "opacity-100 scale-100" : "opacity-0 scale-95"
                  } hover:scale-105 hover:shadow-xl`}
                  style={{
                    transitionDelay: `${(i % 4) * 100}ms`,
                  }}
                  onClick={() => setSelectedIndex(i)}
                >
                  {/* รูปภาพ */}
                  {memory.image ? (
                    <Image
                      src={memory.image}
                      alt={memory.caption || `ความทรงจำที่ ${i + 1}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 768px) 30vw, 20vw"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: "hsl(345, 40%, 12%)" }}
                    >
                      <span className="text-xs text-muted-foreground font-light">{`${i + 1}`}</span>
                    </div>
                  )}

                  {/* ชั้นซ้อนทับ */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* คำบรรยาย */}
                  {memory.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                      <p className="text-xs md:text-sm font-light line-clamp-2" style={{ color: "hsl(350, 40%, 95%)" }}>
                        {memory.caption}
                      </p>
                    </div>
                  )}

                  {/* ป้ายหมายเลข */}
                  <div
                    className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-light"
                    style={{
                      backgroundColor: "rgba(220, 120, 140, 0.3)",
                      color: "hsl(350, 40%, 90%)",
                    }}
                  >
                    {i + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ด้านขวา: ส่วนวิดีโอ */}
          <div className="md:col-span-1">
            <div className="flex flex-col gap-4 h-full">
              {/* ภาพขนาดย่อของวิดีโอ */}
              {video?.thumbnail ? (
                <div
                  className="relative group w-full aspect-video rounded-lg overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all hover:scale-105"
                  onClick={() => setPlayingVideo(true)}
                >
                  <Image
                    src={video.thumbnail}
                    alt={video.title || "วิดีโอ"}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: "rgba(220, 120, 140, 0.9)" }}
                    >
                      <Play className="w-6 h-6 fill-white text-white ml-1" />
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="w-full aspect-video rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "hsl(345, 40%, 12%)" }}
                >
                  <p className="text-muted-foreground font-light text-sm">{"ยังไม่มีวิดีโอ"}</p>
                </div>
              )}

              {/* ข้อมูลวิดีโอ */}
              <div className="flex-1">
                <p
                  className="text-sm md:text-base font-light mb-2"
                  style={{ color: "hsl(350, 40%, 85%)" }}
                >
                  {video?.title || "Our Special Moment"}
                </p>
                <p className="text-xs text-muted-foreground font-light line-clamp-3">
                  {"กดดูวิดีโอสุดพิเศษของเรา"}
                </p>
              </div>

              {/* ปุ่มเล่น */}
              {video?.url && (
                <button
                  onClick={() => setPlayingVideo(true)}
                  className="w-full py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-90 active:scale-95"
                  style={{
                    backgroundColor: "rgba(220, 120, 140, 0.2)",
                    color: "hsl(350, 60%, 65%)",
                    border: "1px solid rgba(220, 120, 140, 0.3)",
                  }}
                >
                  {"เล่นวิดีโอ"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* กล่องภาพแสดง - รูปภาพ */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 bg-black/95 flex items-center justify-center p-4"
          style={{ zIndex: 50 }}
          onClick={() => setSelectedIndex(null)}
        >
          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute top-6 right-6 text-foreground/70 hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>

          {selectedIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSelectedIndex(selectedIndex - 1)
              }}
              className="absolute left-4 md:left-8 text-foreground/70 hover:text-foreground transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {selectedIndex < memories.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSelectedIndex(selectedIndex + 1)
              }}
              className="absolute right-4 md:right-8 text-foreground/70 hover:text-foreground transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

          <div
            className="relative max-w-4xl max-h-[85vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {memories[selectedIndex]?.image ? (
              <Image
                src={memories[selectedIndex].image}
                alt={memories[selectedIndex].caption || `Memory`}
                width={1200}
                height={800}
                className="object-contain w-full h-full max-h-[80vh] rounded-lg"
              />
            ) : (
              <div
                className="w-full h-80 flex items-center justify-center rounded-lg"
                style={{ backgroundColor: "hsl(345, 40%, 12%)" }}
              >
                <p className="text-muted-foreground">{"ยังไม่มีรูปภาพ"}</p>
              </div>
            )}

            {memories[selectedIndex]?.caption && (
              <p className="text-center mt-4 text-sm font-light" style={{ color: "hsl(350, 40%, 80%)" }}>
                {memories[selectedIndex].caption}
              </p>
            )}

            <p className="text-center mt-2 text-xs text-muted-foreground">
              {selectedIndex + 1} / {memories.length}
            </p>
          </div>
        </div>
      )}

      {/* เครื่องเล่นวิดีโอ */}
      {playingVideo && video?.url && (
        <div className="fixed inset-0 bg-black flex items-center justify-center" style={{ zIndex: 60 }}>
          <button
            onClick={() => setPlayingVideo(false)}
            className="absolute top-6 right-6 text-foreground/70 hover:text-foreground transition-colors"
            aria-label="ปิด"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative w-full h-full flex items-center justify-center">
            <video
              src={video.url}
              autoPlay
              controls
              className="w-full h-full max-w-6xl max-h-[90vh] object-contain"
              playsInline
            />
          </div>
        </div>
      )}
    </>
  )
}
