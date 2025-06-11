"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { Moon, Sun, Monitor, Palette } from "lucide-react"

export default function DarkModeToggle() {
  const { theme, setTheme, themes } = useTheme()

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun, description: "Clean and bright interface" },
    { value: "dark", label: "Dark", icon: Moon, description: "Easy on the eyes in low light" },
    { value: "system", label: "System", icon: Monitor, description: "Follows your device settings" },
  ]

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-6 w-6 text-primary" />
              <CardTitle>Dark Mode Toggle</CardTitle>
            </div>
            <CardDescription>Switch between light and dark themes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid gap-4">
                {themeOptions.map((option) => {
                  const Icon = option.icon
                  const isActive = theme === option.value

                  return (
                    <motion.div key={option.value} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant={isActive ? "default" : "outline"}
                        className={`w-full h-auto p-4 justify-start ${
                          isActive ? "ring-2 ring-primary ring-offset-2" : ""
                        }`}
                        onClick={() => setTheme(option.value)}
                      >
                        <div className="flex items-center gap-4">
                          <motion.div animate={{ rotate: isActive ? 360 : 0 }} transition={{ duration: 0.5 }}>
                            <Icon className="h-6 w-6" />
                          </motion.div>
                          <div className="text-left">
                            <div className="font-semibold">{option.label}</div>
                            <div className="text-sm opacity-70">{option.description}</div>
                          </div>
                        </div>
                      </Button>
                    </motion.div>
                  )
                })}
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Theme Preview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Light Theme Preview */}
                  <motion.div className="p-4 rounded-lg border bg-white text-black" whileHover={{ scale: 1.05 }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Sun className="h-4 w-4" />
                      <span className="font-medium">Light Theme</span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-200 rounded"></div>
                      <div className="h-2 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </motion.div>

                  {/* Dark Theme Preview */}
                  <motion.div className="p-4 rounded-lg border bg-gray-900 text-white" whileHover={{ scale: 1.05 }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Moon className="h-4 w-4" />
                      <span className="font-medium">Dark Theme</span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-700 rounded"></div>
                      <div className="h-2 bg-gray-600 rounded w-3/4"></div>
                      <div className="h-2 bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </motion.div>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Current Theme Information</h4>
                <div className="text-sm space-y-1">
                  <div>
                    Active Theme: <span className="font-mono">{theme}</span>
                  </div>
                  <div>
                    Available Themes: <span className="font-mono">{themes.join(", ")}</span>
                  </div>
                  <div>
                    Preference Saved: <span className="font-mono">localStorage</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
