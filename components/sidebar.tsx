"use client"

import Link from "next/link"
import { Home, TrendingUp, Music, Film, Gamepad2, Trophy, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const sidebarItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: TrendingUp, label: "Trending", href: "/trending" },
  { icon: Music, label: "Music", href: "/music" },
  { icon: Film, label: "Movies", href: "/movies" },
  { icon: Gamepad2, label: "Gaming", href: "/gaming" },
  { icon: Trophy, label: "Sports", href: "/sports" },
  { icon: Lightbulb, label: "Learning", href: "/learning" },
]

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-background">
      <nav className="flex-1 space-y-1 p-4">
        {sidebarItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant="ghost"
              className={cn("w-full justify-start", "hover:bg-accent hover:text-accent-foreground")}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>
    </aside>
  )
}
