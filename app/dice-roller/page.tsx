"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Dice6, RotateCcw } from "lucide-react"

export default function DiceRoller() {
  const [diceCount, setDiceCount] = useState("1")
  const [diceSides, setDiceSides] = useState("6")
  const [results, setResults] = useState<number[]>([])
  const [isRolling, setIsRolling] = useState(false)
  const [history, setHistory] = useState<{ dice: number; sides: number; results: number[]; total: number }[]>([])

  const rollDice = async () => {
    setIsRolling(true)

    // Simulate rolling animation delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const count = Number.parseInt(diceCount)
    const sides = Number.parseInt(diceSides)
    const newResults: number[] = []

    for (let i = 0; i < count; i++) {
      newResults.push(Math.floor(Math.random() * sides) + 1)
    }

    setResults(newResults)
    setIsRolling(false)

    // Add to history
    const total = newResults.reduce((sum, result) => sum + result, 0)
    setHistory((prev) => [{ dice: count, sides, results: newResults, total }, ...prev.slice(0, 9)])
  }

  const clearHistory = () => {
    setHistory([])
  }

  const getDiceEmoji = (value: number, sides: number) => {
    if (sides === 6) {
      const diceEmojis = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"]
      return diceEmojis[value - 1] || value.toString()
    }
    return value.toString()
  }

  const total = results.reduce((sum, result) => sum + result, 0)

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Dice6 className="h-6 w-6 text-primary" />
              <CardTitle>Dice Roller</CardTitle>
            </div>
            <CardDescription>Roll virtual dice with realistic animations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dice-count">Number of Dice</Label>
                  <Select value={diceCount} onValueChange={setDiceCount}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? "Die" : "Dice"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dice-sides">Dice Type</Label>
                  <Select value={diceSides} onValueChange={setDiceSides}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">D4 (4-sided)</SelectItem>
                      <SelectItem value="6">D6 (6-sided)</SelectItem>
                      <SelectItem value="8">D8 (8-sided)</SelectItem>
                      <SelectItem value="10">D10 (10-sided)</SelectItem>
                      <SelectItem value="12">D12 (12-sided)</SelectItem>
                      <SelectItem value="20">D20 (20-sided)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={rollDice} disabled={isRolling} className="w-full" size="lg">
                {isRolling ? "Rolling..." : "Roll Dice"}
              </Button>

              <div className="min-h-[200px] flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                  {isRolling ? (
                    <motion.div
                      key="rolling"
                      className="flex gap-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {Array.from({ length: Number.parseInt(diceCount) }).map((_, index) => (
                        <motion.div
                          key={index}
                          className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center text-2xl text-primary-foreground"
                          animate={{
                            rotateX: [0, 360, 720, 1080],
                            rotateY: [0, 180, 360, 540],
                            scale: [1, 1.2, 1, 1.2, 1],
                          }}
                          transition={{
                            duration: 1,
                            ease: "easeInOut",
                            delay: index * 0.1,
                          }}
                        >
                          ?
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : results.length > 0 ? (
                    <motion.div
                      key="results"
                      className="text-center"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="flex gap-4 justify-center mb-4">
                        {results.map((result, index) => (
                          <motion.div
                            key={index}
                            className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center text-2xl text-primary-foreground font-bold"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                              delay: index * 0.1,
                              type: "spring",
                              stiffness: 200,
                              damping: 10,
                            }}
                            whileHover={{ scale: 1.1 }}
                          >
                            {Number.parseInt(diceSides) === 6 ? getDiceEmoji(result, 6) : result}
                          </motion.div>
                        ))}
                      </div>
                      {results.length > 1 && (
                        <motion.div
                          className="text-xl font-semibold"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                        >
                          Total: {total}
                        </motion.div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      className="text-center text-muted-foreground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Dice6 className="h-16 w-16 mx-auto mb-2 opacity-20" />
                      <p>Click "Roll Dice" to get started!</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {history.length > 0 && (
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold">Roll History</h3>
                    <Button variant="ghost" size="sm" onClick={clearHistory}>
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {history.map((roll, index) => (
                      <motion.div
                        key={index}
                        className="flex justify-between items-center p-2 bg-muted rounded text-sm"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <span>
                          {roll.dice}d{roll.sides}: [{roll.results.join(", ")}]
                        </span>
                        <span className="font-semibold">Total: {roll.total}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
