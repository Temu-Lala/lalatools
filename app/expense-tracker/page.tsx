"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, Plus, Trash2, DollarSign, PieChart } from "lucide-react"

interface Transaction {
  id: string
  type: "income" | "expense"
  amount: number
  category: string
  description: string
  date: string
}

const expenseCategories = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Education",
  "Travel",
  "Other",
]

const incomeCategories = ["Salary", "Freelance", "Business", "Investments", "Gifts", "Other"]

export default function ExpenseTracker() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<"income" | "expense">("expense")

  useEffect(() => {
    const savedTransactions = localStorage.getItem("transactions")
    if (savedTransactions) {
      try {
        setTransactions(JSON.parse(savedTransactions))
      } catch (e) {
        console.error("Failed to parse transactions from localStorage")
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions))
  }, [transactions])

  const addTransaction = () => {
    if (!amount || !category || !description) return

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type,
      amount: Number.parseFloat(amount),
      category,
      description,
      date: new Date().toISOString().split("T")[0],
    }

    setTransactions([newTransaction, ...transactions])
    setAmount("")
    setCategory("")
    setDescription("")
  }

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id))
  }

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpenses

  const getCategoryTotals = (transactionType: "income" | "expense") => {
    const filtered = transactions.filter((t) => t.type === transactionType)
    const categoryTotals: { [key: string]: number } = {}

    filtered.forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount
    })

    return Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <CardTitle>Expense Tracker</CardTitle>
            </div>
            <CardDescription>Track your income and expenses</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <motion.div
                className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800 dark:text-green-200">Income</span>
                </div>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
              </motion.div>

              <motion.div
                className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-800 dark:text-red-200">Expenses</span>
                </div>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
              </motion.div>

              <motion.div
                className={`p-4 rounded-lg border ${
                  balance >= 0
                    ? "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
                    : "bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800"
                }`}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className={`h-5 w-5 ${balance >= 0 ? "text-blue-600" : "text-orange-600"}`} />
                  <span
                    className={`font-medium ${
                      balance >= 0 ? "text-blue-800 dark:text-blue-200" : "text-orange-800 dark:text-orange-200"
                    }`}
                  >
                    Balance
                  </span>
                </div>
                <div className={`text-2xl font-bold ${balance >= 0 ? "text-blue-600" : "text-orange-600"}`}>
                  {formatCurrency(balance)}
                </div>
              </motion.div>
            </div>

            <Tabs defaultValue="add" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="add">Add Transaction</TabsTrigger>
                <TabsTrigger value="history">Transaction History</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="add" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <Label>Transaction Type</Label>
                      <Select value={type} onValueChange={(value: "income" | "expense") => setType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income">Income</SelectItem>
                          <SelectItem value="expense">Expense</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Category</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {(type === "expense" ? expenseCategories : incomeCategories).map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        placeholder="Transaction description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={addTransaction} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Transaction
                </Button>
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  <AnimatePresence>
                    {transactions.map((transaction) => (
                      <motion.div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        layout
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {transaction.type === "income" ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                            <span className="font-medium">{transaction.description}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {transaction.category} • {transaction.date}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                          >
                            {transaction.type === "income" ? "+" : "-"}
                            {formatCurrency(transaction.amount)}
                          </span>
                          <Button variant="ghost" size="icon" onClick={() => deleteTransaction(transaction.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {transactions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No transactions yet. Add your first transaction!
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <PieChart className="h-4 w-4" />
                      Top Expense Categories
                    </h3>
                    <div className="space-y-2">
                      {getCategoryTotals("expense").map(([category, amount]) => (
                        <div key={category} className="flex justify-between items-center p-2 bg-muted rounded">
                          <span className="text-sm">{category}</span>
                          <span className="font-medium text-red-600">{formatCurrency(amount)}</span>
                        </div>
                      ))}
                      {getCategoryTotals("expense").length === 0 && (
                        <p className="text-muted-foreground text-sm">No expense data available</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <PieChart className="h-4 w-4" />
                      Top Income Sources
                    </h3>
                    <div className="space-y-2">
                      {getCategoryTotals("income").map(([category, amount]) => (
                        <div key={category} className="flex justify-between items-center p-2 bg-muted rounded">
                          <span className="text-sm">{category}</span>
                          <span className="font-medium text-green-600">{formatCurrency(amount)}</span>
                        </div>
                      ))}
                      {getCategoryTotals("income").length === 0 && (
                        <p className="text-muted-foreground text-sm">No income data available</p>
                      )}
                    </div>
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
