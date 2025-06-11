"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Quote, RefreshCw, Copy, Check, Heart } from "lucide-react"

const quotes = [
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    category: "Work",
  },
  {
    text: "Innovation distinguishes between a leader and a follower.",
    author: "Steve Jobs",
    category: "Innovation",
  },
  {
    text: "Life is what happens to you while you're busy making other plans.",
    author: "John Lennon",
    category: "Life",
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    category: "Dreams",
  },
  {
    text: "It is during our darkest moments that we must focus to see the light.",
    author: "Aristotle",
    category: "Motivation",
  },
  {
    text: "The only impossible journey is the one you never begin.",
    author: "Tony Robbins",
    category: "Journey",
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    category: "Success",
  },
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
    category: "Action",
  },
  {
    text: "Don't let yesterday take up too much of today.",
    author: "Will Rogers",
    category: "Time",
  },
  {
    text: "You learn more from failure than from success. Don't let it stop you. Failure builds character.",
    author: "Unknown",
    category: "Failure",
  },
  {
    text: "If you are working on something that you really care about, you don't have to be pushed. The vision pulls you.",
    author: "Steve Jobs",
    category: "Passion",
  },
  {
    text: "Experience is the teacher of all things.",
    author: "Julius Caesar",
    category: "Experience",
  },
  {
    text: "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Chinese Proverb",
    category: "Time",
  },
  {
    text: "Your limitation—it's only your imagination.",
    author: "Unknown",
    category: "Limitation",
  },
  {
    text: "Great things never come from comfort zones.",
    author: "Unknown",
    category: "Growth",
  },
]

export default function QuoteGenerator() {
  const [currentQuote, setCurrentQuote] = useState(quotes[0])
  const [favorites, setFavorites] = useState<typeof quotes>([])
  const [copied, setCopied] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const savedFavorites = localStorage.getItem("favoriteQuotes")
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites))
      } catch (e) {
        console.error("Failed to parse favorite quotes from localStorage")
      }
    }
  }, [])

  const generateRandomQuote = () => {
    setIsAnimating(true)
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * quotes.length)
      setCurrentQuote(quotes[randomIndex])
      setIsAnimating(false)
    }, 300)
  }

  const copyQuote = () => {
    const quoteText = `"${currentQuote.text}" - ${currentQuote.author}`
    navigator.clipboard.writeText(quoteText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleFavorite = () => {
    const isFavorite = favorites.some((fav) => fav.text === currentQuote.text)
    let newFavorites: typeof quotes

    if (isFavorite) {
      newFavorites = favorites.filter((fav) => fav.text !== currentQuote.text)
    } else {
      newFavorites = [...favorites, currentQuote]
    }

    setFavorites(newFavorites)
    localStorage.setItem("favoriteQuotes", JSON.stringify(newFavorites))
  }

  const isFavorite = favorites.some((fav) => fav.text === currentQuote.text)

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Quote className="h-6 w-6 text-primary" />
              <CardTitle>Random Quote Generator</CardTitle>
            </div>
            <CardDescription>Get inspired with random motivational quotes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuote.text}
                  className="text-center p-8 bg-muted rounded-lg min-h-[200px] flex flex-col justify-center"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="text-4xl text-primary mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  >
                    "
                  </motion.div>

                  <motion.blockquote
                    className="text-lg md:text-xl font-medium text-foreground mb-4 italic"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    {currentQuote.text}
                  </motion.blockquote>

                  <motion.div
                    className="flex flex-col items-center gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                  >
                    <cite className="text-primary font-semibold">— {currentQuote.author}</cite>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {currentQuote.category}
                    </span>
                  </motion.div>
                </motion.div>
              </AnimatePresence>

              <div className="flex justify-center gap-4">
                <Button onClick={generateRandomQuote} disabled={isAnimating} className="flex-1 max-w-xs">
                  <RefreshCw className={`mr-2 h-4 w-4 ${isAnimating ? "animate-spin" : ""}`} />
                  New Quote
                </Button>

                <Button variant="outline" onClick={copyQuote}>
                  {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>

                <Button
                  variant="outline"
                  onClick={toggleFavorite}
                  className={isFavorite ? "text-red-500 border-red-200" : ""}
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                </Button>
              </div>

              {favorites.length > 0 && (
                <motion.div
                  className="border-t pt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500 fill-current" />
                    Favorite Quotes ({favorites.length})
                  </h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {favorites.map((quote, index) => (
                      <motion.div
                        key={quote.text}
                        className="p-3 bg-muted/50 rounded-md cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => setCurrentQuote(quote)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <p className="text-sm italic">"{quote.text}"</p>
                        <p className="text-xs text-muted-foreground mt-1">— {quote.author}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
