"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, Upload, Menu, Youtube } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Header() {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
          <Link href="/" className="flex items-center space-x-2">
            <Youtube className="h-8 w-8 text-red-600" />
            <span className="text-xl font-bold">YouTube</span>
          </Link>
        </div>

        <div className="flex-1 max-w-2xl mx-auto px-4">
          <form onSubmit={handleSearch} className="flex">
            <Input
              type="search"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-r-none border-r-0 focus-visible:ring-0"
            />
            <Button type="submit" variant="outline" className="rounded-l-none px-6 bg-transparent">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>

        <div className="flex items-center space-x-2">
          <Link href="/upload">
            <Button variant="ghost" size="icon">
              <Upload className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
