"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Plus, Trash2, Download, Copy, Upload, RotateCcw } from "lucide-react"

interface ChartData {
  name: string
  value: number
  color: string
}

const colorThemes = {
  default: ["#8884d8", "#82ca9d", "#ffc658", "#ff7c7c", "#8dd1e1", "#d084d0"],
  business: ["#2563eb", "#dc2626", "#059669", "#d97706", "#7c3aed", "#db2777"],
  pastel: ["#fecaca", "#fed7d7", "#fde68a", "#d9f99d", "#bfdbfe", "#ddd6fe"],
  vibrant: ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7"],
  monochrome: ["#1f2937", "#374151", "#6b7280", "#9ca3af", "#d1d5db", "#f3f4f6"],
  sunset: ["#fbbf24", "#f59e0b", "#d97706", "#b45309", "#92400e", "#78350f"],
}

const sampleDataSets = {
  marketShare: [
    { name: "Company A", value: 35, color: "#8884d8" },
    { name: "Company B", value: 25, color: "#82ca9d" },
    { name: "Company C", value: 20, color: "#ffc658" },
    { name: "Company D", value: 15, color: "#ff7c7c" },
    { name: "Others", value: 5, color: "#8dd1e1" },
  ],
  budget: [
    { name: "Marketing", value: 30, color: "#8884d8" },
    { name: "Development", value: 25, color: "#82ca9d" },
    { name: "Operations", value: 20, color: "#ffc658" },
    { name: "Sales", value: 15, color: "#ff7c7c" },
    { name: "Support", value: 10, color: "#8dd1e1" },
  ],
  survey: [
    { name: "Very Satisfied", value: 40, color: "#22c55e" },
    { name: "Satisfied", value: 35, color: "#82ca9d" },
    { name: "Neutral", value: 15, color: "#ffc658" },
    { name: "Dissatisfied", value: 7, color: "#f97316" },
    { name: "Very Dissatisfied", value: 3, color: "#ef4444" },
  ],
  demographics: [
    { name: "18-25", value: 22, color: "#8884d8" },
    { name: "26-35", value: 28, color: "#82ca9d" },
    { name: "36-45", value: 25, color: "#ffc658" },
    { name: "46-55", value: 15, color: "#ff7c7c" },
    { name: "55+", value: 10, color: "#8dd1e1" },
  ],
}

