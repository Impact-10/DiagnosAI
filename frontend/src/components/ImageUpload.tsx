import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Progress } from "./ui/progress";
import { Camera, Upload, X, Image as ImageIcon, AlertTriangle } from "lucide-react";

interface ImageUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (images: File[], description: string) => void;
}

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function ImageUpload({ open, onOpenChange, onComplete }: ImageUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `${file.name}: Only JPEG, PNG, and WebP images are allowed`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name}: File size must be less than 10MB`;
    }
    return null;
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newErrors: string[] = [];
    const validFiles: File[] = [];

    Array.from(files).forEach(file => {
      if (selectedFiles.length + validFiles.length >= MAX_FILES) {
        newErrors.push(`Maximum ${MAX_FILES} images allowed`);
        return;
      }

      const error = validateFile(file);
      if (error) {
        newErrors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    setErrors(newErrors);
    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      setErrors(["Please select at least one image"]);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Call the completion handler
      onComplete(selectedFiles, description);
      
      // Clean up
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setSelectedFiles([]);
        setDescription("");
        setUploading(false);
        setUploadProgress(0);
        setErrors([]);
        onOpenChange(false);
      }, 1000);

    } catch (error) {
      setErrors(["Failed to upload images. Please try again."]);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[1.25rem] font-medium text-foreground">
            <Camera className="w-5 h-5 text-primary" />
            Upload Medical Images
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
              <div className="text-[0.875rem] font-normal">
                <p className="font-medium text-warning-foreground mb-1">Privacy Notice</p>
                <p className="text-muted-foreground">Your medical images are processed securely and are not stored permanently on our servers.</p>
              </div>
            </div>
          </div>

          {/* File Upload Area */}
          <div
            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-[1rem] font-medium text-foreground">Upload medical images</p>
                <p className="text-[0.875rem] text-muted-foreground">
                  Drag and drop or click to select files
                </p>
                <p className="text-[0.75rem] text-muted-foreground mt-1">
                  Max {MAX_FILES} files, up to 10MB each. JPEG, PNG, WebP supported.
                </p>
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPTED_TYPES.join(',')}
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />

          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="space-y-1">
              {errors.map((error, index) => (
                <p key={index} className="text-[0.875rem] text-destructive">{error}</p>
              ))}
            </div>
          )}

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-[0.875rem] font-medium text-foreground">Selected Images ({selectedFiles.length})</h4>
              <div className="grid gap-3">
                {selectedFiles.map((file, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ImageIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[0.875rem] font-medium text-foreground truncate">{file.name}</p>
                        <p className="text-[0.75rem] text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <label className="text-[0.875rem] font-medium text-foreground">
              Description (Optional)
            </label>
            <Textarea
              placeholder="Describe what's shown in the images or any specific concerns..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px] text-[0.875rem]"
              disabled={uploading}
            />
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[0.875rem] font-medium">Uploading images...</span>
                <span className="text-[0.875rem] text-muted-foreground">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={uploading}
            className="text-[1rem] font-medium"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={selectedFiles.length === 0 || uploading}
            className="bg-primary hover:bg-primary/90 text-[1rem] font-medium text-primary-foreground"
          >
            {uploading ? "Uploading..." : "Upload & Analyze"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}