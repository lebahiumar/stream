import { Header } from "@/components/header"
import { VideoUpload } from "@/components/video-upload"

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Upload Video</h1>
          <VideoUpload />
        </div>
      </div>
    </div>
  )
}
