"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Clock, Play, Pause, RotateCcw } from "lucide-react"

export default function CountdownTimer() {
  const [targetDate, setTargetDate] = useState("")
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [isActive, setIsActive] = useState(false)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && targetDate) {
      interval = setInterval(() => {
        const now = new Date().getTime()
        const target = new Date(targetDate).getTime()
        const difference = target - now

        if (difference > 0) {
          setTimeLeft({
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((difference % (1000 * 60)) / 1000),
          })
          setIsExpired(false)
        } else {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
          setIsExpired(true)
          setIsActive(false)
        }
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, targetDate])

  const handleStart = () => {
    if (!targetDate) return
    setIsActive(true)
    setIsExpired(false)
  }

  const handlePause = () => {
    setIsActive(false)
  }

  const handleReset = () => {
    setIsActive(false)
    setIsExpired(false)
    setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  }

  const formatDateTime = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    const hours = String(now.getHours()).padStart(2, "0")
    const minutes = String(now.getMinutes()).padStart(2, "0")
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" />
              <CardTitle>Countdown Timer</CardTitle>
            </div>
            <CardDescription>Count down to important dates and events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label htmlFor="target-date">Target Date & Time</Label>
                <Input
                  id="target-date"
                  type="datetime-local"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  min={formatDateTime()}
                  className="mt-1"
                />
              </div>

              <div className="flex justify-center gap-4">
                <Button onClick={handleStart} disabled={!targetDate || isActive}>
                  <Play className="mr-2 h-4 w-4" />
                  Start
                </Button>
                <Button onClick={handlePause} disabled={!isActive} variant="outline">
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </Button>
                <Button onClick={handleReset} variant="outline">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>

              <motion.div
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {[
                  { label: "Days", value: timeLeft.days },
                  { label: "Hours", value: timeLeft.hours },
                  { label: "Minutes", value: timeLeft.minutes },
                  { label: "Seconds", value: timeLeft.seconds },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    className="text-center p-4 bg-muted rounded-lg"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.div
                      className="text-3xl font-bold font-mono"
                      key={item.value}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {String(item.value).padStart(2, "0")}
                    </motion.div>
                    <div className="text-sm text-muted-foreground">{item.label}</div>
                  </motion.div>
                ))}
              </motion.div>

              {isExpired && (
                <motion.div
                  className="text-center p-6 bg-primary/10 rounded-lg border border-primary/20"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    className="text-2xl font-bold text-primary"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                  >
                    🎉 Time's Up! 🎉
                  </motion.div>
                  <p className="text-muted-foreground mt-2">Your countdown has reached zero!</p>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
