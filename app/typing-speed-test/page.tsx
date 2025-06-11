"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Keyboard, RotateCcw, Trophy, Clock } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const textCategories = {
  programming: [
    "JavaScript is a versatile programming language that runs in web browsers and on servers. It supports object-oriented, functional, and procedural programming paradigms.",
    "Python's syntax emphasizes readability and simplicity, making it an excellent choice for beginners and experienced developers alike. Its extensive library ecosystem supports everything from web development to machine learning.",
    "React is a popular JavaScript library for building user interfaces. It uses a component-based architecture and virtual DOM to create efficient, interactive web applications.",
    "Git is a distributed version control system that tracks changes in source code during software development. It enables multiple developers to collaborate on projects efficiently.",
    "APIs allow different software applications to communicate with each other. RESTful APIs use HTTP methods like GET, POST, PUT, and DELETE to perform operations on resources.",
    "Machine learning algorithms can identify patterns in large datasets and make predictions about new data. Popular techniques include neural networks, decision trees, and support vector machines.",
    "Database normalization is the process of organizing data to reduce redundancy and improve data integrity. It involves dividing large tables into smaller, related tables.",
    "Cybersecurity involves protecting computer systems, networks, and data from digital attacks. Common threats include malware, phishing, and social engineering attacks.",
  ],
  literature: [
    "To be or not to be, that is the question. Whether 'tis nobler in the mind to suffer the slings and arrows of outrageous fortune, or to take arms against a sea of troubles.",
    "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity.",
    "In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, filled with the ends of worms and an oozy smell, nor yet a dry, bare, sandy hole.",
    "Call me Ishmael. Some years ago, never mind how long precisely, having little or no money in my purse, and nothing particular to interest me on shore.",
    "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man.",
    "All happy families are alike; each unhappy family is unhappy in its own way. Everything was in confusion in the Oblonskys' house. The wife had discovered that the husband was carrying on an intrigue.",
    "The sun shone, having no alternative, on the nothing new. Murphy sat out of it, as though he were free, in a mew in West Brompton. Here for what might have been six months he had eaten, drunk, slept, and put his clothes on and off.",
  ],
  science: [
    "The theory of relativity fundamentally changed our understanding of space, time, and gravity. Einstein showed that time and space are interwoven into a single continuum called spacetime.",
    "DNA contains the genetic instructions for the development and function of all living organisms. It consists of four nucleotide bases: adenine, thymine, guanine, and cytosine.",
    "Photosynthesis is the process by which plants convert light energy into chemical energy. Chlorophyll absorbs sunlight and uses it to convert carbon dioxide and water into glucose and oxygen.",
    "The periodic table organizes chemical elements by their atomic number and properties. Elements in the same column share similar chemical characteristics due to their electron configuration.",
    "Climate change refers to long-term shifts in global temperatures and weather patterns. Human activities, particularly burning fossil fuels, have accelerated these changes since the Industrial Revolution.",
    "Quantum mechanics describes the behavior of matter and energy at the atomic and subatomic level. It reveals that particles can exist in multiple states simultaneously until observed.",
    "Evolution by natural selection explains how species change over time. Organisms with advantageous traits are more likely to survive and reproduce, passing these traits to their offspring.",
    "The water cycle describes the continuous movement of water through Earth's atmosphere, land, and oceans. It includes evaporation, condensation, precipitation, and collection processes.",
  ],
  business: [
    "Effective leadership requires clear communication, strategic thinking, and the ability to inspire and motivate team members. Great leaders adapt their style to different situations and individuals.",
    "Market research helps businesses understand customer needs, preferences, and behaviors. This information guides product development, pricing strategies, and marketing campaigns.",
    "Supply chain management involves coordinating the flow of goods, services, and information from suppliers to customers. Efficient supply chains reduce costs and improve customer satisfaction.",
    "Digital transformation is reshaping how businesses operate and deliver value to customers. Companies must embrace new technologies to remain competitive in the modern marketplace.",
    "Customer relationship management focuses on building long-term relationships with clients. Satisfied customers are more likely to make repeat purchases and recommend the business to others.",
    "Financial planning involves setting goals, creating budgets, and making investment decisions. Proper financial management ensures business sustainability and growth opportunities.",
    "Innovation drives business growth and competitive advantage. Companies that continuously improve their products, services, and processes are more likely to succeed in dynamic markets.",
    "Teamwork and collaboration are essential for achieving organizational goals. Diverse teams bring different perspectives and skills that enhance problem-solving and creativity.",
  ],
  general: [
    "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet at least once, making it useful for testing fonts and keyboards.",
    "Cooking is both an art and a science that brings people together. The combination of fresh ingredients, proper techniques, and creativity can create memorable dining experiences.",
    "Travel broadens the mind and exposes us to different cultures, languages, and ways of life. Each journey offers opportunities for personal growth and new perspectives.",
    "Music has the power to evoke emotions, trigger memories, and bring people together across cultural boundaries. It serves as a universal language that transcends words.",
    "Exercise and physical activity are essential for maintaining good health and well-being. Regular movement strengthens muscles, improves cardiovascular health, and boosts mental clarity.",
    "Reading expands vocabulary, improves concentration, and provides knowledge about diverse topics. Books offer windows into different worlds and perspectives throughout history.",
    "Technology continues to evolve at an unprecedented pace, transforming how we work, communicate, and live. Artificial intelligence and automation are reshaping entire industries.",
    "Environmental conservation requires collective action to protect our planet's natural resources. Small changes in daily habits can contribute to significant positive environmental impact.",
  ],
}

