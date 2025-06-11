"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Radio, Copy, Check, Volume2, ArrowRightLeft } from "lucide-react"

const morseCodeMap: { [key: string]: string } = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",
  "0": "-----",
  "1": ".----",
  "2": "..---",
  "3": "...--",
  "4": "....-",
  "5": ".....",
  "6": "-....",
  "7": "--...",
  "8": "---..",
  "9": "----.",
  " ": "/",
  ".": ".-.-.-",
  ",": "--..--",
  "?": "..--..",
  "'": ".----.",
  "!": "-.-.--",
  "/": "-..-.",
  "(": "-.--.",
  ")": "-.--.-",
  "&": ".-...",
  ":": "---...",
  ";": "-.-.-.",
  "=": "-...-",
  "+": ".-.-.",
  "-": "-....-",
  _: "..--.-",
  '"': ".-..-.",
  $: "...-..-",
  "@": ".--.-.",
}

const reverseMorseCodeMap: { [key: string]: string } = {}
Object.entries(morseCodeMap).forEach(([letter, morse]) => {
  reverseMorseCodeMap[morse] = letter
})

export default function MorseCodeTranslator() {
  const [inputText, setInputText] = useState("")
  const [outputText, setOutputText] = useState("")
  const [mode, setMode] = useState<"textToMorse" | "morseToText">("textToMorse")
  const [copied, setCopied] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const textToMorse = (text: string): string => {
    return text
      .toUpperCase()
      .split("")
      .map((char) => morseCodeMap[char] || char)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim()
  }

  const morseToText = (morse: string): string => {
    return morse
      .split(" ")
      .map((code) => reverseMorseCodeMap[code] || code)
      .join("")
      .replace(/\//g, " ")
  }

  const handleTranslate = () => {
    if (mode === "textToMorse") {
      setOutputText(textToMorse(inputText))
    } else {
      setOutputText(morseToText(inputText))
    }
  }

  const handleSwapMode = () => {
    const newMode = mode === "textToMorse" ? "morseToText" : "textToMorse"
    setMode(newMode)

    // Swap input and output
    const temp = inputText
    setInputText(outputText)
    setOutputText(temp)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const playMorseCode = async () => {
    if (!outputText || mode !== "textToMorse" || isPlaying) return

    setIsPlaying(true)

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const dotDuration = 100 // milliseconds
    const dashDuration = dotDuration * 3
    const pauseDuration = dotDuration
    const letterPauseDuration = dotDuration * 3
    const wordPauseDuration = dotDuration * 7

    let currentTime = audioContext.currentTime

    for (const char of outputText) {
      if (char === ".") {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.value = 600
        oscillator.type = "sine"

        gainNode.gain.setValueAtTime(0.3, currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + dotDuration / 1000)

        oscillator.start(currentTime)
        oscillator.stop(currentTime + dotDuration / 1000)

        currentTime += (dotDuration + pauseDuration) / 1000
      } else if (char === "-") {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.value = 600
        oscillator.type = "sine"

        gainNode.gain.setValueAtTime(0.3, currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + dashDuration / 1000)

        oscillator.start(currentTime)
        oscillator.stop(currentTime + dashDuration / 1000)

        currentTime += (dashDuration + pauseDuration) / 1000
      } else if (char === " ") {
        currentTime += letterPauseDuration / 1000
      } else if (char === "/") {
        currentTime += wordPauseDuration / 1000
      }
    }

    setTimeout(() => setIsPlaying(false), (currentTime - audioContext.currentTime) * 1000)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Radio className="h-6 w-6 text-primary" />
              <CardTitle>Morse Code Translator</CardTitle>
            </div>
            <CardDescription>Convert text to Morse code and vice versa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Mode Toggle */}
              <div className="flex justify-center">
                <Tabs value={mode} onValueChange={(value) => setMode(value as typeof mode)}>
                  <TabsList>
                    <TabsTrigger value="textToMorse">Text to Morse</TabsTrigger>
                    <TabsTrigger value="morseToText">Morse to Text</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Input/Output Section */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="input-text">{mode === "textToMorse" ? "Text Input" : "Morse Code Input"}</Label>
                  <Textarea
                    id="input-text"
                    placeholder={
                      mode === "textToMorse"
                        ? "Enter text to convert to Morse code..."
                        : "Enter Morse code (use . and - with spaces)..."
                    }
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    rows={6}
                    className={mode === "morseToText" ? "font-mono" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="output-text">{mode === "textToMorse" ? "Morse Code Output" : "Text Output"}</Label>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={handleSwapMode}>
                        <ArrowRightLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={copyToClipboard} disabled={!outputText}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      {mode === "textToMorse" && (
                        <Button variant="ghost" size="sm" onClick={playMorseCode} disabled={!outputText || isPlaying}>
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <Textarea
                    id="output-text"
                    value={outputText}
                    readOnly
                    rows={6}
                    className={`${mode === "textToMorse" ? "font-mono" : ""} bg-muted`}
                  />
                </div>
              </div>

              {/* Translate Button */}
              <div className="flex justify-center">
                <Button onClick={handleTranslate} disabled={!inputText} size="lg">
                  Translate
                </Button>
              </div>

              {/* Morse Code Reference */}
              <motion.div
                className="bg-muted p-4 rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h4 className="font-medium mb-3">Morse Code Reference</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-sm font-mono">
                  {Object.entries(morseCodeMap)
                    .slice(0, 26)
                    .map(([letter, morse]) => (
                      <div key={letter} className="flex justify-between">
                        <span className="font-bold">{letter}:</span>
                        <span>{morse}</span>
                      </div>
                    ))}
                </div>
                <div className="mt-3 pt-3 border-t">
                  <h5 className="font-medium mb-2">Numbers</h5>
                  <div className="grid grid-cols-5 gap-2 text-sm font-mono">
                    {Object.entries(morseCodeMap)
                      .slice(26, 36)
                      .map(([number, morse]) => (
                        <div key={number} className="flex justify-between">
                          <span className="font-bold">{number}:</span>
                          <span>{morse}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </motion.div>

              {/* Quick Examples */}
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Quick Examples</h4>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <strong>SOS:</strong> <span className="font-mono">... --- ...</span>
                    </div>
                    <div>
                      <strong>HELLO:</strong> <span className="font-mono">.... . .-.. .-.. ---</span>
                    </div>
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
