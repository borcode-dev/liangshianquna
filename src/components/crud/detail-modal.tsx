"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Download, ImageIcon } from "lucide-react";
import type { UploadedFile } from "./file-upload";

export interface DetailField {
  name: string;
  label: string;
  type?: "text" | "file" | "image" | "badge" | "number";
  colSpan?: number;
}

interface DetailModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  fields: DetailField[];
  data: Record<string, unknown> | null;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function DetailModal({
  open,
  onClose,
  title,
  fields,
  data,
}: DetailModalProps) {
  if (!data) return null;

  const renderValue = (field: DetailField) => {
    const val = data[field.name];
    if (val === null || val === undefined || val === "") {
      return <span className="text-muted-foreground">—</span>;
    }

    switch (field.type) {
      case "badge": {
        const statusMap: Record<string, string> = {
          "正常": "bg-green-100 text-green-700",
          "临期": "bg-yellow-100 text-yellow-700",
          "过期": "bg-red-100 text-red-700",
          "整改中": "bg-orange-100 text-orange-700",
          "已停产": "bg-gray-100 text-gray-700",
          "已停业": "bg-gray-100 text-gray-700",
          "有效": "bg-green-100 text-green-700",
          "即将到期": "bg-yellow-100 text-yellow-700",
          "已过期": "bg-red-100 text-red-700",
        };
        return (
          <Badge variant="secondary" className={statusMap[String(val)] || ""}>
            {String(val)}
          </Badge>
        );
      }
      case "image": {
        const files = val as UploadedFile[];
        if (!files || files.length === 0) {
          return <span className="text-muted-foreground">未上传</span>;
        }
        return (
          <div className="flex flex-wrap gap-2">
            {files.map((f, i) => (
              <div
                key={i}
                className="group relative w-16 h-16 rounded-md border bg-muted overflow-hidden"
              >
                {f.type?.startsWith("image/") && f.url ? (
                  <img
                    src={f.url}
                    alt={f.name}
                    className="w-full h-full object-cover"
                  />
                ) : f.type?.startsWith("image/") ? (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10">
                    <ImageIcon className="h-6 w-6 text-primary/60" />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-[10px] text-white truncate px-1">
                    {f.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        );
      }
      case "file": {
        const files = val as UploadedFile[];
        if (!files || files.length === 0) {
          return <span className="text-muted-foreground">未上传</span>;
        }
        return (
          <div className="space-y-1.5">
            {files.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm p-1.5 rounded bg-muted/50"
              >
                <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="truncate flex-1">{f.name}</span>
                {f.size > 0 && (
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatFileSize(f.size)}
                  </span>
                )}
                <Download className="h-3 w-3 text-muted-foreground shrink-0" />
              </div>
            ))}
          </div>
        );
      }
      case "number":
      case "text":
      default:
        return <span>{String(val)}</span>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="sm:max-w-2xl max-h-[88vh] flex flex-col !p-0 !gap-0 overflow-hidden"
        showCloseButton
      >
        <DialogHeader className="px-6 pt-5 pb-3 shrink-0 border-b">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">查看详细信息</DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pb-2">
            {fields.map((field) => (
              <div
                key={field.name}
                className={field.colSpan === 2 ? "sm:col-span-2" : ""}
              >
                <div className="text-xs text-muted-foreground mb-1">
                  {field.label}
                </div>
                <div className="text-sm">{renderValue(field)}</div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-3 border-t shrink-0 bg-muted/30">
          <Button variant="outline" onClick={onClose}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
