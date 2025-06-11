"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock4, Play, Pause, RotateCcw, Coffee, Briefcase } from "lucide-react"

export default function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState<"work" | "shortBreak" | "longBreak">("work")
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const [totalPomodoros, setTotalPomodoros] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const modes = {
    work: { duration: 25 * 60, label: "Work Time", icon: Briefcase, color: "bg-red-500" },
    shortBreak: { duration: 5 * 60, label: "Short Break", icon: Coffee, color: "bg-green-500" },
    longBreak: { duration: 15 * 60, label: "Long Break", icon: Coffee, color: "bg-blue-500" },
  }

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((timeLeft) => timeLeft - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      // Timer completed
      setIsActive(false)
      playNotificationSound()

      if (mode === "work") {
        setCompletedPomodoros((prev) => prev + 1)
        setTotalPomodoros((prev) => prev + 1)

        // Auto-switch to break
        if ((completedPomodoros + 1) % 4 === 0) {
          switchMode("longBreak")
        } else {
          switchMode("shortBreak")
        }
      } else {
        // Break completed, switch to work
        switchMode("work")
      }
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft, mode, completedPomodoros])

  const playNotificationSound = () => {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 800
    oscillator.type = "sine"

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  }

  const switchMode = (newMode: "work" | "shortBreak" | "longBreak") => {
    setMode(newMode)
    setTimeLeft(modes[newMode].duration)
    setIsActive(false)
  }

  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setIsActive(false)
    setTimeLeft(modes[mode].duration)
  }

  const resetSession = () => {
    setIsActive(false)
    setMode("work")
    setTimeLeft(modes.work.duration)
    setCompletedPomodoros(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const progress = ((modes[mode].duration - timeLeft) / modes[mode].duration) * 100
  const currentMode = modes[mode]
  const Icon = currentMode.icon

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock4 className="h-6 w-6 text-primary" />
              <CardTitle>Pomodoro Timer</CardTitle>
            </div>
            <CardDescription>Boost productivity with focused work sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Mode Selector */}
              <div className="flex gap-2">
                {Object.entries(modes).map(([key, modeData]) => (
                  <Button
                    key={key}
                    variant={mode === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => switchMode(key as any)}
                    disabled={isActive}
                    className="flex-1 text-xs"
                  >
                    {modeData.label}
                  </Button>
                ))}
              </div>

              {/* Timer Display */}
              <motion.div
                className="text-center"
                key={mode}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="flex items-center justify-center gap-3 mb-4"
                  animate={{ scale: isActive ? [1, 1.05, 1] : 1 }}
                  transition={{ duration: 2, repeat: isActive ? Number.POSITIVE_INFINITY : 0 }}
                >
                  <Icon className="h-8 w-8 text-primary" />
                  <h2 className="text-xl font-semibold">{currentMode.label}</h2>
                </motion.div>

                <motion.div
                  className="text-6xl font-mono font-bold mb-6"
                  key={timeLeft}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.1 }}
                >
                  {formatTime(timeLeft)}
                </motion.div>

                <Progress value={progress} className="mb-6" />
              </motion.div>

              {/* Controls */}
              <div className="flex justify-center gap-4">
                <Button onClick={toggleTimer} size="lg" className="w-24">
                  {isActive ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                  {isActive ? "Pause" : "Start"}
                </Button>
                <Button onClick={resetTimer} variant="outline" size="lg">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{completedPomodoros}</div>
                  <div className="text-sm text-muted-foreground">Today</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{totalPomodoros}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
              </div>

              {/* Reset Session */}
              {completedPomodoros > 0 && (
                <Button onClick={resetSession} variant="ghost" className="w-full">
                  Reset Session
                </Button>
              )}

              {/* Next Break Indicator */}
              {mode === "work" && (
                <motion.div
                  className="text-center text-sm text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Next: {(completedPomodoros + 1) % 4 === 0 ? "Long Break" : "Short Break"}
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
