"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Music, Mic, Upload, Play, Pause, Square, Download, Settings } from "lucide-react"

type VisualizationType = "waveform" | "frequency" | "circular"
type ColorMode = "gradient" | "solid" | "rainbow"
type InputSource = "microphone" | "file"

export default function AudioVisualizer() {
  const [isActive, setIsActive] = useState(false)
  const [inputSource, setInputSource] = useState<InputSource>("microphone")
  const [visualizationType, setVisualizationType] = useState<VisualizationType>("waveform")
  const [colorMode, setColorMode] = useState<ColorMode>("gradient")
  const [primaryColor, setPrimaryColor] = useState("#8884d8")
  const [secondaryColor, setSecondaryColor] = useState("#82ca9d")
  const [sensitivity, setSensitivity] = useState(1)
  const [smoothing, setSmoothing] = useState(0.8)
  const [mirrorMode, setMirrorMode] = useState(false)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | MediaElementAudioSourceNode | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const initializeAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 2048
      analyserRef.current.smoothingTimeConstant = smoothing
    }
  }, [smoothing])

  const startMicrophone = useCallback(async () => {
    try {
      setError(null)
      initializeAudioContext()

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      setHasPermission(true)

      if (audioContextRef.current && analyserRef.current) {
        sourceRef.current = audioContextRef.current.createMediaStreamSource(stream)
        sourceRef.current.connect(analyserRef.current)
        setIsActive(true)
      }
    } catch (err) {
      setError("Microphone access denied. Please allow microphone access and try again.")
      console.error("Microphone error:", err)
    }
  }, [initializeAudioContext])

  const startFilePlayback = useCallback(() => {
    if (!audioFile) return

    try {
      setError(null)
      initializeAudioContext()

      if (audioElementRef.current) {
        audioElementRef.current.pause()
        audioElementRef.current.src = ""
      }

      const audio = new Audio()
      audioElementRef.current = audio
      audio.src = URL.createObjectURL(audioFile)
      audio.crossOrigin = "anonymous"

      if (audioContextRef.current && analyserRef.current) {
        sourceRef.current = audioContextRef.current.createMediaElementSource(audio)
        sourceRef.current.connect(analyserRef.current)
        analyserRef.current.connect(audioContextRef.current.destination)

        audio.play()
        setIsPlaying(true)
        setIsActive(true)

        audio.onended = () => {
          setIsPlaying(false)
          setIsActive(false)
        }
      }
    } catch (err) {
      setError("Failed to load audio file. Please try a different file.")
      console.error("Audio file error:", err)
    }
  }, [audioFile, initializeAudioContext])

  const stopVisualization = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (audioElementRef.current) {
      audioElementRef.current.pause()
      audioElementRef.current.src = ""
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect()
      sourceRef.current = null
    }

    setIsActive(false)
    setIsPlaying(false)
  }, [])

  const togglePlayback = useCallback(() => {
    if (inputSource === "microphone") {
      if (isActive) {
        stopVisualization()
      } else {
        startMicrophone()
      }
    } else {
      if (isActive && audioElementRef.current) {
        if (isPlaying) {
          audioElementRef.current.pause()
          setIsPlaying(false)
        } else {
          audioElementRef.current.play()
          setIsPlaying(true)
        }
      } else {
        startFilePlayback()
      }
    }
  }, [inputSource, isActive, isPlaying, startMicrophone, startFilePlayback, stopVisualization])

  const drawVisualization = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const bufferLength = analyserRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      if (!isActive) return

      analyserRef.current!.getByteFrequencyData(dataArray)

      ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const width = canvas.width
      const height = canvas.height
      const centerX = width / 2
      const centerY = height / 2

      if (visualizationType === "waveform") {
        analyserRef.current!.getByteTimeDomainData(dataArray)

        ctx.lineWidth = 2
        ctx.strokeStyle =
          colorMode === "gradient" ? `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})` : primaryColor
        ctx.beginPath()

        const sliceWidth = width / bufferLength
        let x = 0

        for (let i = 0; i < bufferLength; i++) {
          const v = (dataArray[i] / 128.0) * sensitivity
          const y = (v * height) / 2

          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }

          x += sliceWidth
        }

        ctx.stroke()

        if (mirrorMode) {
          ctx.save()
          ctx.scale(1, -1)
          ctx.translate(0, -height)
          ctx.stroke()
          ctx.restore()
        }
      } else if (visualizationType === "frequency") {
        const barWidth = (width / bufferLength) * 2.5
        let x = 0

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * height * sensitivity

          if (colorMode === "rainbow") {
            const hue = (i / bufferLength) * 360
            ctx.fillStyle = `hsl(${hue}, 70%, 60%)`
          } else if (colorMode === "gradient") {
            const ratio = i / bufferLength
            ctx.fillStyle = `rgb(${Math.floor(Number.parseInt(primaryColor.slice(1, 3), 16) * (1 - ratio) + Number.parseInt(secondaryColor.slice(1, 3), 16) * ratio)}, ${Math.floor(Number.parseInt(primaryColor.slice(3, 5), 16) * (1 - ratio) + Number.parseInt(secondaryColor.slice(3, 5), 16) * ratio)}, ${Math.floor(Number.parseInt(primaryColor.slice(5, 7), 16) * (1 - ratio) + Number.parseInt(secondaryColor.slice(5, 7), 16) * ratio)})`
          } else {
            ctx.fillStyle = primaryColor
          }

          ctx.fillRect(x, height - barHeight, barWidth, barHeight)

          if (mirrorMode) {
            ctx.fillRect(x, 0, barWidth, barHeight)
          }

          x += barWidth + 1
        }
      } else if (visualizationType === "circular") {
        const radius = Math.min(width, height) / 4
        const angleStep = (Math.PI * 2) / bufferLength

        for (let i = 0; i < bufferLength; i++) {
          const amplitude = (dataArray[i] / 255) * radius * sensitivity
          const angle = i * angleStep

          const x1 = centerX + Math.cos(angle) * radius
          const y1 = centerY + Math.sin(angle) * radius
          const x2 = centerX + Math.cos(angle) * (radius + amplitude)
          const y2 = centerY + Math.sin(angle) * (radius + amplitude)

          if (colorMode === "rainbow") {
            const hue = (i / bufferLength) * 360
            ctx.strokeStyle = `hsl(${hue}, 70%, 60%)`
          } else if (colorMode === "gradient") {
            const ratio = i / bufferLength
            ctx.strokeStyle = `rgb(${Math.floor(Number.parseInt(primaryColor.slice(1, 3), 16) * (1 - ratio) + Number.parseInt(secondaryColor.slice(1, 3), 16) * ratio)}, ${Math.floor(Number.parseInt(primaryColor.slice(3, 5), 16) * (1 - ratio) + Number.parseInt(secondaryColor.slice(3, 5), 16) * ratio)}, ${Math.floor(Number.parseInt(primaryColor.slice(5, 7), 16) * (1 - ratio) + Number.parseInt(secondaryColor.slice(5, 7), 16) * ratio)})`
          } else {
            ctx.strokeStyle = primaryColor
          }

          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.stroke()
        }
      }

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()
  }, [isActive, visualizationType, colorMode, primaryColor, secondaryColor, sensitivity, mirrorMode])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("audio/")) {
      setAudioFile(file)
      setError(null)
    } else {
      setError("Please select a valid audio file (MP3, WAV, OGG, etc.)")
    }
  }

  const takeScreenshot = () => {
    if (!canvasRef.current) return

    const link = document.createElement("a")
    link.download = `audio-visualization-${Date.now()}.png`
    link.href = canvasRef.current.toDataURL()
    link.click()
  }

  useEffect(() => {
    if (isActive) {
      drawVisualization()
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isActive, drawVisualization])

  useEffect(() => {
    if (analyserRef.current) {
      analyserRef.current.smoothingTimeConstant = smoothing
    }
  }, [smoothing])

  useEffect(() => {
    return () => {
      stopVisualization()
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [stopVisualization])

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Music className="h-6 w-6 text-primary" />
              <CardTitle>Audio Visualizer</CardTitle>
            </div>
            <CardDescription>Visualize microphone or audio file input with real-time graphics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Input Source Selection */}
              <div className="flex justify-center gap-4">
                <Button
                  variant={inputSource === "microphone" ? "default" : "outline"}
                  onClick={() => {
                    setInputSource("microphone")
                    stopVisualization()
                  }}
                  className="flex items-center gap-2"
                >
                  <Mic className="h-4 w-4" />
                  Microphone
                </Button>
                <Button
                  variant={inputSource === "file" ? "default" : "outline"}
                  onClick={() => {
                    setInputSource("file")
                    stopVisualization()
                  }}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Audio File
                </Button>
              </div>

              {/* File Upload */}
              {inputSource === "file" && (
                <div className="text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    {audioFile ? audioFile.name : "Select Audio File"}
                  </Button>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <motion.div
                  className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
                </motion.div>
              )}

              {/* Canvas */}
              <div className="relative">
                <canvas ref={canvasRef} width={800} height={400} className="w-full h-96 border rounded-lg bg-black" />
                {!isActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                    <div className="text-center text-white">
                      <Music className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">
                        {inputSource === "microphone"
                          ? "Click Start to begin visualization"
                          : "Select an audio file to start"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-4">
                <Button onClick={togglePlayback} disabled={inputSource === "file" && !audioFile} size="lg">
                  {isActive ? (
                    inputSource === "microphone" ? (
                      <>
                        <Square className="mr-2 h-4 w-4" />
                        Stop
                      </>
                    ) : isPlaying ? (
                      <>
                        <Pause className="mr-2 h-4 w-4" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Resume
                      </>
                    )
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Start
                    </>
                  )}
                </Button>
                <Button onClick={takeScreenshot} variant="outline" disabled={!isActive}>
                  <Download className="mr-2 h-4 w-4" />
                  Screenshot
                </Button>
              </div>

              {/* Settings */}
              <Tabs defaultValue="visualization" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="visualization">Visualization</TabsTrigger>
                  <TabsTrigger value="audio">Audio Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="visualization" className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Visualization Type</Label>
                        <Select
                          value={visualizationType}
                          onValueChange={(value: VisualizationType) => setVisualizationType(value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="waveform">Waveform</SelectItem>
                            <SelectItem value="frequency">Frequency Bars</SelectItem>
                            <SelectItem value="circular">Circular</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Color Mode</Label>
                        <Select value={colorMode} onValueChange={(value: ColorMode) => setColorMode(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gradient">Gradient</SelectItem>
                            <SelectItem value="solid">Solid</SelectItem>
                            <SelectItem value="rainbow">Rainbow</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {colorMode !== "rainbow" && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Primary Color</Label>
                            <input
                              type="color"
                              value={primaryColor}
                              onChange={(e) => setPrimaryColor(e.target.value)}
                              className="w-full h-10 rounded border cursor-pointer"
                            />
                          </div>
                          {colorMode === "gradient" && (
                            <div>
                              <Label>Secondary Color</Label>
                              <input
                                type="color"
                                value={secondaryColor}
                                onChange={(e) => setSecondaryColor(e.target.value)}
                                className="w-full h-10 rounded border cursor-pointer"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label>Sensitivity: {sensitivity.toFixed(1)}</Label>
                        <input
                          type="range"
                          min="0.1"
                          max="3"
                          step="0.1"
                          value={sensitivity}
                          onChange={(e) => setSensitivity(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <Label>Smoothing: {smoothing.toFixed(1)}</Label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={smoothing}
                          onChange={(e) => setSmoothing(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>

                      <label className="flex items-center space-x-2">
                        <input type="checkbox" checked={mirrorMode} onChange={(e) => setMirrorMode(e.target.checked)} />
                        <span>Mirror Mode</span>
                      </label>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="audio" className="space-y-6">
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Audio Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Input Source:</span>
                        <span className="font-medium capitalize">{inputSource}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className={`font-medium ${isActive ? "text-green-600" : "text-red-600"}`}>
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      {inputSource === "microphone" && (
                        <div className="flex justify-between">
                          <span>Permission:</span>
                          <span className={`font-medium ${hasPermission ? "text-green-600" : "text-red-600"}`}>
                            {hasPermission ? "Granted" : "Not granted"}
                          </span>
                        </div>
                      )}
                      {inputSource === "file" && audioFile && (
                        <div className="flex justify-between">
                          <span>File:</span>
                          <span className="font-medium truncate max-w-48">{audioFile.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-medium mb-2">Browser Compatibility</h4>
                    <div className="text-sm space-y-1">
                      <p>✅ Chrome, Firefox, Safari, Edge (latest versions)</p>
                      <p>✅ Supports MP3, WAV, OGG, M4A audio formats</p>
                      <p>⚠️ Microphone requires HTTPS in production</p>
                      <p>💡 For best results, use headphones to prevent feedback</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
