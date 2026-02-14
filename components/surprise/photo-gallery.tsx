"use client"

import { useState, useRef, useEffect, useCallback } from "react"
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
  const containerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

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

  const checkScroll = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 10)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }, [])

  useEffect(() => {
    checkScroll()
    const el = containerRef.current
    el?.addEventListener("scroll", checkScroll)
    window.addEventListener("resize", checkScroll)
    return () => {
      el?.removeEventListener("scroll", checkScroll)
      window.removeEventListener("resize", checkScroll)
    }
  }, [checkScroll])

  const scroll = (dir: "left" | "right") => {
    containerRef.current?.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" })
  }

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
            className="text-3xl md:text-4xl font-light text-center mb-3"
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
      <div className="relative px-4 md:px-8 max-w-6xl mx-auto">
        {/* Left scroll button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 glass rounded-full p-2 md:p-3 text-foreground/70 hover:text-foreground transition-all hover:bg-[rgba(220,120,140,0.2)]"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        )}

        {/* Right scroll button */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 glass rounded-full p-2 md:p-3 text-foreground/70 hover:text-foreground transition-all hover:bg-[rgba(220,120,140,0.2)]"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        )}

        {/* Carousel */}
        <div
          ref={containerRef}
          className="flex gap-4 md:gap-6 overflow-x-auto scroll-smooth px-12 md:px-14"
          style={{ scrollbarWidth: "none", scrollBehavior: "smooth" }}
        >
          {photos.map((photo, i) => (
            <div
              key={photo.id}
              ref={(el) => { itemRefs.current[i] = el }}
              data-index={i}
              className={`group relative flex-shrink-0 w-[220px] sm:w-[260px] md:w-[300px] aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 ${
                visibleItems.has(i) ? "opacity-100 scale-100" : "opacity-0 scale-95"
              } hover:scale-105 hover:shadow-2xl`}
              style={{
                transitionDelay: `${(i % 3) * 100}ms`,
                boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
              }}
              onClick={() => setSelectedIndex(i)}
            >
              {/* Image */}
              <Image
                src={photo.src}
                alt={photo.caption || `Memory ${i + 1}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 220px, (max-width: 768px) 260px, 300px"
              />

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Caption and details */}
              {photo.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <p className="text-sm md:text-base font-light line-clamp-2" style={{ color: "hsl(350, 40%, 95%)" }}>
                    {photo.caption}
                  </p>
                </div>
              )}

              {/* Top accent bar */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{
                  background: "linear-gradient(90deg, hsl(350, 60%, 55%), hsl(350, 60%, 45%))",
                  opacity: 0.8,
                }}
              />
            </div>
          ))}
        </div>

        {/* Bottom indicator dots */}
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: Math.min(photos.length, 5) }).map((_, i) => (
            <button
              key={i}
              onClick={() => {
                const idx = Math.min(i * 2, photos.length - 1)
                setSelectedIndex(idx)
              }}
              className="w-2 h-2 rounded-full transition-all"
              style={{
                backgroundColor: i === 0 ? "hsl(350, 60%, 55%)" : "hsl(350, 40%, 30%)",
                transform: i === 0 ? "scale(1.3)" : "scale(1)",
              }}
              aria-label={`Go to photo set ${i + 1}`}
            />
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
        </div>
      )}
    </>
  )
}
