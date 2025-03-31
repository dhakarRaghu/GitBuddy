// components/upload-audio.tsx
"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Upload, Copy, Check, Music } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { uploadAudio, createMeeting } from "@/lib/uploadToVercel" // Updated import
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

type UploadAudioProps = {
  projectId: string
}

export default function UploadAudio({ projectId }: UploadAudioProps) {
  const router = useRouter()
  const inputFileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState<boolean>(false)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState<boolean>(false)
  const [isDragging, setIsDragging] = useState<boolean>(false)

  const MAX_FILE_SIZE = 4 * 1024 * 1024
  const ALLOWED_FORMATS = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-m4a", "audio/m4a"]

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds 50MB limit.")
      return
    }
    if (!ALLOWED_FORMATS.includes(selectedFile.type)) {
      toast.error("Only audio files (MP3, WAV, M4A) are allowed.")
      return
    }
    setFile(selectedFile)
    setUploadedUrl(null)
    setCopied(false)
  }

  const simulateProgress = () => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 10
      if (progress > 95) {
        clearInterval(interval)
        progress = 95
      }
      setUploadProgress(Math.min(progress, 95))
    }, 300)
    return interval
  }

  const handleUpload = async () => {
    if (!file) return
    try {
      setUploading(true)
      setUploadProgress(0)

      const progressInterval = simulateProgress()

      const url = await uploadAudio(file)

      // Log the projectId to debug
      console.log("Project ID before creating meeting:", projectId)

      // Ensure projectId is a string
      if (typeof projectId !== "string") {
        throw new Error("projectId must be a string")
      }

      const meeting = await createMeeting(url, projectId , file.name)

      clearInterval(progressInterval)
      setUploadProgress(100)

      setUploadedUrl(url)
      toast.success("Audio uploaded and meeting created successfully!")

      // router.push(`/meetings/${meeting.id}`)
      router.push(`/project/${projectId}/meetings/${meeting.id}`)
    } catch (err) {
      console.error("Upload error:", err)
      toast.error("Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const copyToClipboard = async () => {
    if (!uploadedUrl) return
    try {
      await navigator.clipboard.writeText(uploadedUrl)
      setCopied(true)
      toast.success("URL copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error("Failed to copy URL.")
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-border/40">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Music className="h-5 w-5 text-primary" />
          Audio Uploader
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={cn(
            "flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200",
            isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-muted/50",
            uploading && "opacity-60 pointer-events-none",
          )}
          onClick={() => !uploading && inputFileRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload
            className={cn(
              "w-10 h-10 mb-3 transition-colors duration-200",
              isDragging ? "text-primary" : "text-muted-foreground",
            )}
          />
          <p className="text-sm font-medium text-center">
            {isDragging ? "Drop your audio file here" : "Drag & Drop your audio file here or Click to upload"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Supports MP3, WAV, M4A (Max 50MB)</p>
        </div>

        <input
          ref={inputFileRef}
          type="file"
          accept=".mp3,.wav,.m4a,audio/*"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
        />

        {file && (
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Music className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
        )}

        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Uploading...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-4">
        <Button type="button" disabled={uploading || !file} onClick={handleUpload} className="w-full">
          {uploading ? "Uploading..." : "Upload Audio"}
        </Button>
      </CardFooter>
    </Card>
  )
}

