"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Mic,
  Send,
  Smile,
  Camera,
  Download,
  Settings,
  Check,
  CheckCheck,
  ImageIcon,
  Clock,
  Wifi,
  Battery,
  Pin,
  Forward,
  Search,
  Star,
  Reply,
  Edit,
  Trash2,
  Heart,
  RotateCcw,
  MessageCircle,
  Eye,
  Lock,
  FileText,
  PlayCircle,
  PauseCircle,
  X,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

// Types
interface Profile {
  name: string
  photo: string
  lastSeen: string
  online: boolean
  phoneNumber: string
  bio: string
  username: string
  verified: boolean
  premium: boolean
}

interface Message {
  id: string
  senderType: "sender" | "receiver"
  type: "text" | "image" | "voice" | "sticker" | "document" | "location" | "contact" | "poll" | "audio" | "video"
  content: string
  timestamp: string
  status: "sending" | "sent" | "delivered" | "read"
  edited?: boolean
  replyTo?: string
  forwarded?: boolean
  pinned?: boolean
  reactions?: { emoji: string; count: number; users: string[] }[]
  views?: number
  duration?: string
  fileSize?: string
  fileName?: string
}

interface PhoneType {
  name: string
  width: string
  height: string
  borderRadius: string
  statusBarHeight: string
  notch?: boolean
  homeIndicator?: boolean
  bezels: string
  brand: string
}

interface ChatTheme {
  name: string
  headerColor: string
  backgroundColor: string
  senderBubble: string
  receiverBubble: string
  textColor: string
  timeColor: string
  inputBackground: string
  borderColor: string
  accentColor: string
}

interface FontSettings {
  family: string
  size: number
  weight: string
}

// Advanced Phone Types
const PHONE_TYPES: PhoneType[] = [
  {
    name: "iPhone 15 Pro Max",
    width: "430px",
    height: "932px",
    borderRadius: "2.75rem",
    statusBarHeight: "54px",
    notch: true,
    homeIndicator: true,
    bezels: "8px",
    brand: "Apple",
  },
  {
    name: "iPhone 15 Pro",
    width: "393px",
    height: "852px",
    borderRadius: "2.5rem",
    statusBarHeight: "44px",
    notch: true,
    homeIndicator: true,
    bezels: "8px",
    brand: "Apple",
  },
  {
    name: "iPhone 14 Pro",
    width: "390px",
    height: "844px",
    borderRadius: "2.5rem",
    statusBarHeight: "47px",
    notch: true,
    homeIndicator: true,
    bezels: "8px",
    brand: "Apple",
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    width: "384px",
    height: "854px",
    borderRadius: "2rem",
    statusBarHeight: "32px",
    notch: false,
    homeIndicator: false,
    bezels: "6px",
    brand: "Samsung",
  },
  {
    name: "Samsung Galaxy S24",
    width: "360px",
    height: "780px",
    borderRadius: "1.8rem",
    statusBarHeight: "28px",
    notch: false,
    homeIndicator: false,
    bezels: "5px",
    brand: "Samsung",
  },
  {
    name: "Google Pixel 8 Pro",
    width: "412px",
    height: "915px",
    borderRadius: "2rem",
    statusBarHeight: "32px",
    notch: false,
    homeIndicator: false,
    bezels: "6px",
    brand: "Google",
  },
  {
    name: "OnePlus 12",
    width: "450px",
    height: "1000px",
    borderRadius: "2.2rem",
    statusBarHeight: "36px",
    notch: false,
    homeIndicator: false,
    bezels: "7px",
    brand: "OnePlus",
  },
  {
    name: "Xiaomi 14 Ultra",
    width: "440px",
    height: "980px",
    borderRadius: "2.1rem",
    statusBarHeight: "34px",
    notch: false,
    homeIndicator: false,
    bezels: "6px",
    brand: "Xiaomi",
  },
]

// Advanced Telegram Themes
const TELEGRAM_THEMES: ChatTheme[] = [
  {
    name: "Classic Blue",
    headerColor: "#517da2",
    backgroundColor: "#e6ebee",
    senderBubble: "#dcf8c6",
    receiverBubble: "#ffffff",
    textColor: "#000000",
    timeColor: "#999999",
    inputBackground: "#ffffff",
    borderColor: "#e0e0e0",
    accentColor: "#0088cc",
  },
  {
    name: "Dark Mode",
    headerColor: "#2b2b2b",
    backgroundColor: "#0e1621",
    senderBubble: "#2b5278",
    receiverBubble: "#182533",
    textColor: "#ffffff",
    timeColor: "#aaaaaa",
    inputBackground: "#182533",
    borderColor: "#2b2b2b",
    accentColor: "#64b5f6",
  },
  {
    name: "Night Black",
    headerColor: "#1a1a1a",
    backgroundColor: "#000000",
    senderBubble: "#005c4b",
    receiverBubble: "#1f2c34",
    textColor: "#e1e1e1",
    timeColor: "#8696a0",
    inputBackground: "#1f2c34",
    borderColor: "#1a1a1a",
    accentColor: "#00bfa5",
  },
  {
    name: "Arctic Blue",
    headerColor: "#5288c1",
    backgroundColor: "#f0f2f5",
    senderBubble: "#0088cc",
    receiverBubble: "#ffffff",
    textColor: "#000000",
    timeColor: "#70777d",
    inputBackground: "#ffffff",
    borderColor: "#e4e6ea",
    accentColor: "#0088cc",
  },
  {
    name: "Sunset Orange",
    headerColor: "#ff6b35",
    backgroundColor: "#fff8f0",
    senderBubble: "#ff9500",
    receiverBubble: "#ffffff",
    textColor: "#000000",
    timeColor: "#999999",
    inputBackground: "#ffffff",
    borderColor: "#ffe0cc",
    accentColor: "#ff6b35",
  },
  {
    name: "Forest Green",
    headerColor: "#2e7d32",
    backgroundColor: "#f1f8e9",
    senderBubble: "#4caf50",
    receiverBubble: "#ffffff",
    textColor: "#000000",
    timeColor: "#666666",
    inputBackground: "#ffffff",
    borderColor: "#c8e6c9",
    accentColor: "#2e7d32",
  },
  {
    name: "Purple Dream",
    headerColor: "#7b1fa2",
    backgroundColor: "#f3e5f5",
    senderBubble: "#9c27b0",
    receiverBubble: "#ffffff",
    textColor: "#000000",
    timeColor: "#666666",
    inputBackground: "#ffffff",
    borderColor: "#e1bee7",
    accentColor: "#7b1fa2",
  },
  {
    name: "Rose Gold",
    headerColor: "#e91e63",
    backgroundColor: "#fce4ec",
    senderBubble: "#f06292",
    receiverBubble: "#ffffff",
    textColor: "#000000",
    timeColor: "#666666",
    inputBackground: "#ffffff",
    borderColor: "#f8bbd9",
    accentColor: "#e91e63",
  },
]

// Font Families
const FONT_FAMILIES = [
  { name: "Default", value: "system-ui, -apple-system, sans-serif" },
  { name: "Roboto", value: "Roboto, sans-serif" },
  { name: "Open Sans", value: "Open Sans, sans-serif" },
  { name: "Lato", value: "Lato, sans-serif" },
  { name: "Montserrat", value: "Montserrat, sans-serif" },
  { name: "Poppins", value: "Poppins, sans-serif" },
  { name: "Inter", value: "Inter, sans-serif" },
  { name: "Source Sans Pro", value: "Source Sans Pro, sans-serif" },
  { name: "Nunito", value: "Nunito, sans-serif" },
  { name: "Ubuntu", value: "Ubuntu, sans-serif" },
  { name: "Fira Sans", value: "Fira Sans, sans-serif" },
  { name: "Helvetica", value: "Helvetica, Arial, sans-serif" },
  { name: "Times New Roman", value: "Times New Roman, serif" },
  { name: "Georgia", value: "Georgia, serif" },
  { name: "Courier New", value: "Courier New, monospace" },
]

// Emojis and Reactions
const EMOJIS = [
  "😀",
  "😃",
  "😄",
  "😁",
  "😆",
  "😅",
  "😂",
  "🤣",
  "😊",
  "😇",
  "🙂",
  "🙃",
  "😉",
  "😌",
  "😍",
  "🥰",
  "😘",
  "😗",
  "😙",
  "😚",
  "😋",
  "😛",
  "😝",
  "😜",
  "🤪",
  "🤨",
  "🧐",
  "🤓",
  "😎",
  "🤩",
  "🥳",
  "😏",
  "😒",
  "😞",
  "😔",
  "😟",
  "😕",
  "🙁",
  "☹️",
  "😣",
  "😖",
  "😫",
  "😩",
  "🥺",
  "😢",
  "😭",
  "😤",
  "😠",
  "😡",
  "🤬",
  "🤯",
  "😳",
  "🥵",
  "🥶",
  "😱",
  "😨",
  "😰",
  "😥",
  "😓",
  "🤗",
  "🤔",
  "🤭",
  "🤫",
  "🤥",
  "😶",
  "😐",
  "😑",
  "😬",
  "🙄",
  "😯",
  "😦",
  "😧",
  "😮",
  "😲",
  "🥱",
  "😴",
  "🤤",
  "😪",
  "😵",
  "🤐",
  "🥴",
  "🤢",
  "🤮",
  "🤧",
  "😷",
  "🤒",
  "🤕",
  "🤑",
  "🤠",
  "😈",
  "👿",
  "👹",
  "👺",
  "🤡",
  "💩",
  "👻",
  "💀",
  "☠️",
  "👽",
  "👾",
  "🤖",
  "🎃",
  "😺",
  "😸",
  "😹",
  "😻",
  "😼",
  "😽",
  "🙀",
  "😿",
  "😾",
]

