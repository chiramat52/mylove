"use client"

import { useState, useRef, useEffect } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

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
      <div className="text-center py-16 text-muted-foreground font-light">
        <p>{"ยังไม่มีรูปภาพ กดเพิ่มรูปได้ในหน้า Admin"}</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 px-4 max-w-5xl mx-auto">
        {photos.map((photo, i) => (
          <div
            key={photo.id}
            ref={(el) => { itemRefs.current[i] = el }}
            data-index={i}
            className={`group relative aspect-[4/5] rounded-xl overflow-hidden cursor-pointer transition-all duration-700 ${
              visibleItems.has(i) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: `${(i % 3) * 100}ms` }}
            onClick={() => setSelectedIndex(i)}
          >
            <Image
              src={photo.src}
              alt={photo.caption || `Memory ${i + 1}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {photo.caption && (
              <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-sm font-light" style={{ color: "hsl(350, 40%, 90%)" }}>
                  {photo.caption}
                </p>
              </div>
            )}
          </div>
        ))}
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
        </div>
      )}
    </>
  )
}
