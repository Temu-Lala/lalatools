"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Brush, Eraser, Download, RotateCcw, Palette } from "lucide-react"

export default function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [brushSize, setBrushSize] = useState([5])
  const [brushColor, setBrushColor] = useState("#000000")
  const [tool, setTool] = useState<"brush" | "eraser">("brush")
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 })

  const colors = [
    "#000000",
    "#FFFFFF",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#FFA500",
    "#800080",
    "#FFC0CB",
    "#A52A2A",
    "#808080",
    "#000080",
    "#008000",
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Set initial canvas background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setIsDrawing(true)
    setLastPosition({ x, y })
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(lastPosition.x, lastPosition.y)
    ctx.lineTo(x, y)

    if (tool === "brush") {
      ctx.globalCompositeOperation = "source-over"
      ctx.strokeStyle = brushColor
    } else {
      ctx.globalCompositeOperation = "destination-out"
    }

    ctx.lineWidth = brushSize[0]
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.stroke()

    setLastPosition({ x, y })
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const downloadCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement("a")
    link.download = `drawing-${Date.now()}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brush className="h-6 w-6 text-primary" />
              <CardTitle>Drawing Canvas</CardTitle>
            </div>
            <CardDescription>Draw and sketch with digital tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Tools */}
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex gap-2">
                  <Button variant={tool === "brush" ? "default" : "outline"} size="sm" onClick={() => setTool("brush")}>
                    <Brush className="mr-2 h-4 w-4" />
                    Brush
                  </Button>
                  <Button
                    variant={tool === "eraser" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTool("eraser")}
                  >
                    <Eraser className="mr-2 h-4 w-4" />
                    Eraser
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Label>Size:</Label>
                  <div className="w-24">
                    <Slider value={brushSize} onValueChange={setBrushSize} min={1} max={50} step={1} />
                  </div>
                  <span className="text-sm w-8">{brushSize[0]}</span>
                </div>

                <div className="flex gap-2">
                  <Button onClick={clearCanvas} variant="outline" size="sm">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Clear
                  </Button>
                  <Button onClick={downloadCanvas} variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>

              {/* Color Palette */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Colors
                </Label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <motion.button
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 ${
                        brushColor === color ? "border-primary ring-2 ring-primary/20" : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setBrushColor(color)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    />
                  ))}
                  <input
                    type="color"
                    value={brushColor}
                    onChange={(e) => setBrushColor(e.target.value)}
                    className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer"
                  />
                </div>
              </div>

              {/* Canvas */}
              <motion.div
                className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <canvas
                  ref={canvasRef}
                  className="w-full h-96 cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
              </motion.div>

              {/* Brush Preview */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>Preview:</span>
                  <div
                    className="rounded-full border"
                    style={{
                      width: Math.max(brushSize[0], 4),
                      height: Math.max(brushSize[0], 4),
                      backgroundColor: tool === "brush" ? brushColor : "transparent",
                      borderColor: tool === "brush" ? brushColor : "#666",
                      borderStyle: tool === "eraser" ? "dashed" : "solid",
                    }}
                  />
                </div>
                <span>
                  Tool: {tool === "brush" ? "Brush" : "Eraser"} | Size: {brushSize[0]}px
                  {tool === "brush" && ` | Color: ${brushColor}`}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
