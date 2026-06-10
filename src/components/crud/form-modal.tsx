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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileUpload, type UploadedFile } from "./file-upload";

export interface FormField {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "date" | "file" | "image" | "badge";
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
  colSpan?: number;
  accept?: string;
  maxFiles?: number;
}

interface FormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  fields: FormField[];
  values: Record<string, unknown>;
  onChange: (name: string, value: unknown) => void;
  onSubmit: () => void;
  submitLabel?: string;
}

export function FormModal({
  open,
  onClose,
  title,
  fields,
  values,
  onChange,
  onSubmit,
  submitLabel = "确定",
}: FormModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSubmit();
  };

  const renderField = (field: FormField) => {
    const val = values[field.name];

    switch (field.type) {
      case "select":
        return (
          <Select
            value={String(val ?? "")}
            onValueChange={(v) => onChange(field.name, v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={field.placeholder || "请选择"} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "date":
        return (
          <Input
            type="date"
            value={String(val ?? "")}
            onChange={(e) => onChange(field.name, e.target.value)}
            placeholder={field.placeholder}
          />
        );
      case "file":
        return (
          <FileUpload
            accept={field.accept || "*"}
            maxFiles={field.maxFiles || 5}
            value={(val as UploadedFile[]) || []}
            onChange={(files) => onChange(field.name, files)}
          />
        );
      case "image":
        return (
          <FileUpload
            accept={field.accept || (field.type === "image" ? "image/*" : undefined)}
            maxFiles={field.maxFiles || 3}
            value={(val as UploadedFile[]) || []}
            onChange={(files) => onChange(field.name, files)}
          />
        );
      case "number":
        return (
          <Input
            type="number"
            value={String(val ?? "")}
            onChange={(e) => onChange(field.name, e.target.value)}
            placeholder={field.placeholder}
          />
        );
      case "badge":
      case "text":
      default:
        return (
          <Input
            value={String(val ?? "")}
            onChange={(e) => onChange(field.name, e.target.value)}
            placeholder={field.placeholder}
          />
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="sm:max-w-2xl max-h-[88vh] flex flex-col !p-0 !gap-0"
        showCloseButton
      >
        <DialogHeader className="px-6 pt-5 pb-3 shrink-0 border-b">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">填写表单信息</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="flex-1 px-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 pb-2">
              {fields.map((field) => (
                <div
                  key={field.name}
                  className={field.colSpan === 2 ? "sm:col-span-2" : ""}
                >
                  <Label className="mb-1.5 block text-sm font-medium">
                    {field.label}
                    {field.required && (
                      <span className="text-destructive ml-0.5">*</span>
                    )}
                  </Label>
                  {renderField(field)}
                </div>
              ))}
            </div>
          </ScrollArea>

          <DialogFooter className="px-6 py-3 border-t shrink-0 bg-muted/30 sticky bottom-0">
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit">{submitLabel}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
