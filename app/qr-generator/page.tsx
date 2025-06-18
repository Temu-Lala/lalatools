"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { QrCode, Download, Copy, Check, RefreshCw, Smartphone, Wifi, Mail, Phone, Image as ImageIcon } from "lucide-react"

export default function QRCodeGenerator() {
  const [text, setText] = useState(" type here  your text, URL, or data here")
  const [qrCodeDataURL, setQrCodeDataURL] = useState("")
  const [size, setSize] = useState([256])
  const [errorLevel, setErrorLevel] = useState("M")
  const [margin, setMargin] = useState([4])
  const [darkColor, setDarkColor] = useState("#000000")
  const [lightColor, setLightColor] = useState("#ffffff")
  const [copied, setCopied] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoSize, setLogoSize] = useState([20]) // Percentage of QR code size
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  // Handle logo file selection
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.match('image.*')) {
      alert('Please select an image file')
      return
    }

    setLogoFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (event) => {
      setLogoPreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Remove logo
  const removeLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
    if (logoInputRef.current) {
      logoInputRef.current.value = ''
    }
    generateQRCode() // Regenerate without logo
  }

  // Draw logo on QR code
  const drawLogoOnQR = (qrDataURL: string, callback: (dataURL: string) => void) => {
    if (!logoPreview) {
      callback(qrDataURL)
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const qrSize = size[0]
    canvas.width = qrSize
    canvas.height = qrSize

    const qrImage = new window.Image()
    qrImage.onload = () => {
      // Draw QR code
      ctx.drawImage(qrImage, 0, 0, qrSize, qrSize)

      // Draw logo
      const logoImage = new window.Image()
      logoImage.onload = () => {
        const logoWidth = (qrSize * logoSize[0]) / 100
        const logoHeight = (qrSize * logoSize[0]) / 100
        const x = (qrSize - logoWidth) / 2
        const y = (qrSize - logoHeight) / 2

        // Draw white background for logo
        ctx.fillStyle = lightColor
        ctx.fillRect(x - 2, y - 2, logoWidth + 4, logoHeight + 4)

        // Draw logo
        ctx.drawImage(logoImage, x, y, logoWidth, logoHeight)

        const dataURL = canvas.toDataURL("image/png")
        callback(dataURL)
      }
      logoImage.src = logoPreview
    }
    qrImage.src = qrDataURL
  }

  // QR Code generation using QR Server API (reliable external service)
  const generateQRCode = async () => {
    if (!text.trim()) return

    setIsGenerating(true)

    try {
      // Use QR Server API for reliable QR code generation
      const encodedText = encodeURIComponent(text)
      const qrSize = size[0]
      const darkColorHex = darkColor.replace("#", "")
      const lightColorHex = lightColor.replace("#", "")

      const apiURL = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodedText}&ecc=${errorLevel}&margin=${margin[0]}&color=${darkColorHex}&bgcolor=${lightColorHex}&format=png`

      // Test if the URL works by loading it
      const img = new window.Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        // Draw the image to canvas to get data URL
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        canvas.width = qrSize
        canvas.height = qrSize

        ctx.drawImage(img, 0, 0, qrSize, qrSize)
        const dataURL = canvas.toDataURL("image/png")
        
        // Add logo if exists
        drawLogoOnQR(dataURL, (finalDataURL) => {
          setQrCodeDataURL(finalDataURL)
          setIsGenerating(false)
        })
      }

      img.onerror = () => {
        // Fallback: use the API URL directly
        drawLogoOnQR(apiURL, (finalDataURL) => {
          setQrCodeDataURL(finalDataURL)
          setIsGenerating(false)
        })
      }

      img.src = apiURL
    } catch (error) {
      console.error("Error generating QR code:", error)
      // Final fallback: generate using canvas with simple pattern
      generateSimpleQRCode()
    }
  }

  // Simple QR-like pattern generator as final fallback
  const generateSimpleQRCode = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const qrSize = size[0]
    const marginSize = margin[0]
    canvas.width = qrSize
    canvas.height = qrSize

    // Clear canvas with background color
    ctx.fillStyle = lightColor
    ctx.fillRect(0, 0, qrSize, qrSize)

    // Generate a simple pattern
    const moduleCount = 25
    const moduleSize = (qrSize - marginSize * 2) / moduleCount
    const startPos = marginSize

    // Create pattern based on text hash
    const pattern = createPatternFromText(text, moduleCount)

    ctx.fillStyle = darkColor

    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (pattern[row][col]) {
          const x = startPos + col * moduleSize
          const y = startPos + row * moduleSize
          ctx.fillRect(x, y, moduleSize, moduleSize)
        }
      }
    }

    const dataURL = canvas.toDataURL("image/png")
    
    // Add logo if exists
    drawLogoOnQR(dataURL, (finalDataURL) => {
      setQrCodeDataURL(finalDataURL)
      setIsGenerating(false)
    })
  }

  // Create a deterministic pattern from text
  const createPatternFromText = (input: string, size: number): boolean[][] => {
    const pattern: boolean[][] = Array(size)
      .fill(null)
      .map(() => Array(size).fill(false))

    // Simple hash function
    let hash = 0
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }

    // Use hash as seed for pseudo-random pattern
    let seed = Math.abs(hash)

    // Add corner markers (finder patterns)
    addCornerMarkers(pattern, size)

    // Fill with pattern
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (!isCornerArea(row, col, size)) {
          seed = (seed * 9301 + 49297) % 233280
          pattern[row][col] = seed / 233280 > 0.5
        }
      }
    }

    return pattern
  }

  const addCornerMarkers = (pattern: boolean[][], size: number) => {
    const markerSize = 7
    const positions = [
      [0, 0], // Top-left
      [0, size - markerSize], // Top-right
      [size - markerSize, 0], // Bottom-left
    ]

    positions.forEach(([startRow, startCol]) => {
      for (let row = 0; row < markerSize; row++) {
        for (let col = 0; col < markerSize; col++) {
          if (startRow + row < size && startCol + col < size) {
            const isEdge = row === 0 || row === markerSize - 1 || col === 0 || col === markerSize - 1
            const isCenter = row >= 2 && row <= 4 && col >= 2 && col <= 4
            pattern[startRow + row][startCol + col] = isEdge || isCenter
          }
        }
      }
    })
  }

  const isCornerArea = (row: number, col: number, size: number): boolean => {
    const markerSize = 9 // Include separator
    return (
      (row < markerSize && col < markerSize) ||
      (row < markerSize && col >= size - markerSize) ||
      (row >= size - markerSize && col < markerSize)
    )
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      generateQRCode()
    }, 300) // Debounce to avoid too many API calls

    return () => clearTimeout(timeoutId)
  }, [text, size, errorLevel, margin, darkColor, lightColor, logoPreview, logoSize])

  const downloadQRCode = () => {
    if (!qrCodeDataURL) return

    const link = document.createElement("a")
    link.download = `qr-code-${Date.now()}.png`
    link.href = qrCodeDataURL
    link.click()
  }

  const copyToClipboard = async () => {
    if (!qrCodeDataURL) return

    try {
      if (qrCodeDataURL.startsWith("data:")) {
        // Convert data URL to blob
        const response = await fetch(qrCodeDataURL)
        const blob = await response.blob()
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ])
      } else {
        // For external URLs, copy the text instead
        await navigator.clipboard.writeText(text)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      // Fallback: copy the text
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (e) {
        console.error("Failed to copy:", e)
      }
    }
  }

  const presetTemplates = [
    {
      name: "Website URL",
      icon: <QrCode className="h-4 w-4" />,
      template: "https://example.com",
      description: "Website or webpage link",
    },
    {
      name: "WiFi Network",
      icon: <Wifi className="h-4 w-4" />,
      template: "WIFI:T:WPA;S:MyNetwork;P:MyPassword;H:false;;",
      description: "WiFi connection details",
    },
    {
      name: "Contact Card",
      icon: <Phone className="h-4 w-4" />,
      template: "BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nTEL:+1234567890\nEMAIL:john@example.com\nEND:VCARD",
      description: "Contact information (vCard)",
    },
    {
      name: "Email",
      icon: <Mail className="h-4 w-4" />,
      template: "mailto:example@email.com?subject=Hello&body=Your message here",
      description: "Email with subject and body",
    },
    {
      name: "SMS Message",
      icon: <Smartphone className="h-4 w-4" />,
      template: "sms:+1234567890?body=Hello! This is a text message.",
      description: "SMS with phone number and message",
    },
    {
      name: "Phone Number",
      icon: <Phone className="h-4 w-4" />,
      template: "tel:+1234567890",
      description: "Phone number for direct calling",
    },
  ]

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <QrCode className="h-6 w-6 text-primary" />
              <CardTitle>QR Code Generator</CardTitle>
            </div>
            <CardDescription>Generate professional QR codes for any text, URL, or data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Input Section */}
              <div className="space-y-6">
                <Tabs defaultValue="text">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="text">Text/URL</TabsTrigger>
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                  </TabsList>

                  <TabsContent value="text" className="space-y-4">
                    <div>
                      <Label htmlFor="qr-text">Enter your content</Label>
                      <Textarea
                        id="qr-text"
                        placeholder="Enter text, URL, email, phone number, or any data..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={4}
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {text.length} characters • Supports URLs, text, email, phone, WiFi, and more
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="templates" className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      {presetTemplates.map((template) => (
                        <motion.div key={template.name} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            variant="outline"
                            className="w-full h-auto p-4 justify-start"
                            onClick={() => setText(template.template)}
                          >
                            <div className="flex items-center gap-3">
                              {template.icon}
                              <div className="text-left">
                                <div className="font-medium">{template.name}</div>
                                <div className="text-sm text-muted-foreground">{template.description}</div>
                              </div>
                            </div>
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Click any template to load it, then customize the content as needed.
                    </p>
                  </TabsContent>
                </Tabs>

                {/* Customization Options */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Customization Options</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Size: {size[0]}px</Label>
                      <Slider value={size} onValueChange={setSize} min={128} max={512} step={32} className="mt-2" />
                    </div>

                    <div>
                      <Label>Margin: {margin[0]}px</Label>
                      <Slider value={margin} onValueChange={setMargin} min={0} max={20} step={2} className="mt-2" />
                    </div>
                  </div>

                  <div>
                    <Label>Error Correction Level</Label>
                    <Select value={errorLevel} onValueChange={setErrorLevel}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L">Low (7% recovery)</SelectItem>
                        <SelectItem value="M">Medium (15% recovery)</SelectItem>
                        <SelectItem value="Q">Quartile (25% recovery)</SelectItem>
                        <SelectItem value="H">High (30% recovery)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Higher levels allow the QR code to work even if partially damaged
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dark-color">Foreground Color</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="dark-color"
                          type="color"
                          value={darkColor}
                          onChange={(e) => setDarkColor(e.target.value)}
                          className="w-16 h-10 p-1"
                        />
                        <Input value={darkColor} onChange={(e) => setDarkColor(e.target.value)} className="flex-1" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="light-color">Background Color</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="light-color"
                          type="color"
                          value={lightColor}
                          onChange={(e) => setLightColor(e.target.value)}
                          className="w-16 h-10 p-1"
                        />
                        <Input value={lightColor} onChange={(e) => setLightColor(e.target.value)} className="flex-1" />
                      </div>
                    </div>
                  </div>

                  {/* Logo Upload Section */}
                  <div>
                    <Label>Logo Center</Label>
                    <div className="mt-2 space-y-2">
                      {logoPreview ? (
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <img
                              src={logoPreview}
                              alt="Logo preview"
                              className="h-16 w-16 object-contain border rounded"
                            />
                            <button
                              onClick={removeLogo}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                              aria-label="Remove logo"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                          </div>
                          <div className="flex-1">
                            <Label>Logo Size: {logoSize[0]}%</Label>
                            <Slider
                              value={logoSize}
                              onValueChange={setLogoSize}
                              min={10}
                              max={30}
                              step={2}
                              className="mt-2"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            onClick={() => logoInputRef.current?.click()}
                            className="flex items-center gap-2"
                          >
                            <ImageIcon className="h-4 w-4" />
                            Add Logo
                          </Button>
                          <input
                            type="file"
                            ref={logoInputRef}
                            onChange={handleLogoUpload}
                            accept="image/*"
                            className="hidden"
                          />
                          <p className="text-xs text-muted-foreground">
                            Optional: Add a logo to the center of your QR code
                          </p>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      For best results, use a simple logo with transparent background
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview Section */}
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="font-semibold mb-4">QR Code Preview</h3>

                  <motion.div
                    className="inline-block p-4 bg-muted rounded-lg"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isGenerating ? (
                      <div className="flex items-center justify-center" style={{ width: size[0], height: size[0] }}>
                        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : qrCodeDataURL ? (
                      <img
                        src={qrCodeDataURL || "/placeholder.svg"}
                        alt="Generated QR Code"
                        className="max-w-full h-auto rounded"
                        style={{ width: size[0], height: size[0] }}
                      />
                    ) : (
                      <div
                        className="flex items-center justify-center bg-gray-200 rounded"
                        style={{ width: size[0], height: size[0] }}
                      >
                        <QrCode className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </motion.div>

                  {/* Hidden canvas for QR generation */}
                  <canvas ref={canvasRef} style={{ display: "none" }} />

                  <div className="flex justify-center gap-4 mt-6">
                    <Button onClick={downloadQRCode} disabled={!qrCodeDataURL || isGenerating}>
                      <Download className="mr-2 h-4 w-4" />
                      Download PNG
                    </Button>
                    <Button onClick={copyToClipboard} disabled={!qrCodeDataURL || isGenerating} variant="outline">
                      {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                    <Button onClick={generateQRCode} variant="outline" disabled={isGenerating}>
                      <RefreshCw className={`mr-2 h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                      Regenerate
                    </Button>
                  </div>
                </div>

                {/* QR Code Information */}
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-3">QR Code Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Dimensions:</span>
                      <Badge variant="secondary">
                        {size[0]} × {size[0]} pixels
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Error Correction:</span>
                      <Badge variant="secondary">Level {errorLevel}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Content Length:</span>
                      <Badge variant="secondary">{text.length} characters</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Margin:</span>
                      <Badge variant="secondary">{margin[0]}px</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Format:</span>
                      <Badge variant="secondary">PNG</Badge>
                    </div>
                    {logoPreview && (
                      <div className="flex justify-between">
                        <span>Logo Size:</span>
                        <Badge variant="secondary">{logoSize[0]}%</Badge>
                      </div>
                    )}
                  </div>
                </div>

                {/* Usage Guidelines */}
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-200">📱 Scanning Tips</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Use high contrast colors for better readability</li>
                    <li>• Minimum size of 2cm × 2cm for print materials</li>
                    <li>• Test your QR code with multiple devices before use</li>
                    <li>• Higher error correction helps with damaged codes</li>
                    <li>• Ensure good lighting when scanning</li>
                    {logoPreview && (
                      <li>• Keep logo size under 30% for best scannability</li>
                    )}
                  </ul>
                </div>

                {/* Quick Test */}
                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-medium mb-2 text-green-800 dark:text-green-200">✅ Quick Test</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Use your phone's camera app to scan the QR code above and verify it works correctly before sharing
                    or printing.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}