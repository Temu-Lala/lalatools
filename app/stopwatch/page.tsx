"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Timer, Play, Pause, RotateCcw, Flag } from "lucide-react"

export default function Stopwatch() {
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [laps, setLaps] = useState<number[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 10)
      }, 10)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning])

  const handleStartStop = () => {
    setIsRunning(!isRunning)
  }

  const handleReset = () => {
    setIsRunning(false)
    setTime(0)
    setLaps([])
  }

  const handleLap = () => {
    setLaps([...laps, time])
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60000)
    const seconds = Math.floor((time % 60000) / 1000)
    const milliseconds = Math.floor((time % 1000) / 10)

    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds
      .toString()
      .padStart(2, "0")}`
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Timer className="h-6 w-6 text-primary" />
              <CardTitle>Stopwatch</CardTitle>
            </div>
            <CardDescription>Track elapsed time with precision</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="text-6xl font-mono tabular-nums">{formatTime(time)}</div>
            </div>

            <div className="flex justify-center gap-4 mb-6">
              <Button onClick={handleStartStop} className="w-24">
                {isRunning ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                {isRunning ? "Pause" : "Start"}
              </Button>
              <Button onClick={handleReset} variant="outline" className="w-24">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button onClick={handleLap} variant="secondary" className="w-24" disabled={!isRunning && time === 0}>
                <Flag className="mr-2 h-4 w-4" />
                Lap
              </Button>
            </div>

            {laps.length > 0 && (
              <div className="border rounded-md overflow-hidden">
                <div className="bg-muted px-4 py-2 font-medium">Laps</div>
                <div className="max-h-60 overflow-y-auto">
                  {laps.map((lapTime, index) => (
                    <div key={index} className="px-4 py-2 flex justify-between border-t">
                      <span>Lap {laps.length - index}</span>
                      <span className="font-mono">{formatTime(lapTime)}</span>
                    </div>
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