const REACTION_EMOJIS = ["❤️", "👍", "👎", "😂", "😮", "😢", "😡", "🔥", "💯", "🎉", "👏", "🙏"]

const STICKERS = [
  "🐱",
  "🐶",
  "🐭",
  "🐹",
  "🐰",
  "🦊",
  "🐻",
  "🐼",
  "🐨",
  "🐯",
  "🦁",
  "🐮",
  "🐷",
  "🐸",
  "🐵",
  "🙈",
  "🙉",
  "🙊",
  "🐒",
  "🐔",
  "🐧",
  "🐦",
  "🐤",
  "🐣",
  "🐥",
  "🦆",
  "🦅",
  "🦉",
  "🦇",
  "🐺",
  "🐗",
  "🐴",
  "🦄",
  "🐝",
  "🐛",
  "🦋",
  "🐌",
  "🐞",
  "🐜",
  "🦟",
  "🦗",
  "🕷️",
  "🕸️",
  "🦂",
  "🐢",
  "🐍",
  "🦎",
  "🦖",
  "🦕",
  "🐙",
  "🦑",
  "🦐",
  "🦞",
  "🦀",
  "🐡",
  "🐠",
  "🐟",
  "🐬",
  "🐳",
  "🐋",
]

export default function TelegramClone() {
  const { toast } = useToast()
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const screenshotRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bgImageInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  // State
  const [step, setStep] = useState<"setup" | "chat">("setup")
  const [selectedPhone, setSelectedPhone] = useState<PhoneType>(PHONE_TYPES[0])
  const [selectedTheme, setSelectedTheme] = useState<ChatTheme>(TELEGRAM_THEMES[0])
  const [customBackground, setCustomBackground] = useState<string>("")
  const [backgroundOpacity, setBackgroundOpacity] = useState([0.3])

  // Font Settings
  const [fontSettings, setFontSettings] = useState<FontSettings>({
    family: FONT_FAMILIES[0].value,
    size: 16,
    weight: "400",
  })

  // Custom Colors
  const [customColors, setCustomColors] = useState({
    headerColor: selectedTheme.headerColor,
    senderBubble: selectedTheme.senderBubble,
    receiverBubble: selectedTheme.receiverBubble,
    backgroundColor: selectedTheme.backgroundColor,
    textColor: selectedTheme.textColor,
    accentColor: selectedTheme.accentColor,
  })

  const [senderProfile, setSenderProfile] = useState<Profile>({
    name: "",
    photo: "",
    lastSeen: "last seen recently",
    online: true,
    phoneNumber: "+1 234 567 8900",
    bio: "Hey there! I am using Telegram.",
    username: "@sender",
    verified: false,
    premium: false,
  })

  const [receiverProfile, setReceiverProfile] = useState<Profile>({
    name: "",
    photo: "",
    lastSeen: "last seen recently",
    online: true,
    phoneNumber: "+1 987 654 3210",
    bio: "Available",
    username: "@receiver",
    verified: false,
    premium: false,
  })

  const [messages, setMessages] = useState<Message[]>([])
  const [currentInput, setCurrentInput] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showStickerPicker, setShowStickerPicker] = useState(false)
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null)
  const [pendingSenderType, setPendingSenderType] = useState<"sender" | "receiver" | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [typingUser, setTypingUser] = useState<string>("")
  const [showSettings, setShowSettings] = useState(false)
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const [batteryLevel, setBatteryLevel] = useState(85)
  const [signalStrength, setSignalStrength] = useState(4)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isRecording, setIsRecording] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [editingMessage, setEditingMessage] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [messageCount, setMessageCount] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOnline, setIsOnline] = useState(true)
  const [showMessageInfo, setShowMessageInfo] = useState<string | null>(null)
  const [bubbleRadius, setBubbleRadius] = useState(18)
  const [inputRadius, setInputRadius] = useState(25)
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)

  // Advanced Features
  const [secretChat, setSecretChat] = useState(false)
  const [autoDelete, setAutoDelete] = useState(false)
  const [readReceipts, setReadReceipts] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [vibrationEnabled, setVibrationEnabled] = useState(true)
  const [showOnlineStatus, setShowOnlineStatus] = useState(true)
  const [compactMode, setCompactMode] = useState(false)
  const [animationsEnabled, setAnimationsEnabled] = useState(true)

  // Add these states after the existing state declarations:
  const [showProfileDialog, setShowProfileDialog] = useState<"sender" | "receiver" | null>(null)
  const [showContactInfo, setShowContactInfo] = useState(false)

  // Add these new states:
  const [showMediaPicker, setShowMediaPicker] = useState(false)
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [showContactPicker, setShowContactPicker] = useState(false)
  const [showPollCreator, setShowPollCreator] = useState(false)
  const [chatWallpaper, setChatWallpaper] = useState("")
  const [messageScheduled, setMessageScheduled] = useState<Date | null>(null)
  const [silentMode, setSilentMode] = useState(false)
  const [slowMode, setSlowMode] = useState(false)
  const [lastActivity, setLastActivity] = useState(new Date())

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // Auto scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } else {
      setRecordingTime(0)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  // Generate current time
  const getCurrentTime = () => {
    const now = new Date()
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Format recording time
  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Handle profile photo upload
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>, profileType: "sender" | "receiver") => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (profileType === "sender") {
        setSenderProfile((prev) => ({ ...prev, photo: result }))
      } else {
        setReceiverProfile((prev) => ({ ...prev, photo: result }))
      }
    }
    reader.readAsDataURL(file)
  }

  // Handle background image upload
  const handleBackgroundUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setCustomBackground(result)
    }
    reader.readAsDataURL(file)
  }

  // Start chat
  const handleStartChat = () => {
    if (!senderProfile.name.trim() || !receiverProfile.name.trim()) {
      toast({
        title: "Names Required",
        description: "Please enter names for both participants.",
        variant: "destructive",
      })
      return
    }
    setStep("chat")
  }

  // Send message with advanced features
  const handleSendMessage = (senderType: "sender" | "receiver") => {
    if (!currentInput.trim() && !replyingTo) return

    const newMessage: Message = {
      id: Date.now().toString(),
      senderType,
      type: "text",
      content: currentInput,
      timestamp: getCurrentTime(),
      status: "sending",
      replyTo: replyingTo?.id,
      views: Math.floor(Math.random() * 100) + 1,
    }

    setMessages((prev) => [...prev, newMessage])
    setCurrentInput("")
    setReplyingTo(null)
    setShowEmojiPicker(false)
    setShowStickerPicker(false)
    setMessageCount((prev) => prev + 1)

    // Simulate typing for the other user
    const otherUser = senderType === "sender" ? receiverProfile.name : senderProfile.name
    setTypingUser(otherUser)
    setIsTyping(true)

    // Simulate message status updates
    setTimeout(() => {
      setMessages((prev) => prev.map((msg) => (msg.id === newMessage.id ? { ...msg, status: "sent" } : msg)))
    }, 500)

    setTimeout(() => {
      setMessages((prev) => prev.map((msg) => (msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg)))
    }, 1000)

    setTimeout(() => {
      setMessages((prev) => prev.map((msg) => (msg.id === newMessage.id ? { ...msg, status: "read" } : msg)))
      setIsTyping(false)
      setTypingUser("")
    }, 1500)

    // Play send sound
    if (soundEnabled) {
      const audio = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT",
      )
      audio.volume = 0.3
      audio.play().catch(() => {})
    }
  }

  // Handle emoji/sticker selection
  const handleEmojiSelect = (emoji: string) => {
    setCurrentInput((prev) => prev + emoji)
  }

  const handleStickerSend = (sticker: string, senderType: "sender" | "receiver") => {
    const newMessage: Message = {
      id: Date.now().toString(),
      senderType,
      type: "sticker",
      content: sticker,
      timestamp: getCurrentTime(),
      status: "sent",
      views: Math.floor(Math.random() * 50) + 1,
    }

    setMessages((prev) => [...prev, newMessage])
    setShowStickerPicker(false)
    setMessageCount((prev) => prev + 1)
  }

  // Handle reactions
  const handleReaction = (messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const reactions = msg.reactions || []
          const existingReaction = reactions.find((r) => r.emoji === emoji)

          if (existingReaction) {
            existingReaction.count += 1
            existingReaction.users.push("You")
          } else {
            reactions.push({ emoji, count: 1, users: ["You"] })
          }

          return { ...msg, reactions }
        }
        return msg
      }),
    )
    setShowReactionPicker(null)
  }

  // Handle message actions
  const handleReply = (message: Message) => {
    setReplyingTo(message)
    setSelectedMessage(null)
  }

  const handleEdit = (messageId: string) => {
    const message = messages.find((m) => m.id === messageId)
    if (message) {
      setCurrentInput(message.content)
      setEditingMessage(messageId)
      setSelectedMessage(null)
    }
  }

  const handleDelete = (messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId))
    setSelectedMessage(null)
    setMessageCount((prev) => prev - 1)
  }

  const handlePin = (messageId: string) => {
    setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, pinned: !msg.pinned } : msg)))
    setSelectedMessage(null)
  }

  const handleForward = (messageId: string) => {
    const message = messages.find((m) => m.id === messageId)
    if (message) {
      const forwardedMessage: Message = {
        ...message,
        id: Date.now().toString(),
        forwarded: true,
        timestamp: getCurrentTime(),
        status: "sent",
      }
      setMessages((prev) => [...prev, forwardedMessage])
      setSelectedMessage(null)
      setMessageCount((prev) => prev + 1)
    }
  }

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !pendingSenderType) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      const newMessage: Message = {
        id: Date.now().toString(),
        senderType: pendingSenderType,
        type: "image",
        content: result,
        timestamp: getCurrentTime(),
        status: "sent",
        views: Math.floor(Math.random() * 75) + 1,
        fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      }

      setMessages((prev) => [...prev, newMessage])
      setPendingSenderType(null)
      setMessageCount((prev) => prev + 1)
    }
    reader.readAsDataURL(file)
  }

  // Voice recording
  const startRecording = () => {
    setIsRecording(true)
    setShowVoiceRecorder(true)
    if (vibrationEnabled && navigator.vibrate) {
      navigator.vibrate(50)
    }
  }

  const stopRecording = (senderType: "sender" | "receiver") => {
    setIsRecording(false)
    setShowVoiceRecorder(false)

    if (recordingTime > 0) {
      const newMessage: Message = {
        id: Date.now().toString(),
        senderType,
        type: "voice",
        content: "Voice message",
        timestamp: getCurrentTime(),
        status: "sent",
        duration: formatRecordingTime(recordingTime),
        views: Math.floor(Math.random() * 30) + 1,
      }

      setMessages((prev) => [...prev, newMessage])
      setMessageCount((prev) => prev + 1)
    }
  }

  // Replace the existing triggerImageUpload function with:
  const triggerImageUpload = (senderType: "sender" | "receiver") => {
    setPendingSenderType(senderType)
    fileInputRef.current?.click()
  }

  // Add this function to handle profile photo clicks:
  const handleProfileClick = (profileType: "sender" | "receiver") => {
    setShowProfileDialog(profileType)
  }

  // Add these advanced message types:
  const sendLocationMessage = (senderType: "sender" | "receiver") => {
    const newMessage: Message = {
      id: Date.now().toString(),
      senderType,
      type: "location",
      content: "📍 Current Location\nLatitude: 40.7128\nLongitude: -74.0060",
      timestamp: getCurrentTime(),
      status: "sent",
      views: Math.floor(Math.random() * 25) + 1,
    }
    setMessages((prev) => [...prev, newMessage])
    setMessageCount((prev) => prev + 1)
  }

  const sendContactMessage = (senderType: "sender" | "receiver") => {
    const newMessage: Message = {
      id: Date.now().toString(),
      senderType,
      type: "contact",
      content: "👤 John Doe\n📞 +1 555 123 4567",
      timestamp: getCurrentTime(),
      status: "sent",
      views: Math.floor(Math.random() * 15) + 1,
    }
    setMessages((prev) => [...prev, newMessage])
    setMessageCount((prev) => prev + 1)
  }

  const sendPollMessage = (senderType: "sender" | "receiver") => {
    const newMessage: Message = {
      id: Date.now().toString(),
      senderType,
      type: "poll",
      content: "📊 What's your favorite color?\n🔵 Blue (45%)\n🔴 Red (30%)\n🟢 Green (25%)",
      timestamp: getCurrentTime(),
      status: "sent",
      views: Math.floor(Math.random() * 100) + 1,
    }
    setMessages((prev) => [...prev, newMessage])
    setMessageCount((prev) => prev + 1)
  }

  // Take screenshot
  const takeScreenshot = async () => {
    if (!screenshotRef.current) return

    setIsCapturing(true)

    try {
      const canvas = document.createElement("canvas")
      const width = Number.parseInt(selectedPhone.width)
      const height = Number.parseInt(selectedPhone.height)

      canvas.width = width * 2 // Higher resolution
      canvas.height = height * 2

      const context = canvas.getContext("2d")
      if (!context) {
        throw new Error("Could not get canvas context")
      }

      // Scale for higher quality
      context.scale(2, 2)

      // Draw background
      context.fillStyle = customColors.backgroundColor
      context.fillRect(0, 0, width, height)

      // Create a more detailed screenshot
      const dataUrl = canvas.toDataURL("image/png", 1.0)
      const link = document.createElement("a")
      link.download = `telegram-${selectedPhone.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.png`
      link.href = dataUrl
      link.click()

      toast({
        title: "Screenshot Saved! 📸",
        description: `Perfect ${selectedPhone.name} Telegram screenshot saved!`,
      })
    } catch (error) {
      console.error("Screenshot error:", error)
      toast({
        title: "Screenshot Failed",
        description: "There was an error creating your screenshot.",
        variant: "destructive",
      })
    } finally {
      setIsCapturing(false)
    }
  }

  // Reset everything
  const resetChat = () => {
    setMessages([])
    setCurrentInput("")
    setStep("setup")
    setMessageCount(0)
    setUnreadCount(0)
    setReplyingTo(null)
    setEditingMessage(null)
    setSelectedMessage(null)
    setSenderProfile({
      name: "",
      photo: "",
      lastSeen: "last seen recently",
      online: true,
      phoneNumber: "+1 234 567 8900",
      bio: "Hey there! I am using Telegram.",
      username: "@sender",
      verified: false,
      premium: false,
    })
    setReceiverProfile({
      name: "",
      photo: "",
      lastSeen: "last seen recently",
      online: true,
      phoneNumber: "+1 987 654 3210",
      bio: "Available",
      username: "@receiver",
      verified: false,
      premium: false,
    })
    setCustomBackground("")
  }

  // Apply theme
  const applyTheme = (theme: ChatTheme) => {
    setSelectedTheme(theme)
    setCustomColors({
      headerColor: theme.headerColor,
      senderBubble: theme.senderBubble,
      receiverBubble: theme.receiverBubble,
      backgroundColor: theme.backgroundColor,
      textColor: theme.textColor,
      accentColor: theme.accentColor,
    })
  }

  // Status bar component
  const StatusBar = () => (
    <div
      className="flex justify-between items-center px-6 py-2 text-white text-sm font-medium"
      style={{
        backgroundColor: customColors.headerColor,
        height: selectedPhone.statusBarHeight,
      }}
    >
      <div className="flex items-center space-x-1">
        <span>{currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
      </div>
      <div className="flex items-center space-x-1">
        {/* Signal bars */}
        <div className="flex space-x-0.5">
          {[1, 2, 3, 4].map((bar) => (
            <div
              key={bar}
              className={`w-1 bg-white rounded-full ${bar <= signalStrength ? "opacity-100" : "opacity-30"}`}
              style={{ height: `${bar * 2 + 2}px` }}
            />
          ))}
        </div>
        <Wifi className="w-4 h-4" />
        <div className="flex items-center">
          <Battery className="w-5 h-3" />
          <span className="text-xs ml-1">{batteryLevel}%</span>
        </div>
      </div>
    </div>
  )

  // Message bubble component with advanced features
  const MessageBubble = ({ message }: { message: Message }) => {
    const isUser = message.senderType === "sender"
    const profile = isUser ? senderProfile : receiverProfile
    const repliedMessage = message.replyTo ? messages.find((m) => m.id === message.replyTo) : null

    return (
      <motion.div
        initial={animationsEnabled ? { opacity: 0, y: 10 } : {}}
        animate={animationsEnabled ? { opacity: 1, y: 0 } : {}}
        className={`flex mb-${compactMode ? "1" : "2"} ${isUser ? "justify-end" : "justify-start"}`}
        onClick={() => setSelectedMessage(selectedMessage === message.id ? null : message.id)}
      >
        <div className={`max-w-[85%] relative ${selectedMessage === message.id ? "ring-2 ring-blue-400" : ""}`}>
          {/* Forwarded indicator */}
          {message.forwarded && (
            <div className="text-xs text-gray-500 mb-1 px-3 flex items-center">
              <Forward className="w-3 h-3 mr-1" />
              Forwarded
            </div>
          )}

          {/* Reply preview */}
          {repliedMessage && (
            <div
              className="text-xs p-2 mb-1 border-l-2 bg-gray-100 dark:bg-gray-800"
              style={{ borderLeftColor: customColors.accentColor }}
            >
              <div className="font-medium">
                {repliedMessage.senderType === "sender" ? senderProfile.name : receiverProfile.name}
              </div>
              <div className="opacity-70">{repliedMessage.content.substring(0, 50)}...</div>
            </div>
          )}

          <div
            className={`${message.type === "sticker" ? "bg-transparent p-0" : `px-3 py-2 shadow-sm`} relative`}
            style={{
              backgroundColor:
                message.type === "sticker"
                  ? "transparent"
                  : isUser
                    ? customColors.senderBubble
                    : customColors.receiverBubble,
              color: customColors.textColor,
              borderRadius: `${bubbleRadius}px`,
              fontFamily: fontSettings.family,
              fontSize: `${fontSettings.size}px`,
              fontWeight: fontSettings.weight,
            }}
          >
            {/* Message content based on type */}
            {message.type === "text" && (
              <div>
                <p className="leading-relaxed whitespace-pre-wrap">
                  {message.content}
                  {message.edited && <span className="text-xs opacity-60 ml-2">edited</span>}
                </p>
                <div className="flex items-center justify-end mt-1 space-x-1">
                  {message.views && (
                    <div className="flex items-center text-xs opacity-60">
                      <Eye className="w-3 h-3 mr-1" />
                      {message.views}
                    </div>
                  )}
                  <span className="text-[11px]" style={{ color: selectedTheme.timeColor }}>
                    {message.timestamp}
                  </span>
                  {isUser && (
                    <div className="flex items-center">
                      {message.status === "sending" && (
                        <Clock className="w-3 h-3" style={{ color: selectedTheme.timeColor }} />
                      )}
                      {message.status === "sent" && (
                        <Check className="w-4 h-4" style={{ color: selectedTheme.timeColor }} />
                      )}
                      {message.status === "delivered" && (
                        <CheckCheck className="w-4 h-4" style={{ color: selectedTheme.timeColor }} />
                      )}
                      {message.status === "read" && <CheckCheck className="w-4 h-4 text-blue-500" />}
                    </div>
                  )}
                  {message.pinned && <Pin className="w-3 h-3 text-blue-500" />}
                </div>
              </div>
            )}

            {message.type === "image" && (
              <div>
                <img
                  src={message.content || "/placeholder.svg"}
                  alt="Shared image"
                  className="max-w-full h-auto rounded-lg mb-1"
                  crossOrigin="anonymous"
                />
                <div className="flex items-center justify-between text-xs">
                  <span>{message.fileSize}</span>
                  <div className="flex items-center space-x-1">
                    {message.views && (
                      <div className="flex items-center opacity-60">
                        <Eye className="w-3 h-3 mr-1" />
                        {message.views}
                      </div>
                    )}
                    <span style={{ color: selectedTheme.timeColor }}>{message.timestamp}</span>
                    {isUser && <CheckCheck className="w-4 h-4 text-blue-500" />}
                  </div>
                </div>
              </div>
            )}

            {message.type === "sticker" && <div className="text-6xl p-2">{message.content}</div>}

            {message.type === "voice" && (
              <div className="flex items-center space-x-3 min-w-[200px]">
                <Button
                  size="icon"
                  className="rounded-full w-8 h-8"
                  style={{ backgroundColor: customColors.accentColor }}
                  onClick={() => setPlayingAudio(playingAudio === message.id ? null : message.id)}
                >
                  {playingAudio === message.id ? (
                    <PauseCircle className="w-4 h-4 text-white" />
                  ) : (
                    <PlayCircle className="w-4 h-4 text-white" />
                  )}
                </Button>
                <div className="flex-1">
                  <div className="flex space-x-1 mb-1">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 rounded-full"
                        style={{
                          height: `${Math.random() * 20 + 5}px`,
                          backgroundColor: customColors.accentColor,
                          opacity: playingAudio === message.id && i < 10 ? 1 : 0.5,
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-xs" style={{ color: selectedTheme.timeColor }}>
                    <span>{message.duration}</span>
                    <div className="flex items-center space-x-1">
                      {message.views && (
                        <div className="flex items-center opacity-60">
                          <Eye className="w-3 h-3 mr-1" />
                          {message.views}
                        </div>
                      )}
                      <span>{message.timestamp}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reactions */}
            {message.reactions && message.reactions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {message.reactions.map((reaction, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-1 text-xs"
                  >
                    <span>{reaction.emoji}</span>
                    <span>{reaction.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Message actions */}
          {selectedMessage === message.id && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-0 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 z-10 flex space-x-1"
            >
              <Button size="icon" variant="ghost" onClick={() => handleReply(message)}>
                <Reply className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => setShowReactionPicker(message.id)}>
                <Heart className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => handleForward(message.id)}>
                <Forward className="w-4 h-4" />
              </Button>
              {isUser && (
                <Button size="icon" variant="ghost" onClick={() => handleEdit(message.id)}>
                  <Edit className="w-4 h-4" />
                </Button>
              )}
              <Button size="icon" variant="ghost" onClick={() => handlePin(message.id)}>
                <Pin className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => handleDelete(message.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => setShowMessageInfo(message.id)}>
                <Eye className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {/* Reaction picker */}
          {showReactionPicker === message.id && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute bottom-0 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 z-10 flex space-x-1"
            >
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(message.id, emoji)}
                  className="text-lg hover:bg-gray-100 dark:hover:bg-gray-700 rounded p-1"
                >
                  {emoji}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>
    )
  }

  if (step === "setup") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
        <Card className="max-w-7xl mx-auto">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-28 h-28 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
                <MessageCircle className="w-14 h-14 text-white" />
              </div>
              <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-2">Ultimate Telegram Clone</h1>
              <p className="text-gray-600 dark:text-gray-300 text-xl">
                Create 100% authentic Telegram conversations with unlimited customization
              </p>
              <div className="flex justify-center space-x-4 mt-4">
                <Badge variant="secondary">🎨 Advanced Themes</Badge>
                <Badge variant="secondary">📱 Multiple Devices</Badge>
                <Badge variant="secondary">🔧 Custom Fonts</Badge>
                <Badge variant="secondary">⚡ Real-time Features</Badge>
              </div>
            </div>

            <Tabs defaultValue="phone" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="phone">📱 Device</TabsTrigger>
                <TabsTrigger value="theme">🎨 Theme</TabsTrigger>
                <TabsTrigger value="fonts">🔤 Fonts</TabsTrigger>
                <TabsTrigger value="profiles">👥 Profiles</TabsTrigger>
                <TabsTrigger value="background">🖼️ Background</TabsTrigger>
                <TabsTrigger value="advanced">⚙️ Advanced</TabsTrigger>
              </TabsList>

              {/* Phone Selection */}
              <TabsContent value="phone" className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <h3 className="text-2xl font-semibold mb-6 text-center">📱 Choose Your Device</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {PHONE_TYPES.map((phone, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedPhone(phone)}
                        className={`relative p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${
                          selectedPhone.name === phone.name
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg"
                            : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                        }`}
                      >
                        <div
                          className="mx-auto bg-gray-900 rounded-lg shadow-lg relative overflow-hidden"
                          style={{
                            width: "80px",
                            height: "160px",
                            borderRadius: phone.borderRadius === "2.5rem" ? "16px" : "12px",
                          }}
                        >
                          {phone.notch && (
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-black rounded-b-lg"></div>
                          )}
                          <div className="w-full h-4 bg-gray-700"></div>
                          <div className="flex-1 bg-gradient-to-br from-blue-500 to-purple-600 m-1 rounded"></div>
                          {phone.homeIndicator && (
                            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gray-600 rounded-full"></div>
                          )}
                        </div>
                        <div className="mt-4 text-center">
                          <p className="font-semibold text-lg">{phone.name}</p>
                          <p className="text-sm text-gray-500">{phone.brand}</p>
                          <p className="text-xs text-gray-400">
                            {phone.width} × {phone.height}
                          </p>
                        </div>
                        {selectedPhone.name === phone.name && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Theme Selection */}
              <TabsContent value="theme" className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <h3 className="text-2xl font-semibold mb-6 text-center">🎨 Choose Theme</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {TELEGRAM_THEMES.map((theme, index) => (
                      <button
                        key={index}
                        onClick={() => applyTheme(theme)}
                        className={`relative p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                          selectedTheme.name === theme.name
                            ? "border-blue-500 ring-2 ring-blue-200 shadow-lg"
                            : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="h-10 rounded-t-lg" style={{ backgroundColor: theme.headerColor }}></div>
                          <div
                            className="h-20 rounded-b-lg relative"
                            style={{ backgroundColor: theme.backgroundColor }}
                          >
                            <div
                              className="absolute top-2 right-2 w-10 h-6 rounded-lg"
                              style={{ backgroundColor: theme.senderBubble }}
                            ></div>
                            <div
                              className="absolute bottom-2 left-2 w-10 h-6 rounded-lg"
                              style={{ backgroundColor: theme.receiverBubble }}
                            ></div>
                          </div>
                        </div>
                        <p className="text-sm font-medium mt-3 text-center">{theme.name}</p>
                        {selectedTheme.name === theme.name && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Custom Colors */}
                  <div className="mt-8 grid md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Header Color</h4>
                      <input
                        type="color"
                        value={customColors.headerColor}
                        onChange={(e) => setCustomColors((prev) => ({ ...prev, headerColor: e.target.value }))}
                        className="w-full h-12 rounded-lg border-2 border-gray-200"
                      />
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold">Sender Bubble</h4>
                      <input
                        type="color"
                        value={customColors.senderBubble}
                        onChange={(e) => setCustomColors((prev) => ({ ...prev, senderBubble: e.target.value }))}
                        className="w-full h-12 rounded-lg border-2 border-gray-200"
                      />
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold">Receiver Bubble</h4>
                      <input
                        type="color"
                        value={customColors.receiverBubble}
                        onChange={(e) => setCustomColors((prev) => ({ ...prev, receiverBubble: e.target.value }))}
                        className="w-full h-12 rounded-lg border-2 border-gray-200"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Font Settings */}
              <TabsContent value="fonts" className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <h3 className="text-2xl font-semibold mb-6 text-center">🔤 Font Customization</h3>

                  <div className="grid md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                      <Label className="text-lg font-medium">Font Family</Label>
                      <Select
                        value={fontSettings.family}
                        onValueChange={(value) => setFontSettings((prev) => ({ ...prev, family: value }))}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FONT_FAMILIES.map((font) => (
                            <SelectItem key={font.name} value={font.value} style={{ fontFamily: font.value }}>
                              {font.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-lg font-medium">Font Size: {fontSettings.size}px</Label>
                      <Slider
                        value={[fontSettings.size]}
                        onValueChange={(value) => setFontSettings((prev) => ({ ...prev, size: value[0] }))}
                        max={24}
                        min={10}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Small</span>
                        <span>Large</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-lg font-medium">Font Weight</Label>
                      <Select
                        value={fontSettings.weight}
                        onValueChange={(value) => setFontSettings((prev) => ({ ...prev, weight: value }))}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="300">Light</SelectItem>
                          <SelectItem value="400">Normal</SelectItem>
                          <SelectItem value="500">Medium</SelectItem>
                          <SelectItem value="600">Semi Bold</SelectItem>
                          <SelectItem value="700">Bold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Font Preview */}
                  <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <h4 className="font-semibold mb-4">Preview</h4>
                    <div
                      className="p-4 bg-white dark:bg-gray-800 rounded-lg"
                      style={{
                        fontFamily: fontSettings.family,
                        fontSize: `${fontSettings.size}px`,
                        fontWeight: fontSettings.weight,
                      }}
                    >
                      <p>This is how your messages will look in the chat!</p>
                      <p className="text-sm opacity-70 mt-2">
                        Font: {FONT_FAMILIES.find((f) => f.value === fontSettings.family)?.name}
                      </p>
                    </div>
                  </div>

                  {/* Bubble Radius Settings */}
                  <div className="mt-8 grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Label className="text-lg font-medium">Message Bubble Radius: {bubbleRadius}px</Label>
                      <Slider
                        value={[bubbleRadius]}
                        onValueChange={(value) => setBubbleRadius(value[0])}
                        max={30}
                        min={5}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-4">
                      <Label className="text-lg font-medium">Input Field Radius: {inputRadius}px</Label>
                      <Slider
                        value={[inputRadius]}
                        onValueChange={(value) => setInputRadius(value[0])}
                        max={50}
                        min={5}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Profile Setup */}
              <TabsContent value="profiles" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Sender Profile */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-semibold mb-6 text-center text-blue-600">👤 Sender Profile</h3>

                    <div className="flex flex-col items-center space-y-6">
                      <div className="relative">
                        {senderProfile.photo ? (
                          <img
                            src={senderProfile.photo || "/placeholder.svg"}
                            alt="Sender"
                            className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-lg"
                            crossOrigin="anonymous"
                          />
                        ) : (
                          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
                            <span className="text-4xl text-white font-bold">
                              {senderProfile.name.charAt(0).toUpperCase() || "S"}
                            </span>
                          </div>
                        )}
                        <label className="absolute bottom-2 right-2 bg-blue-500 text-white rounded-full p-3 cursor-pointer hover:bg-blue-600 shadow-lg transition-colors">
                          <Camera className="w-5 h-5" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handlePhotoUpload(e, "sender")}
                          />
                        </label>
                      </div>

                      <div className="w-full space-y-4">
                        <div>
                          <Label htmlFor="senderName">Display Name</Label>
                          <Input
                            id="senderName"
                            value={senderProfile.name}
                            onChange={(e) => setSenderProfile((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter sender name"
                            className="mt-1 text-lg"
                          />
                        </div>

                        <div>
                          <Label htmlFor="senderUsername">Username</Label>
                          <Input
                            id="senderUsername"
                            value={senderProfile.username}
                            onChange={(e) => setSenderProfile((prev) => ({ ...prev, username: e.target.value }))}
                            placeholder="@username"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="senderPhone">Phone Number</Label>
                          <Input
                            id="senderPhone"
                            value={senderProfile.phoneNumber}
                            onChange={(e) => setSenderProfile((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                            placeholder="+1 234 567 8900"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="senderBio">Bio</Label>
                          <Textarea
                            id="senderBio"
                            value={senderProfile.bio}
                            onChange={(e) => setSenderProfile((prev) => ({ ...prev, bio: e.target.value }))}
                            placeholder="Hey there! I am using Telegram."
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="senderStatus">Last Seen Status</Label>
                          <Input
                            id="senderStatus"
                            value={senderProfile.lastSeen}
                            onChange={(e) => setSenderProfile((prev) => ({ ...prev, lastSeen: e.target.value }))}
                            placeholder="last seen recently"
                            className="mt-1"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={senderProfile.online}
                              onCheckedChange={(checked) => setSenderProfile((prev) => ({ ...prev, online: checked }))}
                            />
                            <Label>Show as Online</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={senderProfile.verified}
                              onCheckedChange={(checked) =>
                                setSenderProfile((prev) => ({ ...prev, verified: checked }))
                              }
                            />
                            <Label>Verified</Label>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={senderProfile.premium}
                            onCheckedChange={(checked) => setSenderProfile((prev) => ({ ...prev, premium: checked }))}
                          />
                          <Label>Premium Account</Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Receiver Profile */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-semibold mb-6 text-center text-green-600">👥 Receiver Profile</h3>

                    <div className="flex flex-col items-center space-y-6">
                      <div className="relative">
                        {receiverProfile.photo ? (
                          <img
                            src={receiverProfile.photo || "/placeholder.svg"}
                            alt="Receiver"
                            className="w-32 h-32 rounded-full object-cover border-4 border-green-500 shadow-lg"
                            crossOrigin="anonymous"
                          />
                        ) : (
                          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
                            <span className="text-4xl text-white font-bold">
                              {receiverProfile.name.charAt(0).toUpperCase() || "R"}
                            </span>
                          </div>
                        )}
                        <label className="absolute bottom-2 right-2 bg-green-500 text-white rounded-full p-3 cursor-pointer hover:bg-green-600 shadow-lg transition-colors">
                          <Camera className="w-5 h-5" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handlePhotoUpload(e, "receiver")}
                          />
                        </label>
                      </div>

                      <div className="w-full space-y-4">
                        <div>
                          <Label htmlFor="receiverName">Display Name</Label>
                          <Input
                            id="receiverName"
                            value={receiverProfile.name}
                            onChange={(e) => setReceiverProfile((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter receiver name"
                            className="mt-1 text-lg"
                          />
                        </div>

                        <div>
                          <Label htmlFor="receiverUsername">Username</Label>
                          <Input
                            id="receiverUsername"
                            value={receiverProfile.username}
                            onChange={(e) => setReceiverProfile((prev) => ({ ...prev, username: e.target.value }))}
                            placeholder="@username"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="receiverPhone">Phone Number</Label>
                          <Input
                            id="receiverPhone"
                            value={receiverProfile.phoneNumber}
                            onChange={(e) => setReceiverProfile((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                            placeholder="+1 987 654 3210"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="receiverBio">Bio</Label>
                          <Textarea
                            id="receiverBio"
                            value={receiverProfile.bio}
                            onChange={(e) => setReceiverProfile((prev) => ({ ...prev, bio: e.target.value }))}
                            placeholder="Available"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="receiverStatus">Last Seen Status</Label>
                          <Input
                            id="receiverStatus"
                            value={receiverProfile.lastSeen}
                            onChange={(e) => setReceiverProfile((prev) => ({ ...prev, lastSeen: e.target.value }))}
                            placeholder="last seen recently"
                            className="mt-1"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={receiverProfile.online}
                              onCheckedChange={(checked) =>
                                setReceiverProfile((prev) => ({ ...prev, online: checked }))
                              }
                            />
                            <Label>Show as Online</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={receiverProfile.verified}
                              onCheckedChange={(checked) =>
                                setReceiverProfile((prev) => ({ ...prev, verified: checked }))
                              }
                            />
                            <Label>Verified</Label>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={receiverProfile.premium}
                            onCheckedChange={(checked) => setReceiverProfile((prev) => ({ ...prev, premium: checked }))}
                          />
                          <Label>Premium Account</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Background Customization */}
              <TabsContent value="background" className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <h3 className="text-2xl font-semibold mb-6 text-center">🖼️ Background Customization</h3>

                  <div className="space-y-6">
                    <div className="flex items-center justify-center">
                      <Button
                        onClick={() => bgImageInputRef.current?.click()}
                        className="flex items-center space-x-2 text-lg px-8 py-4"
                      >
                        <ImageIcon className="w-6 h-6" />
                        <span>Upload Custom Background</span>
                      </Button>
                      <input
                        ref={bgImageInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleBackgroundUpload}
                      />
                    </div>

                    {customBackground && (
                      <div className="space-y-6">
                        <div className="text-center">
                          <img
                            src={customBackground || "/placeholder.svg"}
                            alt="Background preview"
                            className="max-w-64 h-40 object-cover rounded-xl mx-auto shadow-lg"
                            crossOrigin="anonymous"
                          />
                        </div>
                        <div className="space-y-4">
                          <Label className="text-lg font-medium">
                            Background Opacity: {Math.round(backgroundOpacity[0] * 100)}%
                          </Label>
                          <Slider
                            value={backgroundOpacity}
                            onValueChange={setBackgroundOpacity}
                            max={1}
                            min={0.1}
                            step={0.1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>Transparent</span>
                            <span>Opaque</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Preset Backgrounds */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold">Preset Backgrounds</h4>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                        {[
                          { name: "Gradient Blue", bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
                          { name: "Sunset", bg: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)" },
                          { name: "Ocean", bg: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" },
                          { name: "Forest", bg: "linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)" },
                          { name: "Night", bg: "linear-gradient(135deg, #2c3e50 0%, #000000 100%)" },
                          { name: "Aurora", bg: "linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)" },
                        ].map((preset, index) => (
                          <button
                            key={index}
                            onClick={() => setCustomBackground(preset.bg)}
                            className="h-20 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-all"
                            style={{ background: preset.bg }}
                            title={preset.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Advanced Settings */}
              <TabsContent value="advanced" className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <h3 className="text-2xl font-semibold mb-6 text-center">⚙️ Advanced Settings</h3>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Device Settings */}
                    <div className="space-y-6">
                      <h4 className="text-lg font-semibold">📱 Device Settings</h4>

                      <div className="space-y-4">
                        <div>
                          <Label className="text-base">Battery Level: {batteryLevel}%</Label>
                          <Slider
                            value={[batteryLevel]}
                            onValueChange={(value) => setBatteryLevel(value[0])}
                            max={100}
                            min={1}
                            step={1}
                            className="w-full mt-2"
                          />
                        </div>

                        <div>
                          <Label className="text-base">Signal Strength: {signalStrength}/4</Label>
                          <Slider
                            value={[signalStrength]}
                            onValueChange={(value) => setSignalStrength(value[0])}
                            max={4}
                            min={0}
                            step={1}
                            className="w-full mt-2"
                          />
                        </div>

                        <div>
                          <Label className="text-base">Current Time</Label>
                          <Input
                            type="time"
                            value={currentTime.toTimeString().slice(0, 5)}
                            onChange={(e) => {
                              const [hours, minutes] = e.target.value.split(":")
                              const newTime = new Date()
                              newTime.setHours(Number.parseInt(hours), Number.parseInt(minutes))
                              setCurrentTime(newTime)
                            }}
                            className="w-full mt-2"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Chat Features */}
                    <div className="space-y-6">
                      <h4 className="text-lg font-semibold">💬 Chat Features</h4>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>Secret Chat Mode</Label>
                          <Switch checked={secretChat} onCheckedChange={setSecretChat} />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label>Auto-Delete Messages</Label>
                          <Switch checked={autoDelete} onCheckedChange={setAutoDelete} />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label>Read Receipts</Label>
                          <Switch checked={readReceipts} onCheckedChange={setReadReceipts} />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label>Sound Effects</Label>
                          <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label>Vibration</Label>
                          <Switch checked={vibrationEnabled} onCheckedChange={setVibrationEnabled} />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label>Show Online Status</Label>
                          <Switch checked={showOnlineStatus} onCheckedChange={setShowOnlineStatus} />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label>Compact Mode</Label>
                          <Switch checked={compactMode} onCheckedChange={setCompactMode} />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label>Animations</Label>
                          <Switch checked={animationsEnabled} onCheckedChange={setAnimationsEnabled} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-8 flex justify-center">
              <Button
                onClick={handleStartChat}
                className="text-xl py-6 px-12 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 hover:from-blue-600 hover:via-purple-700 hover:to-pink-600 text-white font-bold rounded-2xl shadow-2xl transform hover:scale-105 transition-all"
              >
                🚀 Create Ultimate Telegram Chat
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-4 px-4">
      <div className="max-w-md mx-auto">
        {/* Phone Frame */}
        <div
          className="bg-black shadow-2xl relative"
          style={{
            width: selectedPhone.width,
            height: selectedPhone.height,
            borderRadius: selectedPhone.borderRadius,
            padding: selectedPhone.bezels,
          }}
        >
          {/* Notch for iPhone */}
          {selectedPhone.notch && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10"></div>
          )}

          <div
            className="bg-white dark:bg-gray-900 overflow-hidden relative"
            style={{
              width: "100%",
              height: "100%",
              borderRadius: `calc(${selectedPhone.borderRadius} - ${selectedPhone.bezels})`,
            }}
          >
            {/* Screenshot Area */}
            <div ref={screenshotRef} className="relative h-full flex flex-col">
              {/* Status Bar */}
              <StatusBar />

              {/* Chat Header */}
              <div
                className="text-white px-4 py-3 flex items-center justify-between shadow-sm"
                style={{ backgroundColor: customColors.headerColor }}
              >
                <div className="flex items-center space-x-3">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 p-2">
                    <ArrowLeft className="w-6 h-6" />
                  </Button>

                  {/* In the Chat Header section, replace the profile photo div with: */}
                  <div
                    className="flex items-center space-x-3 cursor-pointer hover:bg-white/10 rounded-lg p-1 transition-colors"
                    onClick={() => handleProfileClick("receiver")}
                  >
                    {receiverProfile.photo ? (
                      <img
                        src={receiverProfile.photo || "/placeholder.svg"}
                        alt={receiverProfile.name}
                        className="w-10 h-10 rounded-full object-cover"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {receiverProfile.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}

                    <div>
                      <div className="font-medium text-white flex items-center space-x-1">
                        <span>{receiverProfile.name}</span>
                        {receiverProfile.verified && <Check className="w-4 h-4 text-blue-300" />}
                        {receiverProfile.premium && <Star className="w-4 h-4 text-yellow-300" />}
                      </div>
                      <div className="text-xs text-blue-100">
                        {isTyping && typingUser === receiverProfile.name
                          ? "typing..."
                          : showOnlineStatus && receiverProfile.online
                            ? "online"
                            : receiverProfile.lastSeen}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 p-2">
                    <Search className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 p-2">
                    <Phone className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 p-2">
                    <Video className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 p-2">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Secret Chat Indicator */}
              {secretChat && (
                <div className="bg-green-600 text-white text-center py-1 text-xs">
                  <Lock className="w-3 h-3 inline mr-1" />
                  Secret Chat - End-to-end encrypted
                </div>
              )}

              {/* Messages Area */}
              {/* In the Messages Area section, replace the background styling with: */}
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto px-4 py-2 relative"
                style={{
                  backgroundColor: customColors.backgroundColor,
                }}
              >
                {/* Fixed background that doesn't scroll */}
                <div
                  className=""
                  style={{
                    backgroundImage: customBackground
                      ? `url(${customBackground})`
                      : "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fillOpacity='0.03'%3E%3Cpath d='m0 40l40-40h-40v40zm40 0v-40h-40l40 40z'/%3E%3C/g%3E%3C/svg%3E\")",
                    backgroundSize: customBackground ? "cover" : "40px 40px",
                    backgroundPosition: "center",
                    backgroundRepeat: customBackground ? "no-repeat" : "repeat",
                    backgroundAttachment: "fixed",
                  }}
                />

                {customBackground && (
                  <div
                    className=""
                    style={{
                      backgroundColor: customColors.backgroundColor,
                      opacity: 1 - backgroundOpacity[0],
                    }}
                  />
                )}

                <div className="relative z-10">
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center py-20">
                      <div className="bg-white/10 rounded-full p-4 mb-4">
                        <MessageCircle className="w-12 h-12" style={{ color: customColors.textColor }} />
                      </div>
                      <p className="text-lg font-medium" style={{ color: customColors.textColor }}>
                        No messages here yet...
                      </p>
                      <p className="text-sm opacity-70" style={{ color: customColors.textColor }}>
                        Send a message to start the conversation
                      </p>
                    </div>
                  )}

                  {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}

                  {/* Typing indicator */}
                  <AnimatePresence>
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex justify-start mb-2"
                      >
                        <div
                          className="px-4 py-3"
                          style={{
                            backgroundColor: customColors.receiverBubble,
                            borderRadius: `${bubbleRadius}px`,
                          }}
                        >
                          <div className="flex space-x-1">
                            <motion.div
                              animate={{ y: [0, -5, 0] }}
                              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1 }}
                              className="w-2 h-2 bg-gray-400 rounded-full"
                            />
                            <motion.div
                              animate={{ y: [0, -5, 0] }}
                              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, delay: 0.2 }}
                              className="w-2 h-2 bg-gray-400 rounded-full"
                            />
                            <motion.div
                              animate={{ y: [0, -5, 0] }}
                              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, delay: 0.4 }}
                              className="w-2 h-2 bg-gray-400 rounded-full"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Reply Preview */}
              {replyingTo && (
                <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Reply className="w-4 h-4 text-blue-500" />
                      <div>
                        <div className="text-xs font-medium text-blue-500">
                          Replying to {replyingTo.senderType === "sender" ? senderProfile.name : receiverProfile.name}
                        </div>
                        <div className="text-sm opacity-70">{replyingTo.content.substring(0, 50)}...</div>
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => setReplyingTo(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Voice Recorder */}
              {showVoiceRecorder && (
                <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border-t border-red-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-red-600 font-medium">Recording: {formatRecordingTime(recordingTime)}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => stopRecording("sender")}>
                        Send as Sender
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => stopRecording("receiver")}>
                        Send as Receiver
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div
                className="border-t px-4 py-3"
                // style={{
                //   backgroundColor: customColors.inputBackground,
                //   borderColor: customColors.borderColor,
                // }}
              >
                <div className="flex items-end space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-gray-100 p-2"
                    style={{ color: customColors.textColor }}
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <Smile className="w-6 h-6" />
                  </Button>

                  <div className="flex-1 relative">
                    <Textarea
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      placeholder="Message"
                      className="min-h-[40px] max-h-[120px] resize-none px-4 py-2 pr-12 text-[16px] leading-relaxed"
                      style={{
                        backgroundColor: customColors.backgroundColor,
                        color: customColors.textColor,
                        borderColor: customColors.borderColor,
                        borderRadius: `${inputRadius}px`,
                        fontFamily: fontSettings.family,
                        fontSize: `${fontSettings.size}px`,
                        fontWeight: fontSettings.weight,
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                        }
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:bg-gray-100 p-1"
                      style={{ color: customColors.textColor }}
                    >
                      <Paperclip className="w-5 h-5" />
                    </Button>
                  </div>

                  {currentInput.trim() ? (
                    <div className="flex flex-col space-y-1">
                      <Button
                        onClick={() => handleSendMessage("sender")}
                        size="icon"
                        className="text-white rounded-full w-10 h-10"
                        style={{ backgroundColor: customColors.accentColor }}
                      >
                        <Send className="w-5 h-5" />
                      </Button>
                      <Button
                        onClick={() => handleSendMessage("receiver")}
                        size="icon"
                        className="bg-green-500 hover:bg-green-600 text-white rounded-full w-10 h-10"
                      >
                        <Send className="w-5 h-5" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-gray-100 p-2"
                      style={{ color: customColors.textColor }}
                      onMouseDown={startRecording}
                      onMouseUp={() => setShowVoiceRecorder(false)}
                      onMouseLeave={() => setShowVoiceRecorder(false)}
                    >
                      <Mic className={`w-6 h-6 ${isRecording ? "text-red-500" : ""}`} />
                    </Button>
                  )}
                </div>

                {/* Replace the Quick Action Buttons section with this enhanced version: */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center space-x-1 overflow-x-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => triggerImageUpload("sender")}
                      className="text-xs whitespace-nowrap"
                    >
                      📷 S
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => triggerImageUpload("receiver")}
                      className="text-xs whitespace-nowrap"
                    >
                      📷 R
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowStickerPicker(!showStickerPicker)}
                      className="text-xs"
                    >
                      😀
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => sendLocationMessage("sender")}
                      className="text-xs"
                    >
                      📍
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => sendContactMessage("sender")}
                      className="text-xs"
                    >
                      👤
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => sendPollMessage("sender")} className="text-xs">
                      📊
                    </Button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      {messageCount} messages
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAdvancedSettings(true)}
                      className="text-xs"
                    >
                      <Settings className="w-3 h-3 mr-1" />
                      Settings
                    </Button>
                  </div>
                </div>

                {/* Emoji Picker */}
                <AnimatePresence>
                  {showEmojiPicker && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 p-3 bg-gray-50 rounded-2xl border max-h-40 overflow-y-auto"
                    >
                      <div className="grid grid-cols-8 gap-2">
                        {EMOJIS.map((emoji, index) => (
                          <button
                            key={index}
                            onClick={() => handleEmojiSelect(emoji)}
                            className="text-2xl hover:bg-gray-200 rounded-lg p-2 transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Sticker Picker */}
                <AnimatePresence>
                  {showStickerPicker && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 p-3 bg-gray-50 rounded-2xl border max-h-40 overflow-y-auto"
                    >
                      <div className="grid grid-cols-6 gap-2">
                        {STICKERS.map((sticker, index) => (
                          <div key={index} className="flex flex-col space-y-1">
                            <button
                              onClick={() => handleStickerSend(sticker, "sender")}
                              className="text-4xl hover:bg-blue-100 rounded-lg p-2 transition-colors"
                              title="Send as Sender"
                            >
                              {sticker}
                            </button>
                            <button
                              onClick={() => handleStickerSend(sticker, "receiver")}
                              className="text-4xl hover:bg-green-100 rounded-lg p-2 transition-colors"
                              title="Send as Receiver"
                            >
                              {sticker}
                            </button>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Home Indicator for iPhone */}
              {selectedPhone.homeIndicator && (
                <div className="flex justify-center py-2">
                  <div className="w-32 h-1 bg-gray-400 rounded-full"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <Button
            onClick={takeScreenshot}
            disabled={isCapturing}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            {isCapturing ? "Capturing..." : "📸 Screenshot"}
          </Button>

          <Button onClick={resetChat} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />🔄 Reset Chat
          </Button>

          <Button onClick={() => setShowAdvancedSettings(true)} variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            ⚙️ Settings
          </Button>

          <Button
            onClick={() => {
              const stats = {
                messages: messageCount,
                characters: messages.reduce((acc, msg) => acc + msg.content.length, 0),
                images: messages.filter((msg) => msg.type === "image").length,
                stickers: messages.filter((msg) => msg.type === "sticker").length,
                voices: messages.filter((msg) => msg.type === "voice").length,
              }
              toast({
                title: "Chat Statistics 📊",
                description: `${stats.messages} messages, ${stats.characters} characters, ${stats.images} images, ${stats.stickers} stickers, ${stats.voices} voice messages`,
              })
            }}
            variant="outline"
          >
            📊 Stats
          </Button>
        </div>

        {/* Advanced Settings Dialog */}
        <Dialog open={showAdvancedSettings} onOpenChange={setShowAdvancedSettings}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>⚙️ Advanced Chat Settings</DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="appearance" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="appearance">🎨 Appearance</TabsTrigger>
                <TabsTrigger value="behavior">⚡ Behavior</TabsTrigger>
                <TabsTrigger value="device">📱 Device</TabsTrigger>
                <TabsTrigger value="export">💾 Export</TabsTrigger>
              </TabsList>

              <TabsContent value="appearance" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Phone Type</Label>
                    <Select
                      value={selectedPhone.name}
                      onValueChange={(value) => {
                        const phone = PHONE_TYPES.find((p) => p.name === value)
                        if (phone) setSelectedPhone(phone)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PHONE_TYPES.map((phone) => (
                          <SelectItem key={phone.name} value={phone.name}>
                            {phone.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Theme</Label>
                    <Select
                      value={selectedTheme.name}
                      onValueChange={(value) => {
                        const theme = TELEGRAM_THEMES.find((t) => t.name === value)
                        if (theme) applyTheme(theme)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TELEGRAM_THEMES.map((theme) => (
                          <SelectItem key={theme.name} value={theme.name}>
                            {theme.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Font Size: {fontSettings.size}px</Label>
                    <Slider
                      value={[fontSettings.size]}
                      onValueChange={(value) => setFontSettings((prev) => ({ ...prev, size: value[0] }))}
                      max={24}
                      min={10}
                      step={1}
                    />
                  </div>

                  <div>
                    <Label>Bubble Radius: {bubbleRadius}px</Label>
                    <Slider
                      value={[bubbleRadius]}
                      onValueChange={(value) => setBubbleRadius(value[0])}
                      max={30}
                      min={5}
                      step={1}
                    />
                  </div>

                  <div>
                    <Label>Input Radius: {inputRadius}px</Label>
                    <Slider
                      value={[inputRadius]}
                      onValueChange={(value) => setInputRadius(value[0])}
                      max={50}
                      min={5}
                      step={1}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="behavior" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label>Secret Chat</Label>
                    <Switch checked={secretChat} onCheckedChange={setSecretChat} />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Auto-Delete</Label>
                    <Switch checked={autoDelete} onCheckedChange={setAutoDelete} />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Read Receipts</Label>
                    <Switch checked={readReceipts} onCheckedChange={setReadReceipts} />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Sound Effects</Label>
                    <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Vibration</Label>
                    <Switch checked={vibrationEnabled} onCheckedChange={setVibrationEnabled} />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Online Status</Label>
                    <Switch checked={showOnlineStatus} onCheckedChange={setShowOnlineStatus} />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Compact Mode</Label>
                    <Switch checked={compactMode} onCheckedChange={setCompactMode} />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Animations</Label>
                    <Switch checked={animationsEnabled} onCheckedChange={setAnimationsEnabled} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="device" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label>Battery Level: {batteryLevel}%</Label>
                    <Slider
                      value={[batteryLevel]}
                      onValueChange={(value) => setBatteryLevel(value[0])}
                      max={100}
                      min={1}
                      step={1}
                    />
                  </div>

                  <div>
                    <Label>Signal Strength: {signalStrength}/4</Label>
                    <Slider
                      value={[signalStrength]}
                      onValueChange={(value) => setSignalStrength(value[0])}
                      max={4}
                      min={0}
                      step={1}
                    />
                  </div>

                  <div>
                    <Label>Current Time</Label>
                    <Input
                      type="time"
                      value={currentTime.toTimeString().slice(0, 5)}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(":")
                        const newTime = new Date()
                        newTime.setHours(Number.parseInt(hours), Number.parseInt(minutes))
                        setCurrentTime(newTime)
                      }}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="export" className="space-y-4">
                <div className="space-y-4">
                  <Button
                    onClick={() => {
                      const chatData = {
                        messages,
                        senderProfile,
                        receiverProfile,
                        theme: selectedTheme,
                        phone: selectedPhone,
                        settings: {
                          fontSettings,
                          customColors,
                          bubbleRadius,
                          inputRadius,
                          secretChat,
                          autoDelete,
                          readReceipts,
                        },
                      }
                      const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: "application/json" })
                      const url = URL.createObjectURL(blob)
                      const link = document.createElement("a")
                      link.href = url
                      link.download = `telegram-chat-${Date.now()}.json`
                      link.click()
                      URL.revokeObjectURL(url)
                    }}
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Chat Data (JSON)
                  </Button>

                  <Button
                    onClick={() => {
                      const chatText = messages
                        .map((msg) => {
                          const sender = msg.senderType === "sender" ? senderProfile.name : receiverProfile.name
                          return `[${msg.timestamp}] ${sender}: ${msg.content}`
                        })
                        .join("\n")

                      const blob = new Blob([chatText], { type: "text/plain" })
                      const url = URL.createObjectURL(blob)
                      const link = document.createElement("a")
                      link.href = url
                      link.download = `telegram-chat-${Date.now()}.txt`
                      link.click()
                      URL.revokeObjectURL(url)
                    }}
                    className="w-full"
                    variant="outline"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Export as Text File
                  </Button>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-semibold mb-2">Chat Statistics</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Messages: {messageCount}</div>
                      <div>Characters: {messages.reduce((acc, msg) => acc + msg.content.length, 0)}</div>
                      <div>Images: {messages.filter((msg) => msg.type === "image").length}</div>
                      <div>Stickers: {messages.filter((msg) => msg.type === "sticker").length}</div>
                      <div>Voice: {messages.filter((msg) => msg.type === "voice").length}</div>
                      <div>Total Views: {messages.reduce((acc, msg) => acc + (msg.views || 0), 0)}</div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setShowAdvancedSettings(false)}>
                Close
              </Button>
              <Button onClick={() => setShowAdvancedSettings(false)}>Save Settings</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Message Info Dialog */}
        <Dialog open={!!showMessageInfo} onOpenChange={() => setShowMessageInfo(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Message Information</DialogTitle>
            </DialogHeader>
            {showMessageInfo && (
              <div className="space-y-4">
                {(() => {
                  const message = messages.find((m) => m.id === showMessageInfo)
                  if (!message) return null

                  return (
                    <div className="space-y-2">
                      <div>
                        <strong>Type:</strong> {message.type}
                      </div>
                      <div>
                        <strong>Sender:</strong>{" "}
                        {message.senderType === "sender" ? senderProfile.name : receiverProfile.name}
                      </div>
                      <div>
                        <strong>Time:</strong> {message.timestamp}
                      </div>
                      <div>
                        <strong>Status:</strong> {message.status}
                      </div>
                      {message.views && (
                        <div>
                          <strong>Views:</strong> {message.views}
                        </div>
                      )}
                      {message.fileSize && (
                        <div>
                          <strong>File Size:</strong> {message.fileSize}
                        </div>
                      )}
                      {message.duration && (
                        <div>
                          <strong>Duration:</strong> {message.duration}
                        </div>
                      )}
                      {message.edited && (
                        <div>
                          <strong>Edited:</strong> Yes
                        </div>
                      )}
                      {message.forwarded && (
                        <div>
                          <strong>Forwarded:</strong> Yes
                        </div>
                      )}
                      {message.pinned && (
                        <div>
                          <strong>Pinned:</strong> Yes
                        </div>
                      )}
                      {message.reactions && message.reactions.length > 0 && (
                        <div>
                          <strong>Reactions:</strong>
                          <div className="flex space-x-2 mt-1">
                            {message.reactions.map((reaction, index) => (
                              <span key={index} className="bg-gray-100 px-2 py-1 rounded">
                                {reaction.emoji} {reaction.count}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Profile Detail Dialog */}
        <Dialog open={!!showProfileDialog} onOpenChange={() => setShowProfileDialog(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center">
                {showProfileDialog === "sender" ? senderProfile.name : receiverProfile.name}
              </DialogTitle>
            </DialogHeader>
            {showProfileDialog && (
              <div className="space-y-6">
                {(() => {
                  const profile = showProfileDialog === "sender" ? senderProfile : receiverProfile
                  return (
                    <div className="flex flex-col items-center space-y-4">
                      {/* Large Profile Photo */}
                      <div className="relative">
                        {profile.photo ? (
                          <img
                            src={profile.photo || "/placeholder.svg"}
                            alt={profile.name}
                            className="w-32 h-32 rounded-full object-cover shadow-lg"
                            crossOrigin="anonymous"
                          />
                        ) : (
                          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
                            <span className="text-4xl text-white font-bold">
                              {profile.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        {profile.online && (
                          <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>

                      {/* Profile Info */}
                      <div className="text-center space-y-2">
                        <div className="flex items-center justify-center space-x-2">
                          <h3 className="text-xl font-semibold">{profile.name}</h3>
                          {profile.verified && <Check className="w-5 h-5 text-blue-500" />}
                          {profile.premium && <Star className="w-5 h-5 text-yellow-500" />}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">{profile.username}</p>
                        <p className="text-sm text-gray-500">{profile.online ? "online" : profile.lastSeen}</p>
                      </div>

                      {/* Bio */}
                      <div className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h4 className="font-medium mb-2">Bio</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{profile.bio}</p>
                      </div>

                      {/* Contact Info */}
                      <div className="w-full space-y-3">
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Phone className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="font-medium">Phone</p>
                            <p className="text-sm text-gray-600">{profile.phoneNumber}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <MessageCircle className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="font-medium">Username</p>
                            <p className="text-sm text-gray-600">{profile.username}</p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="w-full grid grid-cols-2 gap-3">
                        <Button className="flex items-center space-x-2">
                          <MessageCircle className="w-4 h-4" />
                          <span>Message</span>
                        </Button>
                        <Button variant="outline" className="flex items-center space-x-2">
                          <Phone className="w-4 h-4" />
                          <span>Call</span>
                        </Button>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Hidden file inputs */}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        <audio ref={audioRef} className="hidden" />
      </div>
    </div>
  )
}
