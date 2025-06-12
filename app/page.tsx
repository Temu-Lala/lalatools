"use client"

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  QrCode,
  Calculator,
  Timer,
  Cloud,
  CheckSquare,
  Palette,
  Key,
  ArrowLeftRight,
  FileText,
  DollarSign,
  Clock,
  Dice6,
  Quote,
  Clock4,
  ImageIcon,
  Brush,
  Activity,
  Moon,
  Shield,
  TrendingUp,
  Keyboard,
  Gamepad2,
  Radio,
  Code,
  StickyNote,
  PieChart,
  FileImage,
  Music,
  MessageSquare,
  FileScan,
  FilePlus,
  CalendarClock,
  AlignVerticalDistributeEnd,
  AlignHorizontalDistributeStart,
  LockKeyhole,
  FileSignature,
} from "lucide-react"

const tools = [
  { title: "QR Code Generator", description: "Generate QR codes from text, URLs, and more", icon: <QrCode className="h-8 w-8 text-primary" />, href: "/qr-generator", badge: "Popular" },
  { title: "Barcode Generator", description: "Generate barcodes from text or numbers for easy scanning", icon: <FileScan className="h-8 w-8 text-primary" />, href: "/barcode-generator", badge: "New" },
  { title: "Calculator", description: "Perform basic arithmetic operations", icon: <Calculator className="h-8 w-8 text-primary" />, href: "/calculator" },
  { title: "Stopwatch/Timer", description: "Track elapsed time with precision", icon: <Timer className="h-8 w-8 text-primary" />, href: "/stopwatch" },
  { title: "Weather Widget", description: "Check current weather conditions by location", icon: <Cloud className="h-8 w-8 text-primary" />, href: "/weather" },
  { title: "To-Do List", description: "Manage your tasks with a simple list", icon: <CheckSquare className="h-8 w-8 text-primary" />, href: "/todo", badge: "Productivity" },
  { title: "Color Picker", description: "Select and copy color codes in various formats", icon: <Palette className="h-8 w-8 text-primary" />, href: "/color-picker" },
  { title: "Password Generator", description: "Create secure, random passwords", icon: <Key className="h-8 w-8 text-primary" />, href: "/password-generator", badge: "Security" },
  { title: "Unit Converter", description: "Convert between different measurement units", icon: <ArrowLeftRight className="h-8 w-8 text-primary" />, href: "/unit-converter" },
  { title: "Markdown Previewer", description: "Write and preview Markdown in real-time", icon: <FileText className="h-8 w-8 text-primary" />, href: "/markdown-previewer" },
  { title: "Tip Calculator", description: "Calculate tips and split bills among people", icon: <DollarSign className="h-8 w-8 text-primary" />, href: "/tip-calculator" },
  { title: "Countdown Timer", description: "Count down to important dates and events", icon: <Clock className="h-8 w-8 text-primary" />, href: "/countdown-timer" },
  { title: "Dice Roller", description: "Roll virtual dice with realistic animations", icon: <Dice6 className="h-8 w-8 text-primary" />, href: "/dice-roller", badge: "Fun" },
  { title: "Random Quote Generator", description: "Get inspired with random motivational quotes", icon: <Quote className="h-8 w-8 text-primary" />, href: "/quote-generator" },
  { title: "Pomodoro Timer", description: "Boost productivity with focused work sessions", icon: <Clock4 className="h-8 w-8 text-primary" />, href: "/pomodoro-timer", badge: "Productivity" },
  { title: "Image Carousel", description: "Create beautiful image slideshows", icon: <ImageIcon className="h-8 w-8 text-primary" />, href: "/image-carousel" },
  { title: "Drawing Canvas", description: "Draw and sketch with digital tools", icon: <Brush className="h-8 w-8 text-primary" />, href: "/drawing-canvas", badge: "Creative" },
  { title: "BMI Calculator", description: "Calculate your Body Mass Index", icon: <Activity className="h-8 w-8 text-primary" />, href: "/bmi-calculator" },
  { title: "Dark Mode Toggle", description: "Switch between light and dark themes", icon: <Moon className="h-8 w-8 text-primary" />, href: "/dark-mode-toggle" },
  { title: "Text Encryption", description: "Encrypt and decrypt text with various ciphers", icon: <Shield className="h-8 w-8 text-primary" />, href: "/text-encryption", badge: "Security" },
  { title: "Expense Tracker", description: "Track your income and expenses", icon: <TrendingUp className="h-8 w-8 text-primary" />, href: "/expense-tracker", badge: "Finance" },
  { title: "Typing Speed Test", description: "Test and improve your typing speed and accuracy", icon: <Keyboard className="h-8 w-8 text-primary" />, href: "/typing-speed-test", badge: "Skills" },
  { title: "Rock Paper Scissors", description: "Classic game with animated gameplay", icon: <Gamepad2 className="h-8 w-8 text-primary" />, href: "/rock-paper-scissors", badge: "Fun" },
  { title: "Morse Code Translator", description: "Convert text to Morse code and vice versa", icon: <Radio className="h-8 w-8 text-primary" />, href: "/morse-code-translator" },
  { title: "HTML/CSS Playground", description: "Write HTML and CSS code and see live results", icon: <Code className="h-8 w-8 text-primary" />, href: "/html-css-playground", badge: "Development" },
  { title: "Notes App", description: "Create and organize your sticky notes", icon: <StickyNote className="h-8 w-8 text-primary" />, href: "/notes-app", badge: "Productivity" },
  { title: "Pie Chart Generator", description: "Create professional pie charts for presentations", icon: <PieChart className="h-8 w-8 text-primary" />, href: "/pie-chart-generator", badge: "Charts" },
  { title: "File Converter", description: "Convert images and text files client-side", icon: <FileImage className="h-8 w-8 text-primary" />, href: "/file-converter", badge: "Utility" },
  { title: "Audio Visualizer", description: "Visualize microphone or audio file input", icon: <Music className="h-8 w-8 text-primary" />, href: "/audio-visualizer", badge: "Audio" },
  { title: "Fake Telegram Chat", description: "Create fake Telegram chat screenshots", icon: <MessageSquare className="h-8 w-8 text-primary" />, href: "/telegram-clone", badge: "New" },
  { title: "Image to Base64 Converter", description: "Convert your image to Base64", icon: <FilePlus className="h-8 w-8 text-primary" />, href: "/imagetobase64", badge: "New" },
  { title: "Excel File Viewer", description: "View Excel files", icon: <AlignHorizontalDistributeStart className="h-8 w-8 text-primary" />, href: "/excelfileviewer", badge: "File" },
  { title: "Calendar Converter", description: "Convert between calendar systems", icon: <CalendarClock className="h-8 w-8 text-primary" />, href: "/calendarconverter", badge: "Calendar" },
  { title: "Text Differencer", description: "Highlight differences between two text blocks", icon: <AlignVerticalDistributeEnd className="h-8 w-8 text-primary" />, href: "/textdeffchecker", badge: "Text Diff" },
  { title: "Secure Notes", description: "Write, encrypt, and decrypt notes", icon: <LockKeyhole className="h-8 w-8 text-primary" />, href: "/securenotes", badge: "Secure Notes" },
  { title: " Short Cut Key   ", description: "Git  Short Key", icon: <LockKeyhole className="h-8 w-8 text-primary" />, href: "/shortcut/others", badge: "Shortcut" },

]

export default function Home() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Lala Tools</h1>
        <p className="text-lg text-muted-foreground">A collection of 40+ simple, useful tools</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Link href={tool.href} key={tool.href} className="block group">
            <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-primary">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  {tool.icon}
                  {tool.badge && <Badge variant="secondary" className="ml-auto">{tool.badge}</Badge>}
                </div>
                <CardTitle className="mt-4 group-hover:text-primary transition-colors">{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardFooter className="pt-2">
                <span className="text-sm text-primary font-medium group-hover:underline">Open tool →</span>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
