"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileImage, Upload, Download, Trash2, Settings, Copy, FileText, ImageIcon, RotateCcw } from "lucide-react"

interface ConvertedFile {
  id: string
  name: string
  originalSize: number
  convertedSize: number
  downloadUrl: string
  type: "image" | "text"
}

interface ImageSettings {
  quality: number
  width: number
  height: number
  maintainAspectRatio: boolean
}

export default function FileConverter() {
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([])
  const [isConverting, setIsConverting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)

  // Image conversion settings
  const [imageSettings, setImageSettings] = useState<ImageSettings>({
    quality: 90,
    width: 0,
    height: 0,
    maintainAspectRatio: true,
  })

  // Text conversion
  const [textInput, setTextInput] = useState("")
  const [textOutput, setTextOutput] = useState("")
  const [textFileName, setTextFileName] = useState("converted_file")
  const [textConversionType, setTextConversionType] = useState<"txt-to-md" | "md-to-txt">("txt-to-md")

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Image conversion functions
  const convertImage = useCallback(
    async (file: File, targetFormat: string): Promise<ConvertedFile> => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          reject(new Error("Canvas context not available"))
          return
        }

        img.onload = () => {
          // Calculate dimensions
          let { width, height } = img

          if (imageSettings.width > 0 || imageSettings.height > 0) {
            if (imageSettings.maintainAspectRatio) {
              const aspectRatio = width / height
              if (imageSettings.width > 0) {
                width = imageSettings.width
                height = width / aspectRatio
              } else if (imageSettings.height > 0) {
                height = imageSettings.height
                width = height * aspectRatio
              }
            } else {
              width = imageSettings.width || width
              height = imageSettings.height || height
            }
          }

          canvas.width = width
          canvas.height = height

          // Set white background for JPG conversion
          if (targetFormat === "jpeg") {
            ctx.fillStyle = "#FFFFFF"
            ctx.fillRect(0, 0, width, height)
          }

          ctx.drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Conversion failed"))
                return
              }

              const url = URL.createObjectURL(blob)
              const convertedFile: ConvertedFile = {
                id: Date.now().toString(),
                name: `${file.name.split(".")[0]}.${targetFormat === "jpeg" ? "jpg" : targetFormat}`,
                originalSize: file.size,
                convertedSize: blob.size,
                downloadUrl: url,
                type: "image",
              }

              resolve(convertedFile)
            },
            `image/${targetFormat}`,
            targetFormat === "jpeg" ? imageSettings.quality / 100 : 1,
          )
        }

        img.onerror = () => reject(new Error("Failed to load image"))
        img.src = URL.createObjectURL(file)
      })
    },
    [imageSettings],
  )

  // Text conversion functions
  const convertTextToMarkdown = (text: string): string => {
    let markdown = text

    // Convert headers (lines ending with :)
    markdown = markdown.replace(/^(.+):$/gm, "## $1")

    // Convert bullet points
    markdown = markdown.replace(/^[\s]*[-*]\s+(.+)$/gm, "- $1")

    // Convert numbered lists
    markdown = markdown.replace(/^[\s]*(\d+)[.)]\s+(.+)$/gm, "$1. $2")

    // Add emphasis to words in ALL CAPS (but not entire lines)
    markdown = markdown.replace(/\b([A-Z]{2,})\b/g, "**$1**")

    // Convert double line breaks to proper markdown paragraphs
    markdown = markdown.replace(/\n\n+/g, "\n\n")

    return markdown
  }

  const convertMarkdownToText = (markdown: string): string => {
    let text = markdown

    // Remove headers
    text = text.replace(/^#{1,6}\s+(.+)$/gm, "$1")

    // Remove bold and italic
    text = text.replace(/\*\*(.+?)\*\*/g, "$1")
    text = text.replace(/\*(.+?)\*/g, "$1")
    text = text.replace(/__(.+?)__/g, "$1")
    text = text.replace(/_(.+?)_/g, "$1")

    // Remove code blocks
    text = text.replace(/```[\s\S]*?```/g, "")
    text = text.replace(/`(.+?)`/g, "$1")

    // Remove links but keep text
    text = text.replace(/\[(.+?)\]$$.+?$$/g, "$1")

    // Remove images
    text = text.replace(/!\[.*?\]$$.+?$$/g, "")

    // Clean up extra whitespace
    text = text.replace(/\n{3,}/g, "\n\n")

    return text.trim()
  }

  const handleTextConversion = () => {
    if (!textInput.trim()) return

    let converted = ""
    if (textConversionType === "txt-to-md") {
      converted = convertTextToMarkdown(textInput)
    } else {
      converted = convertMarkdownToText(textInput)
    }

    setTextOutput(converted)
  }

  const downloadTextFile = () => {
    if (!textOutput) return

    const extension = textConversionType === "txt-to-md" ? "md" : "txt"
    const mimeType = textConversionType === "txt-to-md" ? "text/markdown" : "text/plain"

    const blob = new Blob([textOutput], { type: mimeType })
    const url = URL.createObjectURL(blob)

    const convertedFile: ConvertedFile = {
      id: Date.now().toString(),
      name: `${textFileName}.${extension}`,
      originalSize: new Blob([textInput]).size,
      convertedSize: blob.size,
      downloadUrl: url,
      type: "text",
    }

    setConvertedFiles((prev) => [...prev, convertedFile])

    // Auto download
    const link = document.createElement("a")
    link.href = url
    link.download = convertedFile.name
    link.click()
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(textOutput)
  }

  // File handling
  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setIsConverting(true)
    setProgress(0)

    const fileArray = Array.from(files)
    const imageFiles = fileArray.filter((file) => file.type.startsWith("image/"))

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i]
      const fileType = file.type.split("/")[1]

      try {
        let targetFormat = "png"
        if (fileType === "png") targetFormat = "jpeg"
        else if (fileType === "jpeg" || fileType === "jpg") targetFormat = "png"
        else if (fileType === "webp") targetFormat = "png"

        const convertedFile = await convertImage(file, targetFormat)
        setConvertedFiles((prev) => [...prev, convertedFile])

        setProgress(((i + 1) / imageFiles.length) * 100)
      } catch (error) {
        console.error("Conversion failed:", error)
      }
    }

    setIsConverting(false)
    setProgress(0)
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files)
    }
  }, [])

  const downloadFile = (file: ConvertedFile) => {
    const link = document.createElement("a")
    link.href = file.downloadUrl
    link.download = file.name
    link.click()
  }

  const removeFile = (id: string) => {
    setConvertedFiles((prev) => {
      const file = prev.find((f) => f.id === id)
      if (file) {
        URL.revokeObjectURL(file.downloadUrl)
      }
      return prev.filter((f) => f.id !== id)
    })
  }

  const clearAllFiles = () => {
    convertedFiles.forEach((file) => {
      URL.revokeObjectURL(file.downloadUrl)
    })
    setConvertedFiles([])
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileImage className="h-6 w-6 text-primary" />
              <CardTitle>File Converter</CardTitle>
            </div>
            <CardDescription>Convert images and text files entirely in your browser</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="image" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="image">Image Converter</TabsTrigger>
                <TabsTrigger value="text">Text Converter</TabsTrigger>
                <TabsTrigger value="files">Converted Files</TabsTrigger>
              </TabsList>

              <TabsContent value="image" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Upload Area */}
                  <div className="space-y-4">
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-medium mb-2">Drop images here or click to upload</p>
                      <p className="text-sm text-muted-foreground mb-4">Supports PNG, JPG, JPEG, WebP formats</p>
                      <Button onClick={() => fileInputRef.current?.click()}>
                        <Upload className="mr-2 h-4 w-4" />
                        Select Images
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleFileSelect(e.target.files)}
                        className="hidden"
                      />
                    </div>

                    {isConverting && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Converting...</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} />
                      </div>
                    )}
                  </div>

                  {/* Settings */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Settings className="h-5 w-5" />
                      <h3 className="font-semibold">Conversion Settings</h3>
                    </div>

                    <div>
                      <Label>JPEG Quality: {imageSettings.quality}%</Label>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={imageSettings.quality}
                        onChange={(e) => setImageSettings((prev) => ({ ...prev, quality: Number(e.target.value) }))}
                        className="w-full mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="width">Width (px)</Label>
                        <Input
                          id="width"
                          type="number"
                          placeholder="Auto"
                          value={imageSettings.width || ""}
                          onChange={(e) =>
                            setImageSettings((prev) => ({ ...prev, width: Number(e.target.value) || 0 }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="height">Height (px)</Label>
                        <Input
                          id="height"
                          type="number"
                          placeholder="Auto"
                          value={imageSettings.height || ""}
                          onChange={(e) =>
                            setImageSettings((prev) => ({ ...prev, height: Number(e.target.value) || 0 }))
                          }
                        />
                      </div>
                    </div>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={imageSettings.maintainAspectRatio}
                        onChange={(e) =>
                          setImageSettings((prev) => ({ ...prev, maintainAspectRatio: e.target.checked }))
                        }
                      />
                      <span>Maintain aspect ratio</span>
                    </label>

                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Conversion Info</h4>
                      <div className="text-sm space-y-1">
                        <p>• PNG → JPG: Removes transparency, adds compression</p>
                        <p>• JPG → PNG: Adds transparency support, lossless</p>
                        <p>• WebP → PNG: Converts to widely supported format</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="text" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Input */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Select value={textConversionType} onValueChange={(value: any) => setTextConversionType(value)}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="txt-to-md">TXT → Markdown</SelectItem>
                          <SelectItem value="md-to-txt">Markdown → TXT</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={handleTextConversion}>Convert</Button>
                    </div>

                    <div>
                      <Label htmlFor="text-input">
                        {textConversionType === "txt-to-md" ? "Plain Text Input" : "Markdown Input"}
                      </Label>
                      <Textarea
                        id="text-input"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder={
                          textConversionType === "txt-to-md"
                            ? "Enter plain text here...\n\nTitle:\nThis will become a header\n\n- This will become a bullet point"
                            : "Enter markdown here...\n\n## Header\n**Bold text**\n- Bullet point"
                        }
                        rows={12}
                      />
                    </div>
                  </div>

                  {/* Output */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="filename">Output filename:</Label>
                      <Input
                        id="filename"
                        value={textFileName}
                        onChange={(e) => setTextFileName(e.target.value)}
                        className="flex-1"
                      />
                      <span className="text-sm text-muted-foreground">
                        .{textConversionType === "txt-to-md" ? "md" : "txt"}
                      </span>
                    </div>

                    <div>
                      <Label htmlFor="text-output">
                        {textConversionType === "txt-to-md" ? "Markdown Output" : "Plain Text Output"}
                      </Label>
                      <Textarea id="text-output" value={textOutput} readOnly rows={12} className="font-mono" />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={downloadTextFile} disabled={!textOutput}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      <Button onClick={copyToClipboard} variant="outline" disabled={!textOutput}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Text Conversion Features</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>TXT → Markdown:</strong>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Lines ending with ":" become headers</li>
                        <li>Lines starting with "-" become bullet points</li>
                        <li>ALL CAPS words become bold</li>
                        <li>Numbered lists are preserved</li>
                      </ul>
                    </div>
                    <div>
                      <strong>Markdown → TXT:</strong>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Removes all markdown formatting</li>
                        <li>Extracts text from links</li>
                        <li>Removes code blocks and images</li>
                        <li>Cleans up extra whitespace</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="files" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Converted Files ({convertedFiles.length})</h3>
                  {convertedFiles.length > 0 && (
                    <Button onClick={clearAllFiles} variant="outline" size="sm">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Clear All
                    </Button>
                  )}
                </div>

                {convertedFiles.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p>No converted files yet</p>
                    <p className="text-sm">Convert some images or text files to see them here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {convertedFiles.map((file) => (
                        <motion.div
                          key={file.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          layout
                        >
                          <div className="flex items-center gap-3">
                            {file.type === "image" ? (
                              <ImageIcon className="h-8 w-8 text-blue-500" />
                            ) : (
                              <FileText className="h-8 w-8 text-green-500" />
                            )}
                            <div>
                              <p className="font-medium">{file.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatFileSize(file.originalSize)} → {formatFileSize(file.convertedSize)}
                                {file.convertedSize < file.originalSize && (
                                  <span className="text-green-600 ml-2">
                                    ({Math.round((1 - file.convertedSize / file.originalSize) * 100)}% smaller)
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={() => downloadFile(file)} size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button onClick={() => removeFile(file.id)} variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
