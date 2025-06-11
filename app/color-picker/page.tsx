"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Palette, Copy, Check } from "lucide-react"

export default function ColorPicker() {
  const [color, setColor] = useState("#6366f1")
  const [rgbColor, setRgbColor] = useState({ r: 99, g: 102, b: 241 })
  const [hslColor, setHslColor] = useState({ h: 239, s: 84, l: 67 })
  const [copied, setCopied] = useState<string | null>(null)
  const [recentColors, setRecentColors] = useState<string[]>([])

  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return { r: 0, g: 0, b: 0 }

    return {
      r: Number.parseInt(result[1], 16),
      g: Number.parseInt(result[2], 16),
      b: Number.parseInt(result[3], 16),
    }
  }

  // Convert RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0,
      s = 0,
      l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }

      h /= 6
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    }
  }

  // Update RGB and HSL when hex color changes
  useEffect(() => {
    const rgb = hexToRgb(color)
    setRgbColor(rgb)

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
    setHslColor(hsl)
  }, [color])

  // Load recent colors from localStorage
  useEffect(() => {
    const savedColors = localStorage.getItem("recentColors")
    if (savedColors) {
      try {
        setRecentColors(JSON.parse(savedColors))
      } catch (e) {
        console.error("Failed to parse recent colors from localStorage")
      }
    }
  }, [])

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value)
    addToRecentColors(e.target.value)
  }

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    if (!value.startsWith("#")) {
      value = "#" + value
    }

    // Only update if it's a valid hex color
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      setColor(value)
      addToRecentColors(value)
    }
  }

  const addToRecentColors = (newColor: string) => {
    const updatedColors = [newColor, ...recentColors.filter((c) => c !== newColor)].slice(0, 10)

    setRecentColors(updatedColors)
    localStorage.setItem("recentColors", JSON.stringify(updatedColors))
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-6 w-6 text-primary" />
              <CardTitle>Color Picker</CardTitle>
            </div>
            <CardDescription>Select and copy color codes in various formats</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="w-full h-32 rounded-md mb-4 border" style={{ backgroundColor: color }}></div>
              <Input type="color" value={color} onChange={handleColorChange} className="h-12 w-full cursor-pointer" />
            </div>

            <Tabs defaultValue="hex">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="hex">HEX</TabsTrigger>
                <TabsTrigger value="rgb">RGB</TabsTrigger>
                <TabsTrigger value="hsl">HSL</TabsTrigger>
              </TabsList>

              <TabsContent value="hex" className="space-y-4">
                <div className="flex gap-2 mt-4">
                  <Input value={color} onChange={handleHexInputChange} className="font-mono" />
                  <Button size="icon" variant="outline" onClick={() => copyToClipboard(color, "hex")}>
                    {copied === "hex" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="rgb" className="space-y-4">
                <div className="flex gap-2 mt-4">
                  <Input value={`rgb(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b})`} readOnly className="font-mono" />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => copyToClipboard(`rgb(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b})`, "rgb")}
                  >
                    {copied === "rgb" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="hsl" className="space-y-4">
                <div className="flex gap-2 mt-4">
                  <Input value={`hsl(${hslColor.h}, ${hslColor.s}%, ${hslColor.l}%)`} readOnly className="font-mono" />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => copyToClipboard(`hsl(${hslColor.h}, ${hslColor.s}%, ${hslColor.l}%)`, "hsl")}
                  >
                    {copied === "hsl" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {recentColors.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Recent Colors</h3>
                <div className="flex flex-wrap gap-2">
                  {recentColors.map((recentColor, index) => (
                    <button
                      key={index}
                      className="w-8 h-8 rounded-md border cursor-pointer"
                      style={{ backgroundColor: recentColor }}
                      onClick={() => setColor(recentColor)}
                      title={recentColor}
                    ></button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
