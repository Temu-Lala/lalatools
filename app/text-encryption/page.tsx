"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Shield, Copy, Check, ArrowRightLeft } from "lucide-react"

export default function TextEncryption() {
  const [inputText, setInputText] = useState("")
  const [outputText, setOutputText] = useState("")
  const [caesarShift, setCaesarShift] = useState("3")
  const [copied, setCopied] = useState(false)
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt")

  const caesarCipher = (text: string, shift: number, decrypt = false) => {
    const actualShift = decrypt ? -shift : shift
    return text.replace(/[a-zA-Z]/g, (char) => {
      const start = char <= "Z" ? 65 : 97
      return String.fromCharCode(((char.charCodeAt(0) - start + actualShift + 26) % 26) + start)
    })
  }

  const base64Encode = (text: string) => {
    try {
      return btoa(unescape(encodeURIComponent(text)))
    } catch (e) {
      return "Error: Invalid characters for Base64 encoding"
    }
  }

  const base64Decode = (text: string) => {
    try {
      return decodeURIComponent(escape(atob(text)))
    } catch (e) {
      return "Error: Invalid Base64 string"
    }
  }

  const handleCaesarCipher = () => {
    const shift = Number.parseInt(caesarShift) || 0
    const result = caesarCipher(inputText, shift, mode === "decrypt")
    setOutputText(result)
  }

  const handleBase64 = () => {
    const result = mode === "encrypt" ? base64Encode(inputText) : base64Decode(inputText)
    setOutputText(result)
  }

  const handleROT13 = () => {
    // ROT13 is both encryption and decryption
    const result = caesarCipher(inputText, 13, false)
    setOutputText(result)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const swapTexts = () => {
    const temp = inputText
    setInputText(outputText)
    setOutputText(temp)
    setMode(mode === "encrypt" ? "decrypt" : "encrypt")
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle>Text Encryption</CardTitle>
            </div>
            <CardDescription>Encrypt and decrypt text with various ciphers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Mode Toggle */}
              <div className="flex justify-center">
                <div className="flex bg-muted rounded-lg p-1">
                  <Button
                    variant={mode === "encrypt" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setMode("encrypt")}
                  >
                    Encrypt
                  </Button>
                  <Button
                    variant={mode === "decrypt" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setMode("decrypt")}
                  >
                    Decrypt
                  </Button>
                </div>
              </div>

              {/* Input/Output Section */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="input-text">{mode === "encrypt" ? "Plain Text" : "Encrypted Text"}</Label>
                  <Textarea
                    id="input-text"
                    placeholder={mode === "encrypt" ? "Enter text to encrypt..." : "Enter text to decrypt..."}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="output-text">{mode === "encrypt" ? "Encrypted Text" : "Decrypted Text"}</Label>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={swapTexts}>
                        <ArrowRightLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={copyToClipboard} disabled={!outputText}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Textarea id="output-text" value={outputText} readOnly rows={6} className="font-mono" />
                </div>
              </div>

              {/* Encryption Methods */}
              <Tabs defaultValue="caesar" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="caesar">Caesar Cipher</TabsTrigger>
                  <TabsTrigger value="base64">Base64</TabsTrigger>
                  <TabsTrigger value="rot13">ROT13</TabsTrigger>
                </TabsList>

                <TabsContent value="caesar" className="space-y-4">
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-4">
                      <Label htmlFor="caesar-shift">Shift Value:</Label>
                      <Input
                        id="caesar-shift"
                        type="number"
                        min="1"
                        max="25"
                        value={caesarShift}
                        onChange={(e) => setCaesarShift(e.target.value)}
                        className="w-20"
                      />
                      <Button onClick={handleCaesarCipher} disabled={!inputText}>
                        {mode === "encrypt" ? "Encrypt" : "Decrypt"}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Caesar cipher shifts each letter by a fixed number of positions in the alphabet.
                    </p>
                  </motion.div>
                </TabsContent>

                <TabsContent value="base64" className="space-y-4">
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Button onClick={handleBase64} disabled={!inputText}>
                      {mode === "encrypt" ? "Encode to Base64" : "Decode from Base64"}
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Base64 encoding converts text to a base-64 representation. It's not encryption but encoding.
                    </p>
                  </motion.div>
                </TabsContent>

                <TabsContent value="rot13" className="space-y-4">
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Button onClick={handleROT13} disabled={!inputText}>
                      Apply ROT13
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      ROT13 is a Caesar cipher with a shift of 13. Applying ROT13 twice returns the original text.
                    </p>
                  </motion.div>
                </TabsContent>
              </Tabs>

              {/* Examples */}
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Quick Examples</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <strong>Caesar (shift 3):</strong>
                    <br />
                    "Hello" → "Khoor"
                  </div>
                  <div>
                    <strong>Base64:</strong>
                    <br />
                    "Hello" → "SGVsbG8="
                  </div>
                  <div>
                    <strong>ROT13:</strong>
                    <br />
                    "Hello" → "Uryyb"
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
