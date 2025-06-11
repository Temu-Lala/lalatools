"use client"

import { useState, useRef, useEffect } from "react"
import Barcode from "react-barcode"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { BarChart3, Download, Copy, Check, RefreshCw, AlertCircle } from "lucide-react"

// Barcode format types
type BarcodeFormat = "CODE128" | "CODE39" | "EAN13" | "EAN8" | "UPC" | "ITF14" | "MSI" | "pharmacode" | "codabar"

// Template examples for different barcode formats
const TEMPLATES: Record<BarcodeFormat, string> = {
  CODE128: "Hello World",
  CODE39: "HELLO123",
  EAN13: "5901234123457",
  EAN8: "90311017",
  UPC: "123456789012",
  ITF14: "10012345678902",
  MSI: "1234567",
  pharmacode: "1234",
  codabar: "A12345B",
}

// Validation rules for each format
const VALIDATION_RULES: Record<BarcodeFormat, { regex: RegExp; message: string }> = {
  CODE128: {
    regex: /^[\x00-\x7F]+$/,
    message: "CODE128 accepts any ASCII character",
  },
  CODE39: {
    regex: /^[A-Z0-9\-. $/+%]+$/,
    message: "CODE39 only accepts uppercase letters, numbers, and - . $ / + % space",
  },
  EAN13: {
    regex: /^\d{12,13}$/,
    message: "EAN13 requires exactly 12 or 13 digits",
  },
  EAN8: {
    regex: /^\d{7,8}$/,
    message: "EAN8 requires exactly 7 or 8 digits",
  },
  UPC: {
    regex: /^\d{11,12}$/,
    message: "UPC requires exactly 11 or 12 digits",
  },
  ITF14: {
    regex: /^\d{14}$/,
    message: "ITF14 requires exactly 14 digits",
  },
  MSI: {
    regex: /^\d+$/,
    message: "MSI only accepts digits",
  },
  pharmacode: {
    regex: /^[1-9]\d{0,5}$/,
    message: "Pharmacode accepts numbers between 3 and 131070",
  },
  codabar: {
    regex: /^[A-D][0-9\-$:/.+]+[A-D]$/,
    message: "Codabar requires start/stop characters (A-D) and digits, -, $, :, /, ., +",
  },
}

