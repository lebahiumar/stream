import { Suspense } from "react"
import { VideoGrid } from "@/components/video-grid"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Suspense fallback={<div>Loading videos...</div>}>
            <VideoGrid />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