export default function PieChartGenerator() {
  const [data, setData] = useState<ChartData[]>([
    { name: "Category A", value: 30, color: "#8884d8" },
    { name: "Category B", value: 25, color: "#82ca9d" },
    { name: "Category C", value: 20, color: "#ffc658" },
    { name: "Category D", value: 15, color: "#ff7c7c" },
    { name: "Category E", value: 10, color: "#8dd1e1" },
  ])

  const [newCategory, setNewCategory] = useState("")
  const [newValue, setNewValue] = useState("")
  const [selectedTheme, setSelectedTheme] = useState("default")
  const [csvInput, setCsvInput] = useState("")
  const [chartTitle, setChartTitle] = useState("My Pie Chart")

  const [chartSettings, setChartSettings] = useState({
    showLegend: true,
    showLabels: true,
    showValues: true,
    showPercentages: true,
    innerRadius: 0,
    outerRadius: 80,
    startAngle: 0,
    endAngle: 360,
  })

  const addCategory = () => {
    if (!newCategory.trim() || !newValue || isNaN(Number(newValue))) return

    const theme = colorThemes[selectedTheme as keyof typeof colorThemes]
    const colorIndex = data.length % theme.length

    const newItem: ChartData = {
      name: newCategory.trim(),
      value: Number(newValue),
      color: theme[colorIndex],
    }

    setData([...data, newItem])
    setNewCategory("")
    setNewValue("")
  }

  const removeCategory = (index: number) => {
    setData(data.filter((_, i) => i !== index))
  }

  const updateCategory = (index: number, field: keyof ChartData, value: string | number) => {
    const updatedData = [...data]
    if (field === "value") {
      updatedData[index][field] = Number(value)
    } else {
      updatedData[index][field] = value as string
    }
    setData(updatedData)
  }

  const applyTheme = (theme: string) => {
    setSelectedTheme(theme)
    const colors = colorThemes[theme as keyof typeof colorThemes]
    const updatedData = data.map((item, index) => ({
      ...item,
      color: colors[index % colors.length],
    }))
    setData(updatedData)
  }

  const loadSampleData = (sampleKey: string) => {
    const sampleData = sampleDataSets[sampleKey as keyof typeof sampleDataSets]
    setData([...sampleData])
  }

  const parseCsvData = () => {
    if (!csvInput.trim()) return

    try {
      const lines = csvInput.trim().split("\n")
      const theme = colorThemes[selectedTheme as keyof typeof colorThemes]
      const newData: ChartData[] = []

      lines.forEach((line, index) => {
        const [name, value] = line.split(",").map((item) => item.trim())
        if (name && value && !isNaN(Number(value))) {
          newData.push({
            name,
            value: Number(value),
            color: theme[index % theme.length],
          })
        }
      })

      if (newData.length > 0) {
        setData(newData)
        setCsvInput("")
      }
    } catch (error) {
      console.error("Error parsing CSV data:", error)
    }
  }

  const exportData = () => {
    const csvContent = data.map((item) => `${item.name},${item.value}`).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${chartTitle.replace(/\s+/g, "_")}_data.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const copyConfiguration = () => {
    const config = {
      title: chartTitle,
      data,
      settings: chartSettings,
      theme: selectedTheme,
    }
    navigator.clipboard.writeText(JSON.stringify(config, null, 2))
  }

  const clearData = () => {
    setData([])
    setChartTitle("My Pie Chart")
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">
            Value: <span className="font-semibold">{data.value}</span>
          </p>
          <p className="text-sm">
            Percentage: <span className="font-semibold">{percentage}%</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChart className="h-6 w-6 text-primary" />
              <CardTitle>Pie Chart Generator</CardTitle>
            </div>
            <CardDescription>Create professional pie charts for presentations and reports</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="create" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="create">Create Chart</TabsTrigger>
                <TabsTrigger value="customize">Customize</TabsTrigger>
                <TabsTrigger value="import">Import Data</TabsTrigger>
                <TabsTrigger value="export">Export</TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Data Entry */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="chart-title">Chart Title</Label>
                      <Input
                        id="chart-title"
                        value={chartTitle}
                        onChange={(e) => setChartTitle(e.target.value)}
                        placeholder="Enter chart title"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="category">Category Name</Label>
                        <Input
                          id="category"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          placeholder="Category name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="value">Value</Label>
                        <Input
                          id="value"
                          type="number"
                          value={newValue}
                          onChange={(e) => setNewValue(e.target.value)}
                          placeholder="Value"
                        />
                      </div>
                    </div>

                    <Button onClick={addCategory} className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Category
                    </Button>

                    {/* Data List */}
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      <AnimatePresence>
                        {data.map((item, index) => (
                          <motion.div
                            key={index}
                            className="flex items-center gap-2 p-2 border rounded"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            layout
                          >
                            <input
                              type="color"
                              value={item.color}
                              onChange={(e) => updateCategory(index, "color", e.target.value)}
                              className="w-8 h-8 rounded border cursor-pointer"
                            />
                            <Input
                              value={item.name}
                              onChange={(e) => updateCategory(index, "name", e.target.value)}
                              className="flex-1"
                            />
                            <Input
                              type="number"
                              value={item.value}
                              onChange={(e) => updateCategory(index, "value", e.target.value)}
                              className="w-20"
                            />
                            <Button variant="ghost" size="icon" onClick={() => removeCategory(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => loadSampleData("marketShare")}>
                        Market Share
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => loadSampleData("budget")}>
                        Budget
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => loadSampleData("survey")}>
                        Survey
                      </Button>
                      <Button variant="outline" size="sm" onClick={clearData}>
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Chart Display */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-xl font-semibold mb-2">{chartTitle}</h3>
                      <div className="h-80 w-full">
                        {data.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={chartSettings.innerRadius}
                                outerRadius={chartSettings.outerRadius}
                                startAngle={chartSettings.startAngle}
                                endAngle={chartSettings.endAngle}
                                paddingAngle={2}
                                dataKey="value"
                                animationBegin={0}
                                animationDuration={800}
                              >
                                {data.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip content={<CustomTooltip />} />
                              {chartSettings.showLegend && <Legend />}
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground">
                            <div className="text-center">
                              <PieChart className="h-16 w-16 mx-auto mb-2 opacity-20" />
                              <p>Add data to see your chart</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Data Summary */}
                    {data.length > 0 && (
                      <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Data Summary</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Total Categories:</span>
                            <span className="font-medium">{data.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Value:</span>
                            <span className="font-medium">{total.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Largest Category:</span>
                            <span className="font-medium">
                              {data.reduce((max, item) => (item.value > max.value ? item : max)).name}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="customize" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Color Theme</Label>
                      <Select value={selectedTheme} onValueChange={applyTheme}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="pastel">Pastel</SelectItem>
                          <SelectItem value="vibrant">Vibrant</SelectItem>
                          <SelectItem value="monochrome">Monochrome</SelectItem>
                          <SelectItem value="sunset">Sunset</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Inner Radius: {chartSettings.innerRadius}</Label>
                        <input
                          type="range"
                          min="0"
                          max="60"
                          value={chartSettings.innerRadius}
                          onChange={(e) => setChartSettings({ ...chartSettings, innerRadius: Number(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <Label>Outer Radius: {chartSettings.outerRadius}</Label>
                        <input
                          type="range"
                          min="40"
                          max="120"
                          value={chartSettings.outerRadius}
                          onChange={(e) => setChartSettings({ ...chartSettings, outerRadius: Number(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Start Angle: {chartSettings.startAngle}°</Label>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={chartSettings.startAngle}
                          onChange={(e) => setChartSettings({ ...chartSettings, startAngle: Number(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <Label>End Angle: {chartSettings.endAngle}°</Label>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={chartSettings.endAngle}
                          onChange={(e) => setChartSettings({ ...chartSettings, endAngle: Number(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Display Options</h4>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={chartSettings.showLegend}
                          onChange={(e) => setChartSettings({ ...chartSettings, showLegend: e.target.checked })}
                        />
                        <span>Show Legend</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={chartSettings.showLabels}
                          onChange={(e) => setChartSettings({ ...chartSettings, showLabels: e.target.checked })}
                        />
                        <span>Show Labels</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={chartSettings.showValues}
                          onChange={(e) => setChartSettings({ ...chartSettings, showValues: e.target.checked })}
                        />
                        <span>Show Values</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={chartSettings.showPercentages}
                          onChange={(e) => setChartSettings({ ...chartSettings, showPercentages: e.target.checked })}
                        />
                        <span>Show Percentages</span>
                      </label>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="import" className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="csv-input">CSV Data (Name, Value format)</Label>
                    <Textarea
                      id="csv-input"
                      value={csvInput}
                      onChange={(e) => setCsvInput(e.target.value)}
                      placeholder="Category A, 30&#10;Category B, 25&#10;Category C, 20"
                      rows={6}
                    />
                  </div>
                  <Button onClick={parseCsvData} className="w-full">
                    <Upload className="mr-2 h-4 w-4" />
                    Import CSV Data
                  </Button>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Sample Data Sets</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Button variant="outline" size="sm" onClick={() => loadSampleData("marketShare")}>
                      Market Share
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => loadSampleData("budget")}>
                      Budget Allocation
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => loadSampleData("survey")}>
                      Survey Results
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => loadSampleData("demographics")}>
                      Demographics
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="export" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Button onClick={exportData} className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download Data as CSV
                    </Button>
                    <Button onClick={copyConfiguration} variant="outline" className="w-full">
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Chart Configuration
                    </Button>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Export Options</h4>
                    <p className="text-sm text-muted-foreground">
                      Download your chart data as CSV or copy the complete configuration to recreate the chart later.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