// Function to get random text
const getRandomText = (category?: string) => {
  if (category && textCategories[category as keyof typeof textCategories]) {
    const categoryTexts = textCategories[category as keyof typeof textCategories]
    return categoryTexts[Math.floor(Math.random() * categoryTexts.length)]
  }

  // Get random category and random text from that category
  const categories = Object.keys(textCategories)
  const randomCategory = categories[Math.floor(Math.random() * categories.length)]
  const categoryTexts = textCategories[randomCategory as keyof typeof textCategories]
  return categoryTexts[Math.floor(Math.random() * categoryTexts.length)]
}

export default function TypingSpeedTest() {
  const [currentText, setCurrentText] = useState("")
  const [userInput, setUserInput] = useState("")
  const [startTime, setStartTime] = useState<number | null>(null)
  const [endTime, setEndTime] = useState<number | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [errors, setErrors] = useState(0)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const [stats, setStats] = useState({
    wpm: 0,
    accuracy: 100,
    timeElapsed: 0,
  })

  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [showCategories, setShowCategories] = useState(false)

  useEffect(() => {
    setCurrentText(getRandomText())
  }, [])

  useEffect(() => {
    if (isActive && !isCompleted) {
      const interval = setInterval(() => {
        if (startTime) {
          const elapsed = (Date.now() - startTime) / 1000
          setStats((prev) => ({ ...prev, timeElapsed: elapsed }))
        }
      }, 100)
      return () => clearInterval(interval)
    }
  }, [isActive, isCompleted, startTime])

  const startTest = () => {
    setIsActive(true)
    setIsCompleted(false)
    setUserInput("")
    setCurrentIndex(0)
    setErrors(0)
    setStartTime(Date.now())
    setEndTime(null)
    inputRef.current?.focus()
  }

  const resetTest = () => {
    setIsActive(false)
    setIsCompleted(false)
    setUserInput("")
    setCurrentIndex(0)
    setErrors(0)
    setStartTime(null)
    setEndTime(null)
    setStats({ wpm: 0, accuracy: 100, timeElapsed: 0 })
  }

  const changeText = (category?: string) => {
    const newText = getRandomText(category || selectedCategory === "all" ? undefined : selectedCategory)
    setCurrentText(newText)
    resetTest()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isActive) return

    const value = e.target.value
    setUserInput(value)

    // Calculate errors
    let errorCount = 0
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== currentText[i]) {
        errorCount++
      }
    }
    setErrors(errorCount)

    // Update current character index
    setCurrentIndex(value.length)

    // Add real-time WPM calculation
    if (startTime) {
      const timeInMinutes = (Date.now() - startTime) / 60000
      const wordsTyped = value.trim().split(/\s+/).length
      const currentWPM = timeInMinutes > 0 ? Math.round(wordsTyped / timeInMinutes) : 0

      setStats((prev) => ({
        ...prev,
        wpm: currentWPM,
        accuracy: value.length > 0 ? Math.round(((value.length - errorCount) / value.length) * 100) : 100,
      }))
    }

    // Check if completed
    if (value === currentText) {
      setIsCompleted(true)
      setIsActive(false)
      setEndTime(Date.now())

      if (startTime) {
        const timeInMinutes = (Date.now() - startTime) / 60000
        const wordsTyped = currentText.split(" ").length
        const wpm = Math.round(wordsTyped / timeInMinutes)
        const accuracy = Math.round(((currentText.length - errors) / currentText.length) * 100)

        setStats({
          wpm,
          accuracy,
          timeElapsed: (Date.now() - startTime) / 1000,
        })
      }
    }
  }

  const getCharacterClass = (index: number) => {
    if (index < userInput.length) {
      return userInput[index] === currentText[index] ? "text-green-600" : "text-red-600 bg-red-100"
    } else if (index === currentIndex) {
      return "bg-primary text-primary-foreground animate-pulse"
    }
    return "text-muted-foreground"
  }

  const progress = (userInput.length / currentText.length) * 100

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Keyboard className="h-6 w-6 text-primary" />
              <CardTitle>Typing Speed Test</CardTitle>
            </div>
            <CardDescription>Test and improve your typing speed and accuracy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Category Selection */}
              <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Text Category:</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="programming">Programming</SelectItem>
                      <SelectItem value="literature">Literature</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Badge variant="outline" className="text-xs">
                  Random text from {selectedCategory === "all" ? "all categories" : selectedCategory}
                </Badge>
              </div>

              {/* Stats Display */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div className="text-center p-4 bg-muted rounded-lg" whileHover={{ scale: 1.05 }}>
                  <div className="text-2xl font-bold text-primary">{Math.round(stats.wpm)}</div>
                  <div className="text-sm text-muted-foreground">WPM</div>
                </motion.div>
                <motion.div className="text-center p-4 bg-muted rounded-lg" whileHover={{ scale: 1.05 }}>
                  <div className="text-2xl font-bold text-primary">{Math.round(stats.accuracy)}%</div>
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                </motion.div>
                <motion.div className="text-center p-4 bg-muted rounded-lg" whileHover={{ scale: 1.05 }}>
                  <div className="text-2xl font-bold text-primary">{Math.round(stats.timeElapsed)}</div>
                  <div className="text-sm text-muted-foreground">Seconds</div>
                </motion.div>
                <motion.div className="text-center p-4 bg-muted rounded-lg" whileHover={{ scale: 1.05 }}>
                  <div className="text-2xl font-bold text-red-500">{errors}</div>
                  <div className="text-sm text-muted-foreground">Errors</div>
                </motion.div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Text Display */}
              <motion.div
                className="p-6 bg-muted rounded-lg font-mono text-lg leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {currentText.split("").map((char, index) => (
                  <span key={index} className={`${getCharacterClass(index)} transition-all duration-100`}>
                    {char}
                  </span>
                ))}
              </motion.div>

              {/* Input Area */}
              <div className="space-y-4">
                <textarea
                  ref={inputRef}
                  value={userInput}
                  onChange={handleInputChange}
                  disabled={!isActive || isCompleted}
                  placeholder={isActive ? "Start typing..." : "Click 'Start Test' to begin"}
                  className="w-full h-32 p-4 border rounded-lg font-mono text-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />

                <div className="flex justify-center gap-4">
                  <Button onClick={startTest} disabled={isActive}>
                    <Clock className="mr-2 h-4 w-4" />
                    Start Test
                  </Button>
                  <Button onClick={resetTest} variant="outline">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                  <Button onClick={() => changeText()} variant="outline">
                    New Random Text
                  </Button>
                </div>
              </div>

              {/* Completion Message */}
              <AnimatePresence>
                {isCompleted && (
                  <motion.div
                    className="text-center p-6 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div
                      className="flex justify-center mb-4"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.5, repeat: 2 }}
                    >
                      <Trophy className="h-12 w-12 text-yellow-500" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">Test Completed!</h3>
                    <div className="flex justify-center gap-4">
                      <Badge variant="secondary">{stats.wpm} WPM</Badge>
                      <Badge variant="secondary">{stats.accuracy}% Accuracy</Badge>
                      <Badge variant="secondary">{Math.round(stats.timeElapsed)}s</Badge>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
