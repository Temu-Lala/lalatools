"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gamepad2, RotateCcw } from "lucide-react"

type Choice = "rock" | "paper" | "scissors"
type Result = "win" | "lose" | "tie"

interface GameStats {
  wins: number
  losses: number
  ties: number
  gamesPlayed: number
}

const choices: { value: Choice; emoji: string; name: string }[] = [
  { value: "rock", emoji: "🪨", name: "Rock" },
  { value: "paper", emoji: "📄", name: "Paper" },
  { value: "scissors", emoji: "✂️", name: "Scissors" },
]

export default function RockPaperScissors() {
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null)
  const [computerChoice, setComputerChoice] = useState<Choice | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [stats, setStats] = useState<GameStats>({
    wins: 0,
    losses: 0,
    ties: 0,
    gamesPlayed: 0,
  })

  const getRandomChoice = (): Choice => {
    const randomIndex = Math.floor(Math.random() * choices.length)
    return choices[randomIndex].value
  }

  const determineWinner = (player: Choice, computer: Choice): Result => {
    if (player === computer) return "tie"

    if (
      (player === "rock" && computer === "scissors") ||
      (player === "paper" && computer === "rock") ||
      (player === "scissors" && computer === "paper")
    ) {
      return "win"
    }

    return "lose"
  }

  const playGame = async (choice: Choice) => {
    setIsPlaying(true)
    setPlayerChoice(choice)
    setComputerChoice(null)
    setResult(null)

    // Simulate computer "thinking" with animation
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const computerChoice = getRandomChoice()
    const gameResult = determineWinner(choice, computerChoice)

    setComputerChoice(computerChoice)
    setResult(gameResult)
    setIsPlaying(false)

    // Update stats
    setStats((prev) => ({
      wins: prev.wins + (gameResult === "win" ? 1 : 0),
      losses: prev.losses + (gameResult === "lose" ? 1 : 0),
      ties: prev.ties + (gameResult === "tie" ? 1 : 0),
      gamesPlayed: prev.gamesPlayed + 1,
    }))
  }

  const resetStats = () => {
    setStats({ wins: 0, losses: 0, ties: 0, gamesPlayed: 0 })
    setPlayerChoice(null)
    setComputerChoice(null)
    setResult(null)
  }

  const getResultMessage = () => {
    if (!result) return ""
    switch (result) {
      case "win":
        return "You Win! 🎉"
      case "lose":
        return "You Lose! 😢"
      case "tie":
        return "It's a Tie! 🤝"
    }
  }

  const getResultColor = () => {
    switch (result) {
      case "win":
        return "text-green-600"
      case "lose":
        return "text-red-600"
      case "tie":
        return "text-yellow-600"
      default:
        return ""
    }
  }

  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Gamepad2 className="h-6 w-6 text-primary" />
              <CardTitle>Rock Paper Scissors</CardTitle>
            </div>
            <CardDescription>Classic game with animated gameplay</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-xl font-bold text-green-600">{stats.wins}</div>
                  <div className="text-sm text-muted-foreground">Wins</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-xl font-bold text-red-600">{stats.losses}</div>
                  <div className="text-sm text-muted-foreground">Losses</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-xl font-bold text-yellow-600">{stats.ties}</div>
                  <div className="text-sm text-muted-foreground">Ties</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-xl font-bold text-primary">{winRate}%</div>
                  <div className="text-sm text-muted-foreground">Win Rate</div>
                </div>
              </div>

              {/* Game Area */}
              <div className="text-center space-y-6">
                <div className="grid grid-cols-2 gap-8">
                  {/* Player Side */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">You</h3>
                    <motion.div
                      className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center text-4xl"
                      animate={playerChoice ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      {playerChoice ? choices.find((c) => c.value === playerChoice)?.emoji : "❓"}
                    </motion.div>
                  </div>

                  {/* Computer Side */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Computer</h3>
                    <motion.div
                      className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center text-4xl"
                      animate={isPlaying ? { rotate: [0, 180, 360] } : computerChoice ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: isPlaying ? 1 : 0.3, repeat: isPlaying ? 1 : 0 }}
                    >
                      {isPlaying
                        ? "🤔"
                        : computerChoice
                          ? choices.find((c) => c.value === computerChoice)?.emoji
                          : "❓"}
                    </motion.div>
                  </div>
                </div>

                {/* Result */}
                <AnimatePresence>
                  {result && (
                    <motion.div
                      className={`text-2xl font-bold ${getResultColor()}`}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.5 }}
                    >
                      {getResultMessage()}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Choice Buttons */}
                <div className="grid grid-cols-3 gap-4">
                  {choices.map((choice) => (
                    <motion.div key={choice.value} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={() => playGame(choice.value)}
                        disabled={isPlaying}
                        className="w-full h-20 text-2xl flex flex-col gap-1"
                        variant="outline"
                      >
                        <span className="text-3xl">{choice.emoji}</span>
                        <span className="text-sm">{choice.name}</span>
                      </Button>
                    </motion.div>
                  ))}
                </div>

                {/* Reset Button */}
                <Button onClick={resetStats} variant="outline" className="mt-4">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset Stats
                </Button>
              </div>

              {/* Game Rules */}
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Game Rules</h4>
                <div className="text-sm space-y-1">
                  <div>🪨 Rock beats ✂️ Scissors</div>
                  <div>📄 Paper beats 🪨 Rock</div>
                  <div>✂️ Scissors beats 📄 Paper</div>
                </div>
              </div>

              {/* Achievement Badges */}
              {stats.gamesPlayed > 0 && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {stats.wins >= 5 && <Badge variant="secondary">🏆 5 Wins</Badge>}
                  {stats.wins >= 10 && <Badge variant="secondary">🎯 10 Wins</Badge>}
                  {winRate >= 70 && <Badge variant="secondary">🔥 High Win Rate</Badge>}
                  {stats.gamesPlayed >= 20 && <Badge variant="secondary">🎮 Veteran Player</Badge>}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
