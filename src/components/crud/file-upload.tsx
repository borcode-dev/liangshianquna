"use client";

import React, { useState, useRef } from "react";
import { Upload, X, FileText, Image as ImageIcon, File } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

interface FileUploadProps {
  value?: UploadedFile[];
  onChange?: (files: UploadedFile[]) => void;
  accept?: string;
  maxFiles?: number;
  maxSizeMB?: number;
  label?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return <ImageIcon className="h-4 w-4 text-blue-500" />;
  if (type === "application/pdf") return <FileText className="h-4 w-4 text-red-500" />;
  return <File className="h-4 w-4 text-gray-500" />;
}

export function FileUpload({
  value = [],
  onChange,
  accept = "image/*,.pdf,.doc,.docx",
  maxFiles = 5,
  maxSizeMB = 10,
  label = "上传文件",
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    setError("");

    const newFiles: UploadedFile[] = [];
    const remaining = maxFiles - value.length;

    if (fileList.length > remaining) {
      setError(`最多上传 ${maxFiles} 个文件`);
      return;
    }

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`文件 ${file.name} 超过 ${maxSizeMB}MB 限制`);
        continue;
      }
      newFiles.push({
        id: `file-${Date.now()}-${i}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
      });
    }

    if (newFiles.length > 0 && onChange) {
      onChange([...value, ...newFiles]);
    }
  };

  const handleRemove = (id: string) => {
    const file = value.find((f) => f.id === id);
    if (file?.url) URL.revokeObjectURL(file.url);
    onChange?.(value.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-2">
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
          dragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary/50"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-6 w-6 mx-auto text-gray-400 mb-1" />
        <p className="text-sm text-gray-500">
          {label}（拖拽或点击上传）
        </p>
        <p className="text-xs text-gray-400 mt-1">
          支持 {accept}，单个文件不超过 {maxSizeMB}MB，最多 {maxFiles} 个
        </p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={maxFiles > 1}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border"
            >
              {file.url ? (
                <img
                  src={file.url}
                  alt={file.name}
                  className="h-10 w-10 rounded object-cover border"
                />
              ) : (
                <div className="h-10 w-10 rounded bg-white border flex items-center justify-center">
                  {getFileIcon(file.type)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-gray-400 hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(file.id);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
