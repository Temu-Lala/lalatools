"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Home } from "lucide-react"

export function Navbar() {
  const pathname = usePathname()
  const isHome = pathname === "/"

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center px-4">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="inline-block font-bold text-xl">LALA ToolKit</span>
          </Link>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          {!isHome && (
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <Home className="h-5 w-5" />
                <span className="sr-only">Home</span>
              </Link>
            </Button>
          )}
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
