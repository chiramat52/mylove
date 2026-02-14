"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { X, ChevronLeft, ChevronRight, ZoomIn, Hand } from "lucide-react"
import Image from "next/image"
import { motion, useMotionValue, useSpring, useTransform, PanInfo, AnimatePresence } from "framer-motion"

export interface PhotoItem {
  id: string
  src: string
  caption?: string
}

interface PhotoGalleryProps {
  photos: PhotoItem[]
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set())
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

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
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    )

    itemRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [photos.length])

  if (photos.length === 0) {
    return (
      <div className="text-center py-16 px-4 text-muted-foreground font-light">
        <p>{"ยังไม่มีรูปภาพ กดเพิ่มรูปได้ในหน้า Admin"}</p>
      </div>
    )
  }

  return (
    <>
      {/* Header Section */}
      <div className="px-4 md:px-8 max-w-6xl mx-auto mb-12">
        <div className="relative mb-8">
          {/* Title */}
          <h2
            className="text-2xl md:text-4xl font-light text-center mb-3"
            style={{ color: "hsl(350, 40%, 85%)" }}
          >
            {"ความทรงจำของเรา"}
          </h2>

          {/* Subtitle */}
          <p className="text-center text-sm md:text-base text-muted-foreground font-light mb-6">
            {"คอลเลกชันรูปภาพจากวันพิเศษที่เราผ่านมาด้วยกัน"}
          </p>

          {/* Decorative accent bar */}
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

      {/* Gallery Container */}
      <div className="relative px-4 md:px-8 max-w-6xl mx-auto pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {photos.map((photo, i) => (
            <div
              key={photo.id}
              ref={(el) => { itemRefs.current[i] = el }}
              data-index={i}
              className={`group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer transition-all duration-700 ${
                visibleItems.has(i) ? "opacity-100 scale-100" : "opacity-0 scale-95"
              } hover:scale-105 hover:shadow-2xl hover:z-10`}
              style={{
                transitionDelay: `${(i % 4) * 100}ms`,
                boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                border: "4px solid rgba(255,255,255,0.05)"
              }}
              onClick={() => setSelectedIndex(i)}
            >
              {/* Image */}
              <Image
                src={photo.src}
                alt={photo.caption || `Memory ${i + 1}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Zoom Icon */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <div className="bg-black/40 backdrop-blur-sm p-1.5 rounded-full text-white/90">
                  <ZoomIn className="w-4 h-4" />
                </div>
              </div>

              {/* Caption and details */}
              {photo.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <p className="text-sm md:text-base font-light line-clamp-2" style={{ color: "hsl(350, 40%, 95%)" }}>
                    {photo.caption}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 bg-black/95 flex items-center justify-center"
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
              className="absolute left-4 text-foreground/70 hover:text-foreground transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {selectedIndex < photos.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSelectedIndex(selectedIndex + 1)
              }}
              className="absolute right-4 text-foreground/70 hover:text-foreground transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

          <div
            className="relative max-w-4xl max-h-[85vh] w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photos[selectedIndex].src}
              alt={photos[selectedIndex].caption || "Photo"}
              width={1200}
              height={800}
              className="object-contain w-full h-full max-h-[80vh] rounded-lg animate-netflix-zoom"
            />
            {photos[selectedIndex].caption && (
              <p
                className="text-center mt-4 text-sm font-light"
                style={{ color: "hsl(350, 40%, 80%)" }}
              >
                {photos[selectedIndex].caption}
              </p>
            )}
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  )
}

// Helper Component for Individual Cards
function CarouselItem({ photo, index, activeIndex, onClick }: { photo: PhotoItem, index: number, activeIndex: number, onClick: () => void }) {
  const isActive = index === activeIndex
  const distance = Math.abs(index - activeIndex)
  
  // Calculate styles based on distance from center
  const scale = isActive ? 1.1 : Math.max(0.8, 1 - distance * 0.1)
  const opacity = isActive ? 1 : Math.max(0.3, 1 - distance * 0.3)
  const rotateY = (index - activeIndex) * 5 // Slight rotation for "Curved" feel
  const zIndex = 10 - distance

  return (
    <motion.div
      className="relative flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl cursor-pointer bg-black/20"
      style={{
        width: typeof window !== 'undefined' && window.innerWidth < 768 ? 220 : 280,
        height: typeof window !== 'undefined' && window.innerWidth < 768 ? 320 : 400,
        scale,
        opacity,
        zIndex,
        rotateY,
        perspective: 1000,
        border: isActive ? "2px solid rgba(220, 120, 140, 0.5)" : "1px solid rgba(255,255,255,0.05)",
      }}
      animate={{ scale, opacity, rotateY, zIndex }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onClick={onClick}
    >
      <Image
        src={photo.src}
        alt={photo.caption || "Memory"}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 220px, 280px"
        draggable={false}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      
      {photo.caption && isActive && (
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-white text-sm font-light line-clamp-2 text-center">
            {photo.caption}
          </p>
        </div>
      )}
    </motion.div>
  )
}
