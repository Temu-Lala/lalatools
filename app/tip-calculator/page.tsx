"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { DollarSign, Users, Calculator } from "lucide-react"

export default function TipCalculator() {
  const [bill, setBill] = useState("")
  const [tipPercentage, setTipPercentage] = useState([15])
  const [people, setPeople] = useState("1")
  const [tipAmount, setTipAmount] = useState(0)
  const [totalPerPerson, setTotalPerPerson] = useState(0)

  const calculateTip = () => {
    const billValue = Number.parseFloat(bill)
    const peopleValue = Number.parseInt(people)

    if (isNaN(billValue) || billValue <= 0 || isNaN(peopleValue) || peopleValue <= 0) {
      setTipAmount(0)
      setTotalPerPerson(0)
      return
    }

    const tipValue = billValue * (tipPercentage[0] / 100)
    const totalValue = billValue + tipValue

    setTipAmount(tipValue / peopleValue)
    setTotalPerPerson(totalValue / peopleValue)
  }

  useEffect(() => {
    calculateTip()
  }, [bill, tipPercentage, people])

  const handleQuickTip = (percentage: number) => {
    setTipPercentage([percentage])
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calculator className="h-6 w-6 text-primary" />
              <CardTitle>Tip Calculator</CardTitle>
            </div>
            <CardDescription>Calculate tips and split bills among people</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label htmlFor="bill" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Bill Amount
                </Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="bill"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={bill}
                    onChange={(e) => setBill(e.target.value)}
                    className="pl-7"
                  />
                </div>
              </div>

              <div>
                <Label className="flex items-center justify-between">
                  <span>Tip Percentage</span>
                  <span className="font-mono">{tipPercentage[0]}%</span>
                </Label>
                <Slider
                  value={tipPercentage}
                  onValueChange={setTipPercentage}
                  min={0}
                  max={30}
                  step={1}
                  className="mt-2"
                />
                <div className="flex justify-between gap-2 mt-2">
                  {[10, 15, 18, 20, 25].map((percentage) => (
                    <Button
                      key={percentage}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickTip(percentage)}
                      className={tipPercentage[0] === percentage ? "border-primary" : ""}
                    >
                      {percentage}%
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="people" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Number of People
                </Label>
                <Input
                  id="people"
                  type="number"
                  min="1"
                  step="1"
                  value={people}
                  onChange={(e) => setPeople(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Tip Amount / Person</span>
                  <span className="font-mono font-semibold">{formatCurrency(tipAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-lg font-medium">Total / Person</span>
                  <span className="text-lg font-mono font-bold">{formatCurrency(totalPerPerson)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
