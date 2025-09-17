"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { X, Upload, FileText } from "lucide-react"
import { uploadFile, checkFileUploadLimits, deleteFile, type FileUploadLimits } from "@/lib/supabase/storage"
import { useToast } from "@/hooks/use-toast"

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  storagePath: string
  uploading?: boolean
  progress?: number
}

interface FileUploadProps {
  conversationId: string
  messageId?: string
  onFilesChange: (files: UploadedFile[]) => void
  maxFiles?: number
  disabled?: boolean
}

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function FileUpload({
  conversationId,
  messageId,
  onFilesChange,
  maxFiles = 3,
  disabled = false,
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [limits, setLimits] = useState<FileUploadLimits | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const updateLimits = useCallback(async () => {
    const newLimits = await checkFileUploadLimits(conversationId, messageId, 0)
    setLimits(newLimits)
  }, [conversationId, messageId])

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "File type not supported. Please upload PDF, Word documents, or images."
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File size must be less than 10MB."
    }
    return null
  }

  const handleFileUpload = async (filesToUpload: File[]) => {
    if (disabled) return

    // Check limits first
    const currentLimits = await checkFileUploadLimits(conversationId, messageId, filesToUpload.length)
    if (!currentLimits.canUpload) {
      toast({
        title: "Upload Failed",
        description: currentLimits.error,
        variant: "destructive",
      })
      return
    }

    // Validate files
    for (const file of filesToUpload) {
      const error = validateFile(file)
      if (error) {
        toast({
          title: "Invalid File",
          description: `${file.name}: ${error}`,
          variant: "destructive",
        })
        return
      }
    }

    // Check if adding these files would exceed the limit
    if (files.length + filesToUpload.length > maxFiles) {
      toast({
        title: "Too Many Files",
        description: `Maximum ${maxFiles} files allowed per message.`,
        variant: "destructive",
      })
      return
    }

    // Start uploads
    const newFiles: UploadedFile[] = filesToUpload.map((file) => ({
      id: `temp-${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      storagePath: "",
      uploading: true,
      progress: 0,
    }))

    const updatedFiles = [...files, ...newFiles]
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)

    // Upload files one by one
    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i]
      const tempFile = newFiles[i]

      try {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setFiles((current) =>
            current.map((f) => (f.id === tempFile.id ? { ...f, progress: Math.min((f.progress || 0) + 10, 90) } : f)),
          )
        }, 100)

        const result = await uploadFile(file, conversationId, messageId)
        clearInterval(progressInterval)

        if (result.success && result.data) {
          // Update with successful upload
          setFiles((current) =>
            current.map((f) =>
              f.id === tempFile.id
                ? {
                    ...f,
                    id: result.data!.id,
                    storagePath: result.data!.path,
                    uploading: false,
                    progress: 100,
                  }
                : f,
            ),
          )

          toast({
            title: "Upload Successful",
            description: `${file.name} uploaded successfully.`,
          })
        } else {
          // Remove failed upload
          setFiles((current) => current.filter((f) => f.id !== tempFile.id))
          toast({
            title: "Upload Failed",
            description: result.error || "Failed to upload file.",
            variant: "destructive",
          })
        }
      } catch (error) {
        // Remove failed upload
        setFiles((current) => current.filter((f) => f.id !== tempFile.id))
        toast({
          title: "Upload Failed",
          description: "An error occurred during upload.",
          variant: "destructive",
        })
      }
    }

    // Update limits after upload
    await updateLimits()
  }

  const handleRemoveFile = async (fileId: string) => {
    if (disabled) return

    const file = files.find((f) => f.id === fileId)
    if (!file) return

    if (!file.uploading && file.storagePath) {
      const result = await deleteFile(fileId)
      if (!result.success) {
        toast({
          title: "Delete Failed",
          description: result.error || "Failed to delete file.",
          variant: "destructive",
        })
        return
      }
    }

    const updatedFiles = files.filter((f) => f.id !== fileId)
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)
    await updateLimits()
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (disabled) return

    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFileUpload(droppedFiles)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return

    const selectedFiles = Array.from(e.target.files || [])
    handleFileUpload(selectedFiles)

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* Upload Limits Info */}
      {limits && (
        <div className="text-sm text-muted-foreground">
          Files: {limits.totalFiles}/{limits.maxTotalFiles} total
          {limits.messageFiles !== undefined && (
            <span>
              , {limits.messageFiles}/{limits.maxMessageFiles} this message
            </span>
          )}
        </div>
      )}

      {/* Drop Zone */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <div className="p-6 text-center">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm font-medium mb-2">Drop medical reports here or click to browse</p>
          <p className="text-xs text-muted-foreground">PDF, Word documents, and images up to 10MB</p>
          <p className="text-xs text-muted-foreground mt-1">Max {maxFiles} files per message, 8 total</p>
        </div>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files</h4>
          {files.map((file) => (
            <Card key={file.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                </div>

                {file.uploading ? (
                  <div className="flex items-center space-x-2">
                    <Progress value={file.progress || 0} className="w-16" />
                    <span className="text-xs text-muted-foreground">{file.progress || 0}%</span>
                  </div>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveFile(file.id)} disabled={disabled}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
