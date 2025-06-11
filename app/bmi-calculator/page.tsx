"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Activity, Calculator } from "lucide-react"

export default function BMICalculator() {
  const [height, setHeight] = useState("")
  const [weight, setWeight] = useState("")
  const [unit, setUnit] = useState<"metric" | "imperial">("metric")
  const [bmi, setBmi] = useState<number | null>(null)
  const [category, setCategory] = useState("")
  const [heightFeet, setHeightFeet] = useState("")
  const [heightInches, setHeightInches] = useState("")

  const calculateBMI = () => {
    let heightInMeters = 0
    let weightInKg = 0

    if (unit === "metric") {
      heightInMeters = Number.parseFloat(height) / 100 // cm to meters
      weightInKg = Number.parseFloat(weight)
    } else {
      // Imperial: convert to metric
      const totalInches = Number.parseFloat(heightFeet) * 12 + Number.parseFloat(heightInches)
      heightInMeters = totalInches * 0.0254 // inches to meters
      weightInKg = Number.parseFloat(weight) * 0.453592 // pounds to kg
    }

    if (heightInMeters > 0 && weightInKg > 0) {
      const bmiValue = weightInKg / (heightInMeters * heightInMeters)
      setBmi(Number.parseFloat(bmiValue.toFixed(1)))

      // Determine category
      if (bmiValue < 18.5) {
        setCategory("Underweight")
      } else if (bmiValue < 25) {
        setCategory("Normal weight")
      } else if (bmiValue < 30) {
        setCategory("Overweight")
      } else {
        setCategory("Obese")
      }
    }
  }

  const resetCalculator = () => {
    setHeight("")
    setWeight("")
    setHeightFeet("")
    setHeightInches("")
    setBmi(null)
    setCategory("")
  }

  const getBMIColor = () => {
    if (!bmi) return "bg-gray-500"
    if (bmi < 18.5) return "bg-blue-500"
    if (bmi < 25) return "bg-green-500"
    if (bmi < 30) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getBMIDescription = () => {
    if (!category) return ""

    const descriptions = {
      Underweight: "You may need to gain weight. Consult with a healthcare provider.",
      "Normal weight": "You have a healthy weight for your height.",
      Overweight: "You may benefit from weight loss. Consider diet and exercise.",
      Obese: "Weight loss is recommended. Consult with a healthcare provider.",
    }

    return descriptions[category as keyof typeof descriptions] || ""
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              <CardTitle>BMI Calculator</CardTitle>
            </div>
            <CardDescription>Calculate your Body Mass Index</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Tabs value={unit} onValueChange={(value) => setUnit(value as "metric" | "imperial")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="metric">Metric</TabsTrigger>
                  <TabsTrigger value="imperial">Imperial</TabsTrigger>
                </TabsList>

                <TabsContent value="metric" className="space-y-4">
                  <div>
                    <Label htmlFor="height-cm">Height (cm)</Label>
                    <Input
                      id="height-cm"
                      type="number"
                      placeholder="170"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight-kg">Weight (kg)</Label>
                    <Input
                      id="weight-kg"
                      type="number"
                      placeholder="70"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="imperial" className="space-y-4">
                  <div>
                    <Label>Height</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="5"
                        value={heightFeet}
                        onChange={(e) => setHeightFeet(e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="8"
                        value={heightInches}
                        onChange={(e) => setHeightInches(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-1">
                      <span>Feet</span>
                      <span>Inches</span>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="weight-lbs">Weight (lbs)</Label>
                    <Input
                      id="weight-lbs"
                      type="number"
                      placeholder="154"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-2">
                <Button onClick={calculateBMI} className="flex-1">
                  <Calculator className="mr-2 h-4 w-4" />
                  Calculate BMI
                </Button>
                <Button onClick={resetCalculator} variant="outline">
                  Reset
                </Button>
              </div>

              {bmi && (
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-center p-6 bg-muted rounded-lg">
                    <motion.div
                      className="text-4xl font-bold mb-2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    >
                      {bmi}
                    </motion.div>
                    <div
                      className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium ${getBMIColor()}`}
                    >
                      {category}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">BMI Categories:</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Underweight</span>
                        <span className="text-blue-600">Below 18.5</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Normal weight</span>
                        <span className="text-green-600">18.5 - 24.9</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Overweight</span>
                        <span className="text-yellow-600">25 - 29.9</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Obese</span>
                        <span className="text-red-600">30 and above</span>
                      </div>
                    </div>
                  </div>

                  <motion.div
                    className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <p className="text-sm text-blue-800 dark:text-blue-200">{getBMIDescription()}</p>
                  </motion.div>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
