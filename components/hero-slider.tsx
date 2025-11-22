"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface SlideImage {
  src: string
  title: string
  description: string
}

interface HeroSliderProps {
  slides: SlideImage[]
}

export function HeroSlider({ slides }: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  useEffect(() => {
    if (!isAutoPlay || slides.length === 0) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlay, slides.length])

  const goToSlide = (index: number) => {
    setCurrentSlide(index % slides.length)
    setIsAutoPlay(false)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    setIsAutoPlay(false)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    setIsAutoPlay(false)
  }

  if (slides.length === 0) {
    return null
  }

  const slide = slides[currentSlide]

  const ChevronLeftIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  )

  const ChevronRightIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )

  return (
    <section className="relative w-full h-screen overflow-hidden bg-[#4E0942]">
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((s, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img src={s.src || "/placeholder.svg"} alt={s.title} className="w-full h-full object-cover" />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ))}
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="text-center space-y-6 text-white animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-bold text-balance">{slide.title}</h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">{slide.description}</p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="absolute inset-y-0 left-0 z-20 flex items-center">
        <Button
          onClick={prevSlide}
          className="ml-4 bg-white/30 hover:bg-white/50 text-white rounded-full p-3 backdrop-blur-sm"
          size="icon"
        >
          <ChevronLeftIcon />
        </Button>
      </div>

      <div className="absolute inset-y-0 right-0 z-20 flex items-center">
        <Button
          onClick={nextSlide}
          className="mr-4 bg-white/30 hover:bg-white/50 text-white rounded-full p-3 backdrop-blur-sm"
          size="icon"
        >
          <ChevronRightIcon />
        </Button>
      </div>

      {/* Dot Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide ? "bg-white w-8 h-3" : "bg-white/50 w-3 h-3 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Auto-play toggle */}
      <button
        onClick={() => setIsAutoPlay(!isAutoPlay)}
        className="absolute top-8 right-8 z-20 text-white text-sm bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white/30 transition-all"
      >
        {isAutoPlay ? "Pause" : "Play"}
      </button>
    </section>
  )
}
