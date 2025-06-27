'use client'

import Link from 'next/link'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import React, { FormEvent, useState, Suspense } from 'react'
import { Home, Search, UploadCloud, User, Bell, PlaySquare } from 'lucide-react'
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset } from "@/components/ui/sidebar"
import { Logo } from '@/components/logo'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CategorySidebarMenu } from '@/components/category-sidebar-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [videoId, setVideoId] = useState('')

  const menuItems = [
    { href: '/', label: 'Home', icon: Home },
  ]
  
  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  }

  const handlePlayById = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(videoId.trim()) {
      router.push(`/watch/${videoId.trim()}`);
      setDialogOpen(false);
      setVideoId('');
    }
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.label}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Categories</SidebarGroupLabel>
            <CategorySidebarMenu />
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/upload'} tooltip="Upload Video">
                <Link href="/upload">
                  <UploadCloud />
                  <span>Upload Video</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
               <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <SidebarMenuButton tooltip="Watch by ID">
                    <PlaySquare />
                    <span>Watch by ID</span>
                  </SidebarMenuButton>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Watch by ID</DialogTitle>
                    <DialogDescription>
                      Enter a Mux Asset ID or Playback ID to watch a video directly.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handlePlayById}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="videoId" className="text-right">
                          Video ID
                        </Label>
                        <Input
                          id="videoId"
                          value={videoId}
                          onChange={(e) => setVideoId(e.target.value)}
                          className="col-span-3"
                          placeholder="Asset or Playback ID"
                          autoComplete="off"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={!videoId.trim()}>Play Video</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background/80 px-2 sm:px-4 md:px-6 backdrop-blur-sm">
          <div className="flex-1 min-w-0">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input name="search" defaultValue={searchParams.get('q') ?? ''} placeholder="Search for videos..." className="w-full rounded-full bg-muted pl-10 text-sm md:w-[300px] lg:w-[400px]" />
              </div>
            </form>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            <Avatar>
              <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="man" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="flex-1 p-2 sm:p-4 md:p-6 lg:p-8 w-full max-w-full">
          <Suspense>
            {children}
          </Suspense>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