export default function BarcodeGenerator() {
  const { toast } = useToast()
  const barcodeRef = useRef<HTMLDivElement>(null)

  // State for barcode options
  const [barcodeValue, setBarcodeValue] = useState("Hello World")
  const [format, setFormat] = useState<BarcodeFormat>("CODE128")
  const [width, setWidth] = useState(2)
  const [height, setHeight] = useState(100)
  const [fontSize, setFontSize] = useState(14)
  const [margin, setMargin] = useState(10)
  const [background, setBackground] = useState("#FFFFFF")
  const [lineColor, setLineColor] = useState("#000000")
  const [displayValue, setDisplayValue] = useState(true)
  const [copied, setCopied] = useState(false)
  const [isValid, setIsValid] = useState(true)
  const [validationMessage, setValidationMessage] = useState("")

  // Validate barcode value when format or value changes
  useEffect(() => {
    const rule = VALIDATION_RULES[format]
    const valid = rule.regex.test(barcodeValue)
    setIsValid(valid)
    setValidationMessage(valid ? "" : rule.message)
  }, [barcodeValue, format])

  // Handle format change
  const handleFormatChange = (newFormat: BarcodeFormat) => {
    setFormat(newFormat)
    // Set template example for the selected format
    setBarcodeValue(TEMPLATES[newFormat])
  }

  // Generate random barcode value based on format
  const generateRandom = () => {
    let result = ""

    switch (format) {
      case "CODE128":
        // Generate random ASCII string
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
        const length = Math.floor(Math.random() * 10) + 5
        for (let i = 0; i < length; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        break

      case "CODE39":
        // Generate random CODE39 compatible string
        const code39chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-. $/+%"
        const code39length = Math.floor(Math.random() * 10) + 5
        for (let i = 0; i < code39length; i++) {
          result += code39chars.charAt(Math.floor(Math.random() * code39chars.length))
        }
        break

      case "EAN13":
        // Generate 12 random digits (checksum will be added)
        for (let i = 0; i < 12; i++) {
          result += Math.floor(Math.random() * 10)
        }
        break

      case "EAN8":
        // Generate 7 random digits (checksum will be added)
        for (let i = 0; i < 7; i++) {
          result += Math.floor(Math.random() * 10)
        }
        break

      case "UPC":
        // Generate 11 random digits (checksum will be added)
        for (let i = 0; i < 11; i++) {
          result += Math.floor(Math.random() * 10)
        }
        break

      case "ITF14":
        // Generate 14 random digits
        for (let i = 0; i < 14; i++) {
          result += Math.floor(Math.random() * 10)
        }
        break

      case "MSI":
        // Generate random digits
        const msiLength = Math.floor(Math.random() * 10) + 4
        for (let i = 0; i < msiLength; i++) {
          result += Math.floor(Math.random() * 10)
        }
        break

      case "pharmacode":
        // Generate random number between 3 and 131070
        result = Math.floor(Math.random() * 131067 + 3).toString()
        break

      case "codabar":
        // Generate random codabar with start/stop characters
        const startStop = "ABCD"
        const start = startStop.charAt(Math.floor(Math.random() * 4))
        const end = startStop.charAt(Math.floor(Math.random() * 4))
        const codabarChars = "0123456789-$:/.+"
        const codabarLength = Math.floor(Math.random() * 10) + 4
        let codabarContent = ""
        for (let i = 0; i < codabarLength; i++) {
          codabarContent += codabarChars.charAt(Math.floor(Math.random() * codabarChars.length))
        }
        result = start + codabarContent + end
        break
    }

    setBarcodeValue(result)
  }

  // Download barcode as PNG
  const downloadBarcode = () => {
    if (!barcodeRef.current) return

    try {
      // Find the SVG element
      const svg = barcodeRef.current.querySelector("svg")
      if (!svg) {
        throw new Error("SVG element not found")
      }

      // Create a canvas element
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        throw new Error("Could not create canvas context")
      }

      // Set canvas dimensions
      const svgRect = svg.getBoundingClientRect()
      canvas.width = svgRect.width
      canvas.height = svgRect.height

      // Create an image from the SVG
      const img = new Image()
      const svgData = new XMLSerializer().serializeToString(svg)
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
      const svgUrl = URL.createObjectURL(svgBlob)

      img.onload = () => {
        // Draw the image on the canvas
        ctx.fillStyle = background
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)

        // Convert canvas to PNG and download
        const pngUrl = canvas.toDataURL("image/png")
        const downloadLink = document.createElement("a")
        downloadLink.href = pngUrl
        downloadLink.download = `barcode-${format}-${Date.now()}.png`
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)

        // Clean up
        URL.revokeObjectURL(svgUrl)

        toast({
          title: "Barcode Downloaded",
          description: "Your barcode has been downloaded as a PNG file.",
        })
      }

      img.src = svgUrl
    } catch (error) {
      console.error("Error downloading barcode:", error)
      toast({
        title: "Download Failed",
        description: "There was an error downloading your barcode.",
        variant: "destructive",
      })
    }
  }

  // Copy barcode to clipboard
  const copyToClipboard = async () => {
    if (!barcodeRef.current) return

    try {
      // Find the SVG element
      const svg = barcodeRef.current.querySelector("svg")
      if (!svg) {
        throw new Error("SVG element not found")
      }

      // Create a canvas element
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        throw new Error("Could not create canvas context")
      }

      // Set canvas dimensions
      const svgRect = svg.getBoundingClientRect()
      canvas.width = svgRect.width
      canvas.height = svgRect.height

      // Create an image from the SVG
      const img = new Image()
      const svgData = new XMLSerializer().serializeToString(svg)
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
      const svgUrl = URL.createObjectURL(svgBlob)

      img.onload = async () => {
        // Draw the image on the canvas
        ctx.fillStyle = background
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)

        // Convert canvas to blob and copy to clipboard
        canvas.toBlob(async (blob) => {
          if (blob) {
            try {
              await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])

              setCopied(true)
              setTimeout(() => setCopied(false), 2000)

              toast({
                title: "Copied to Clipboard",
                description: "Barcode image copied to clipboard successfully.",
              })
            } catch (err) {
              console.error("Failed to copy:", err)
              toast({
                title: "Copy Failed",
                description: "Could not copy to clipboard. Your browser may not support this feature.",
                variant: "destructive",
              })
            }
          }

          // Clean up
          URL.revokeObjectURL(svgUrl)
        })
      }

      img.src = svgUrl
    } catch (error) {
      console.error("Error copying barcode:", error)
      toast({
        title: "Copy Failed",
        description: "There was an error copying your barcode.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              <CardTitle>Barcode Generator</CardTitle>
            </div>
            <CardDescription>Generate barcodes from text or numbers for easy scanning</CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="generator" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="generator">Generator</TabsTrigger>
                <TabsTrigger value="settings">Customization</TabsTrigger>
              </TabsList>

              <TabsContent value="generator" className="space-y-6 mt-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Barcode Preview */}
                  <div className="flex-1 flex flex-col items-center justify-center p-6 border rounded-lg bg-white dark:bg-gray-950">
                    <div ref={barcodeRef} className="flex items-center justify-center min-h-[200px]">
                      {isValid ? (
                        <Barcode
                          value={barcodeValue}
                          format={format}
                          width={width}
                          height={height}
                          fontSize={fontSize}
                          margin={margin}
                          background={background}
                          lineColor={lineColor}
                          displayValue={displayValue}
                        />
                      ) : (
                        <div className="text-center text-red-500 flex flex-col items-center gap-2">
                          <AlertCircle size={48} />
                          <p>Invalid barcode value</p>
                          <p className="text-sm">{validationMessage}</p>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" onClick={downloadBarcode} disabled={!isValid}>
                        <Download className="mr-2 h-4 w-4" />
                        Download PNG
                      </Button>

                      <Button variant="outline" onClick={copyToClipboard} disabled={!isValid}>
                        {copied ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Input Controls */}
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="format">Barcode Format</Label>
                      <Select value={format} onValueChange={(value) => handleFormatChange(value as BarcodeFormat)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CODE128">CODE128 (General purpose)</SelectItem>
                          <SelectItem value="CODE39">CODE39 (Alphanumeric)</SelectItem>
                          <SelectItem value="EAN13">EAN-13 (Product barcode)</SelectItem>
                          <SelectItem value="EAN8">EAN-8 (Compact product)</SelectItem>
                          <SelectItem value="UPC">UPC-A (US product)</SelectItem>
                          <SelectItem value="ITF14">ITF-14 (Shipping)</SelectItem>
                          <SelectItem value="MSI">MSI (Inventory)</SelectItem>
                          <SelectItem value="pharmacode">Pharmacode (Pharmaceutical)</SelectItem>
                          <SelectItem value="codabar">Codabar (Libraries, blood banks)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="value">Barcode Value</Label>
                      <div className="flex gap-2">
                        <Input
                          id="value"
                          value={barcodeValue}
                          onChange={(e) => setBarcodeValue(e.target.value)}
                          className={!isValid ? "border-red-500" : ""}
                        />
                        <Button variant="outline" size="icon" onClick={generateRandom} title="Generate random value">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                      {!isValid && <p className="text-xs text-red-500">{validationMessage}</p>}
                    </div>

                    <div className="pt-4">
                      <h3 className="font-medium mb-2">Quick Templates</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setBarcodeValue("123456789012")}
                          className="h-auto py-2"
                        >
                          Product (123456789012)
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setBarcodeValue("ITEM-2023-456")}
                          className="h-auto py-2"
                        >
                          Inventory (ITEM-2023-456)
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setBarcodeValue("https://example.com")}
                          className="h-auto py-2"
                        >
                          URL (example.com)
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setBarcodeValue("ID-12345-ABCDE")}
                          className="h-auto py-2"
                        >
                          ID (ID-12345-ABCDE)
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Barcode Dimensions */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Dimensions</h3>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="width">Bar Width: {width}</Label>
                        <span className="text-sm text-muted-foreground">(1-5)</span>
                      </div>
                      <Slider
                        id="width"
                        min={1}
                        max={5}
                        step={0.5}
                        value={[width]}
                        onValueChange={(value) => setWidth(value[0])}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="height">Height: {height}px</Label>
                        <span className="text-sm text-muted-foreground">(50-200)</span>
                      </div>
                      <Slider
                        id="height"
                        min={50}
                        max={200}
                        step={10}
                        value={[height]}
                        onValueChange={(value) => setHeight(value[0])}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="margin">Margin: {margin}px</Label>
                        <span className="text-sm text-muted-foreground">(0-50)</span>
                      </div>
                      <Slider
                        id="margin"
                        min={0}
                        max={50}
                        step={5}
                        value={[margin]}
                        onValueChange={(value) => setMargin(value[0])}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="fontSize">Font Size: {fontSize}px</Label>
                        <span className="text-sm text-muted-foreground">(8-24)</span>
                      </div>
                      <Slider
                        id="fontSize"
                        min={8}
                        max={24}
                        step={1}
                        value={[fontSize]}
                        onValueChange={(value) => setFontSize(value[0])}
                      />
                    </div>
                  </div>

                  {/* Appearance */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Appearance</h3>

                    <div className="space-y-2">
                      <Label htmlFor="background">Background Color</Label>
                      <div className="flex gap-2">
                        <div className="w-10 h-10 rounded border" style={{ backgroundColor: background }} />
                        <Input
                          id="background"
                          type="color"
                          value={background}
                          onChange={(e) => setBackground(e.target.value)}
                          className="w-full h-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lineColor">Bar Color</Label>
                      <div className="flex gap-2">
                        <div className="w-10 h-10 rounded border" style={{ backgroundColor: lineColor }} />
                        <Input
                          id="lineColor"
                          type="color"
                          value={lineColor}
                          onChange={(e) => setLineColor(e.target.value)}
                          className="w-full h-10"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                      <Switch id="displayValue" checked={displayValue} onCheckedChange={setDisplayValue} />
                      <Label htmlFor="displayValue">Show Text Below Barcode</Label>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
