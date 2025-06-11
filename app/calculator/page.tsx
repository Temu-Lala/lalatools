"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalculatorIcon } from "lucide-react"

export default function Calculator() {
  const [display, setDisplay] = useState("0")
  const [firstOperand, setFirstOperand] = useState<number | null>(null)
  const [operator, setOperator] = useState<string | null>(null)
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false)

  const inputDigit = (digit: string) => {
    if (waitingForSecondOperand) {
      setDisplay(digit)
      setWaitingForSecondOperand(false)
    } else {
      setDisplay(display === "0" ? digit : display + digit)
    }
  }

  const inputDecimal = () => {
    if (waitingForSecondOperand) {
      setDisplay("0.")
      setWaitingForSecondOperand(false)
      return
    }

    if (!display.includes(".")) {
      setDisplay(display + ".")
    }
  }

  const clearDisplay = () => {
    setDisplay("0")
    setFirstOperand(null)
    setOperator(null)
    setWaitingForSecondOperand(false)
  }

  const handleOperator = (nextOperator: string) => {
    const inputValue = Number.parseFloat(display)

    if (firstOperand === null) {
      setFirstOperand(inputValue)
    } else if (operator) {
      const result = performCalculation()
      setDisplay(String(result))
      setFirstOperand(result)
    }

    setWaitingForSecondOperand(true)
    setOperator(nextOperator)
  }

  const performCalculation = () => {
    const inputValue = Number.parseFloat(display)

    if (operator === "+") {
      return firstOperand! + inputValue
    } else if (operator === "-") {
      return firstOperand! - inputValue
    } else if (operator === "*") {
      return firstOperand! * inputValue
    } else if (operator === "/") {
      return firstOperand! / inputValue
    }

    return inputValue
  }

  const handleEquals = () => {
    if (!operator || firstOperand === null) return

    const result = performCalculation()
    setDisplay(String(result))
    setFirstOperand(result)
    setOperator(null)
    setWaitingForSecondOperand(true)
  }

  const handleBackspace = () => {
    if (display.length === 1 || (display.length === 2 && display.startsWith("-"))) {
      setDisplay("0")
    } else {
      setDisplay(display.slice(0, -1))
    }
  }

  const handlePlusMinus = () => {
    setDisplay(display.startsWith("-") ? display.slice(1) : "-" + display)
  }

  const handlePercent = () => {
    const value = Number.parseFloat(display)
    setDisplay(String(value / 100))
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CalculatorIcon className="h-6 w-6 text-primary" />
              <CardTitle>Calculator</CardTitle>
            </div>
            <CardDescription>Perform basic arithmetic operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-md mb-4 text-right">
              <div className="text-3xl font-mono tabular-nums overflow-x-auto whitespace-nowrap">{display}</div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <Button variant="outline" onClick={() => clearDisplay()}>
                C
              </Button>
              <Button variant="outline" onClick={() => handleBackspace()}>
                ⌫
              </Button>
              <Button variant="outline" onClick={() => handlePercent()}>
                %
              </Button>
              <Button variant="secondary" onClick={() => handleOperator("/")}>
                ÷
              </Button>

              <Button variant="outline" onClick={() => inputDigit("7")}>
                7
              </Button>
              <Button variant="outline" onClick={() => inputDigit("8")}>
                8
              </Button>
              <Button variant="outline" onClick={() => inputDigit("9")}>
                9
              </Button>
              <Button variant="secondary" onClick={() => handleOperator("*")}>
                ×
              </Button>

              <Button variant="outline" onClick={() => inputDigit("4")}>
                4
              </Button>
              <Button variant="outline" onClick={() => inputDigit("5")}>
                5
              </Button>
              <Button variant="outline" onClick={() => inputDigit("6")}>
                6
              </Button>
              <Button variant="secondary" onClick={() => handleOperator("-")}>
                −
              </Button>

              <Button variant="outline" onClick={() => inputDigit("1")}>
                1
              </Button>
              <Button variant="outline" onClick={() => inputDigit("2")}>
                2
              </Button>
              <Button variant="outline" onClick={() => inputDigit("3")}>
                3
              </Button>
              <Button variant="secondary" onClick={() => handleOperator("+")}>
                +
              </Button>

              <Button variant="outline" onClick={() => handlePlusMinus()}>
                ±
              </Button>
              <Button variant="outline" onClick={() => inputDigit("0")}>
                0
              </Button>
              <Button variant="outline" onClick={() => inputDecimal()}>
                .
              </Button>
              <Button variant="primary" onClick={() => handleEquals()}>
                =
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
