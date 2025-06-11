"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ArrowLeftRight, ArrowRightLeft } from "lucide-react"

interface ConversionOption {
  label: string
  value: string
  factor: number
}

interface ConversionCategory {
  name: string
  from: ConversionOption[]
  to: ConversionOption[]
  convert: (value: number, from: string, to: string) => number
}

export default function UnitConverter() {
  const [category, setCategory] = useState("length")
  const [fromValue, setFromValue] = useState("1")
  const [fromUnit, setFromUnit] = useState("")
  const [toUnit, setToUnit] = useState("")
  const [result, setResult] = useState("")

  const categories: Record<string, ConversionCategory> = {
    length: {
      name: "Length",
      from: [
        { label: "Millimeters (mm)", value: "mm", factor: 0.001 },
        { label: "Centimeters (cm)", value: "cm", factor: 0.01 },
        { label: "Meters (m)", value: "m", factor: 1 },
        { label: "Kilometers (km)", value: "km", factor: 1000 },
        { label: "Inches (in)", value: "in", factor: 0.0254 },
        { label: "Feet (ft)", value: "ft", factor: 0.3048 },
        { label: "Yards (yd)", value: "yd", factor: 0.9144 },
        { label: "Miles (mi)", value: "mi", factor: 1609.34 },
      ],
      to: [
        { label: "Millimeters (mm)", value: "mm", factor: 0.001 },
        { label: "Centimeters (cm)", value: "cm", factor: 0.01 },
        { label: "Meters (m)", value: "m", factor: 1 },
        { label: "Kilometers (km)", value: "km", factor: 1000 },
        { label: "Inches (in)", value: "in", factor: 0.0254 },
        { label: "Feet (ft)", value: "ft", factor: 0.3048 },
        { label: "Yards (yd)", value: "yd", factor: 0.9144 },
        { label: "Miles (mi)", value: "mi", factor: 1609.34 },
      ],
      convert: (value, from, to) => {
        const fromOption = categories.length.from.find((option) => option.value === from)
        const toOption = categories.length.to.find((option) => option.value === to)

        if (!fromOption || !toOption) return 0

        // Convert to base unit (meters) then to target unit
        return (value * fromOption.factor) / toOption.factor
      },
    },
    weight: {
      name: "Weight",
      from: [
        { label: "Milligrams (mg)", value: "mg", factor: 0.001 },
        { label: "Grams (g)", value: "g", factor: 1 },
        { label: "Kilograms (kg)", value: "kg", factor: 1000 },
        { label: "Ounces (oz)", value: "oz", factor: 28.3495 },
        { label: "Pounds (lb)", value: "lb", factor: 453.592 },
        { label: "Stone (st)", value: "st", factor: 6350.29 },
        { label: "Tons (t)", value: "t", factor: 1000000 },
      ],
      to: [
        { label: "Milligrams (mg)", value: "mg", factor: 0.001 },
        { label: "Grams (g)", value: "g", factor: 1 },
        { label: "Kilograms (kg)", value: "kg", factor: 1000 },
        { label: "Ounces (oz)", value: "oz", factor: 28.3495 },
        { label: "Pounds (lb)", value: "lb", factor: 453.592 },
        { label: "Stone (st)", value: "st", factor: 6350.29 },
        { label: "Tons (t)", value: "t", factor: 1000000 },
      ],
      convert: (value, from, to) => {
        const fromOption = categories.weight.from.find((option) => option.value === from)
        const toOption = categories.weight.to.find((option) => option.value === to)

        if (!fromOption || !toOption) return 0

        // Convert to base unit (grams) then to target unit
        return (value * fromOption.factor) / toOption.factor
      },
    },
    temperature: {
      name: "Temperature",
      from: [
        { label: "Celsius (°C)", value: "c", factor: 1 },
        { label: "Fahrenheit (°F)", value: "f", factor: 1 },
        { label: "Kelvin (K)", value: "k", factor: 1 },
      ],
      to: [
        { label: "Celsius (°C)", value: "c", factor: 1 },
        { label: "Fahrenheit (°F)", value: "f", factor: 1 },
        { label: "Kelvin (K)", value: "k", factor: 1 },
      ],
      convert: (value, from, to) => {
        // Special case for temperature
        if (from === to) return value

        let celsius = 0

        // Convert to Celsius first
        if (from === "c") {
          celsius = value
        } else if (from === "f") {
          celsius = (value - 32) * (5 / 9)
        } else if (from === "k") {
          celsius = value - 273.15
        }

        // Convert from Celsius to target
        if (to === "c") {
          return celsius
        } else if (to === "f") {
          return celsius * (9 / 5) + 32
        } else if (to === "k") {
          return celsius + 273.15
        }

        return 0
      },
    },
    volume: {
      name: "Volume",
      from: [
        { label: "Milliliters (ml)", value: "ml", factor: 0.001 },
        { label: "Liters (l)", value: "l", factor: 1 },
        { label: "Cubic meters (m³)", value: "m3", factor: 1000 },
        { label: "Fluid ounces (fl oz)", value: "floz", factor: 0.0295735 },
        { label: "Cups", value: "cup", factor: 0.236588 },
        { label: "Pints (pt)", value: "pt", factor: 0.473176 },
        { label: "Gallons (gal)", value: "gal", factor: 3.78541 },
      ],
      to: [
        { label: "Milliliters (ml)", value: "ml", factor: 0.001 },
        { label: "Liters (l)", value: "l", factor: 1 },
        { label: "Cubic meters (m³)", value: "m3", factor: 1000 },
        { label: "Fluid ounces (fl oz)", value: "floz", factor: 0.0295735 },
        { label: "Cups", value: "cup", factor: 0.236588 },
        { label: "Pints (pt)", value: "pt", factor: 0.473176 },
        { label: "Gallons (gal)", value: "gal", factor: 3.78541 },
      ],
      convert: (value, from, to) => {
        const fromOption = categories.volume.from.find((option) => option.value === from)
        const toOption = categories.volume.to.find((option) => option.value === to)

        if (!fromOption || !toOption) return 0

        // Convert to base unit (liters) then to target unit
        return (value * fromOption.factor) / toOption.factor
      },
    },
  }

  const handleConvert = () => {
    if (!fromUnit || !toUnit || !fromValue) {
      setResult("")
      return
    }

    const value = Number.parseFloat(fromValue)
    if (isNaN(value)) {
      setResult("Invalid input")
      return
    }

    const currentCategory = categories[category]
    const convertedValue = currentCategory.convert(value, fromUnit, toUnit)

    // Format the result based on the magnitude
    let formattedResult = ""
    if (Math.abs(convertedValue) < 0.000001 || Math.abs(convertedValue) >= 1000000) {
      formattedResult = convertedValue.toExponential(6)
    } else {
      formattedResult = convertedValue.toLocaleString(undefined, {
        maximumFractionDigits: 6,
      })
    }

    setResult(formattedResult)
  }

  const handleSwap = () => {
    const temp = fromUnit
    setFromUnit(toUnit)
    setToUnit(temp)
    handleConvert()
  }

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory)
    setFromUnit("")
    setToUnit("")
    setResult("")
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="h-6 w-6 text-primary" />
              <CardTitle>Unit Converter</CardTitle>
            </div>
            <CardDescription>Convert between different measurement units</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={category} onValueChange={handleCategoryChange} className="mb-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="length">Length</TabsTrigger>
                <TabsTrigger value="weight">Weight</TabsTrigger>
                <TabsTrigger value="temperature">Temp</TabsTrigger>
                <TabsTrigger value="volume">Volume</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-4">
              <div>
                <Label htmlFor="from-value">Value</Label>
                <Input
                  id="from-value"
                  type="number"
                  value={fromValue}
                  onChange={(e) => setFromValue(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-end">
                <div>
                  <Label htmlFor="from-unit">From</Label>
                  <Select value={fromUnit} onValueChange={setFromUnit}>
                    <SelectTrigger id="from-unit">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories[category].from.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="ghost" size="icon" onClick={handleSwap} className="mb-0.5">
                  <ArrowRightLeft className="h-4 w-4" />
                </Button>

                <div>
                  <Label htmlFor="to-unit">To</Label>
                  <Select value={toUnit} onValueChange={setToUnit}>
                    <SelectTrigger id="to-unit">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories[category].to.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleConvert} className="w-full">
                Convert
              </Button>

              {result && (
                <div className="mt-4 p-4 bg-muted rounded-md">
                  <div className="text-sm text-muted-foreground">Result:</div>
                  <div className="text-2xl font-semibold font-mono">{result}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
