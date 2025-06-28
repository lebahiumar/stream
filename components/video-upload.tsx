"use client"

import type React from "react"

import { useState } from "react"
import { Upload, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function VideoUpload() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [error, setError] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError("")
    }
  }

  const handleUpload = async () => {
    if (!file || !title.trim()) {
      setError("Please select a file and enter a title")
      return
    }

    setUploading(true)
    setError("")
    setUploadProgress(0)

    try {
      // Get upload URL from Mux
      const uploadResponse = await fetch("/api/upload-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
        }),
      })

      if (!uploadResponse.ok) {
        throw new Error("Failed to get upload URL")
      }

      const uploadData = await uploadResponse.json()
      const uploadUrl = uploadData.data.url

      // Upload file to Mux
      const formData = new FormData()
      formData.append("file", file)

      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100
          setUploadProgress(progress)
        }
      })

      xhr.addEventListener("load", () => {
        if (xhr.status === 200 || xhr.status === 201) {
          setUploadComplete(true)
          setUploading(false)
        } else {
          setError("Upload failed")
          setUploading(false)
        }
      })

      xhr.addEventListener("error", () => {
        setError("Upload failed")
        setUploading(false)
      })

      xhr.open("PUT", uploadUrl)
      xhr.send(file)
    } catch (error) {
      console.error("Upload error:", error)
      setError("Upload failed. Please try again.")
      setUploading(false)
    }
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setFile(null)
    setUploadComplete(false)
    setUploadProgress(0)
    setError("")
  }

  if (uploadComplete) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h3 className="text-xl font-semibold">Upload Complete!</h3>
            <p className="text-muted-foreground">
              Your video has been uploaded successfully. It may take a few minutes to process.
            </p>
            <Button onClick={resetForm}>Upload Another Video</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Your Video</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter video title"
            disabled={uploading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter video description"
            rows={4}
            disabled={uploading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="video">Video File *</Label>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <input
              id="video"
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
            <label htmlFor="video" className="cursor-pointer flex flex-col items-center space-y-2">
              <Upload className="w-12 h-12 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{file ? file.name : "Click to upload video"}</p>
                <p className="text-xs text-muted-foreground">MP4, WebM, AVI up to 1GB</p>
              </div>
            </label>
          </div>
        </div>

        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}

        {error && (
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <Button onClick={handleUpload} disabled={!file || !title.trim() || uploading} className="w-full">
          {uploading ? "Uploading..." : "Upload Video"}
        </Button>
      </CardContent>
    </Card>
  )
}
