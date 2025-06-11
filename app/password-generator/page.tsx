"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Key, Copy, Check, RefreshCw } from "lucide-react"

export default function PasswordGenerator() {
  const [password, setPassword] = useState("")
  const [length, setLength] = useState([12])
  const [includeUppercase, setIncludeUppercase] = useState(true)
  const [includeLowercase, setIncludeLowercase] = useState(true)
  const [includeNumbers, setIncludeNumbers] = useState(true)
  const [includeSymbols, setIncludeSymbols] = useState(true)
  const [copied, setCopied] = useState(false)

  const generatePassword = () => {
    let charset = ""
    let newPassword = ""

    if (includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz"
    if (includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    if (includeNumbers) charset += "0123456789"
    if (includeSymbols) charset += "!@#$%^&*()_+[]{}|;:,.<>?"

    // Ensure at least one character set is selected
    if (!charset) {
      setIncludeLowercase(true)
      charset = "abcdefghijklmnopqrstuvwxyz"
    }

    // Generate the password
    for (let i = 0; i < length[0]; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length)
      newPassword += charset[randomIndex]
    }

    setPassword(newPassword)
  }

  const copyToClipboard = () => {
    if (!password) return

    navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Calculate password strength
  const calculateStrength = () => {
    if (!password) return 0

    let strength = 0

    // Length contribution
    if (password.length >= 8) strength += 1
    if (password.length >= 12) strength += 1
    if (password.length >= 16) strength += 1

    // Character variety contribution
    if (/[a-z]/.test(password)) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1

    return Math.min(strength, 5)
  }

  const getStrengthLabel = () => {
    const strength = calculateStrength()
    if (strength === 0) return "None"
    if (strength === 1) return "Very Weak"
    if (strength === 2) return "Weak"
    if (strength === 3) return "Medium"
    if (strength === 4) return "Strong"
    return "Very Strong"
  }

  const getStrengthColor = () => {
    const strength = calculateStrength()
    if (strength <= 1) return "bg-red-500"
    if (strength === 2) return "bg-orange-500"
    if (strength === 3) return "bg-yellow-500"
    if (strength === 4) return "bg-green-500"
    return "bg-emerald-500"
  }

  // Generate a password on component mount
  useState(() => {
    generatePassword()
  })

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-6 w-6 text-primary" />
              <CardTitle>Password Generator</CardTitle>
            </div>
            <CardDescription>Create secure, random passwords</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex gap-2">
                <Input value={password} readOnly className="font-mono" />
                <Button size="icon" variant="outline" onClick={copyToClipboard} disabled={!password}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <Label>Password Length: {length[0]}</Label>
                </div>
                <Slider value={length} onValueChange={setLength} min={6} max={32} step={1} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="uppercase"
                    checked={includeUppercase}
                    onCheckedChange={(checked) => setIncludeUppercase(!!checked)}
                  />
                  <Label htmlFor="uppercase">Include Uppercase Letters</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="lowercase"
                    checked={includeLowercase}
                    onCheckedChange={(checked) => setIncludeLowercase(!!checked)}
                  />
                  <Label htmlFor="lowercase">Include Lowercase Letters</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="numbers"
                    checked={includeNumbers}
                    onCheckedChange={(checked) => setIncludeNumbers(!!checked)}
                  />
                  <Label htmlFor="numbers">Include Numbers</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="symbols"
                    checked={includeSymbols}
                    onCheckedChange={(checked) => setIncludeSymbols(!!checked)}
                  />
                  <Label htmlFor="symbols">Include Symbols</Label>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <Label>Password Strength</Label>
                  <span className="text-sm">{getStrengthLabel()}</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getStrengthColor()}`}
                    style={{
                      width: `${(calculateStrength() / 5) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              <Button onClick={generatePassword} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate New Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
