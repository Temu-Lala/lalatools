"use client"

import React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageIcon, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react"

const sampleImages = [
  {
    url: "/placeholder.svg?height=400&width=600",
    title: "Mountain Landscape",
    description: "Beautiful mountain scenery with snow-capped peaks",
  },
  {
    url: "/placeholder.svg?height=400&width=600",
    title: "Ocean Sunset",
    description: "Stunning sunset over the ocean waves",
  },
  {
    url: "/placeholder.svg?height=400&width=600",
    title: "Forest Path",
    description: "Peaceful walking path through a green forest",
  },
  {
    url: "/placeholder.svg?height=400&width=600",
    title: "City Skyline",
    description: "Modern city skyline at night with lights",
  },
  {
    url: "/placeholder.svg?height=400&width=600",
    title: "Desert Dunes",
    description: "Golden sand dunes in the desert",
  },
]

export default function ImageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(false)

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % sampleImages.length)
  }

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + sampleImages.length) % sampleImages.length)
  }

  const goToImage = (index: number) => {
    setCurrentIndex(index)
  }

  const toggleAutoPlay = () => {
    setIsAutoPlay(!isAutoPlay)
  }

  // Auto-play functionality
  React.useEffect(() => {
    if (isAutoPlay) {
      const interval = setInterval(nextImage, 3000)
      return () => clearInterval(interval)
    }
  }, [isAutoPlay])

  const currentImage = sampleImages[currentIndex]

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ImageIcon className="h-6 w-6 text-primary" />
              <CardTitle>Image Carousel</CardTitle>
            </div>
            <CardDescription>Create beautiful image slideshows</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Main Image Display */}
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    className="absolute inset-0"
                    initial={{ opacity: 0, x: 300 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -300 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img
                      src={currentImage.url || "/placeholder.svg"}
                      alt={currentImage.title}
                      className="w-full h-full object-cover"
                    />

                    {/* Image Info Overlay */}
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h3 className="text-white text-xl font-semibold mb-1">{currentImage.title}</h3>
                      <p className="text-white/80 text-sm">{currentImage.description}</p>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows */}
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white border-0"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white border-0"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                {/* Image Counter */}
                <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentIndex + 1} / {sampleImages.length}
                </div>
              </div>

              {/* Thumbnail Navigation */}
              <div className="flex gap-2 justify-center overflow-x-auto pb-2">
                {sampleImages.map((image, index) => (
                  <motion.button
                    key={index}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentIndex
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-transparent hover:border-muted-foreground/30"
                    }`}
                    onClick={() => goToImage(index)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <img
                      src={image.url || "/placeholder.svg"}
                      alt={image.title}
                      className="w-full h-full object-cover"
                    />
                  </motion.button>
                ))}
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-4">
                <Button onClick={prevImage} variant="outline">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                <Button onClick={toggleAutoPlay} variant="outline">
                  {isAutoPlay ? (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Auto Play
                    </>
                  )}
                </Button>

                <Button onClick={nextImage} variant="outline">
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              {/* Dots Indicator */}
              <div className="flex justify-center gap-2">
                {sampleImages.map((_, index) => (
                  <motion.button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                    onClick={() => goToImage(index)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
