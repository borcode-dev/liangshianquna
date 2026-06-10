"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Upload, Download, Eye, Pencil, Trash2 } from "lucide-react";
import { businessEnterprises as initialData } from "@/lib/mock-data";
import { FormModal, type FormField, DetailModal, type DetailField, DeleteDialog } from "@/components/crud";
import type { UploadedFile } from "@/components/crud/file-upload";
import { toast } from "sonner";

interface Enterprise {
  id: string;
  name: string;
  creditCode: string;
  legalPerson: string;
  phone: string;
  region: string;
  address: string;
  type: string;
  licenseNo: string;
  licenseExpiry: string;
  creditGrade: string;
  status: string;
  canRestricted: string;
  attachment?: UploadedFile[];
  licenseFile?: UploadedFile[];
}

const statusConfig: Record<string, { dot: string; badge: string }> = {
  "正常": { dot: "bg-green-500", badge: "bg-green-100 text-green-700" },
  "临期": { dot: "bg-amber-500", badge: "bg-amber-100 text-amber-700" },
  "过期": { dot: "bg-red-500", badge: "bg-red-100 text-red-700" },
  "整改中": { dot: "bg-orange-500", badge: "bg-orange-100 text-orange-700" },
  "已停业": { dot: "bg-gray-500", badge: "bg-gray-100 text-gray-700" },
  "许可证注销": { dot: "bg-gray-400", badge: "bg-gray-100 text-gray-500" },
};

const formFields: FormField[] = [
  { name: "name", label: "企业名称", type: "text", required: true, colSpan: 2, placeholder: "请输入企业全称" },
  { name: "creditCode", label: "统一社会信用代码", type: "text", required: true, placeholder: "18位代码" },
  { name: "legalPerson", label: "法定代表人", type: "text", required: true, placeholder: "法人/负责人姓名" },
  { name: "phone", label: "联系电话", type: "text", required: true, placeholder: "联系方式" },
  { name: "region", label: "所在地区", type: "select", required: true, options: [
    { label: "蚌埠市", value: "蚌埠市" }, { label: "阜阳市", value: "阜阳市" },
    { label: "宿州市", value: "宿州市" }, { label: "滁州市", value: "滁州市" },
  ]},
  { name: "address", label: "详细地址", type: "text", required: true, colSpan: 2, placeholder: "实际经营地址" },
  { name: "type", label: "经营类型", type: "select", required: true, options: [
    { label: "批发+零售", value: "批发+零售" }, { label: "批发", value: "批发" }, { label: "零售", value: "零售" },
  ]},
  { name: "licenseNo", label: "经营许可证号", type: "text", required: true, placeholder: "JY-XXXXXXXXX" },
  { name: "licenseExpiry", label: "许可证有效期至", type: "date", required: true },
  { name: "canRestricted", label: "可经营限制农药", type: "select", options: [
    { label: "是", value: "是" }, { label: "否", value: "否" },
  ]},
  { name: "creditGrade", label: "诚信等级", type: "select", options: [
    { label: "A级", value: "A" }, { label: "B级", value: "B" }, { label: "C级", value: "C" }, { label: "D级", value: "D" },
  ]},
  { name: "status", label: "状态", type: "select", options: [
    { label: "正常", value: "正常" }, { label: "临期", value: "临期" }, { label: "过期", value: "过期" }, { label: "整改中", value: "整改中" },
  ]},
  { name: "licenseFile", label: "经营许可证", type: "image", accept: "image/*,.pdf", maxFiles: 3, colSpan: 2 },
  { name: "attachment", label: "附件材料", type: "file", accept: "image/*,.pdf,.doc,.docx", maxFiles: 5, colSpan: 2 },
];

const detailFields: DetailField[] = [
  { name: "name", label: "企业名称", colSpan: 2 },
  { name: "creditCode", label: "统一社会信用代码" },
  { name: "legalPerson", label: "法定代表人" },
  { name: "phone", label: "联系电话" },
  { name: "region", label: "所在地区" },
  { name: "address", label: "详细地址", colSpan: 2 },
  { name: "type", label: "经营类型" },
  { name: "licenseNo", label: "经营许可证号" },
  { name: "licenseExpiry", label: "许可证有效期至" },
  { name: "canRestricted", label: "可经营限制农药" },
  { name: "creditGrade", label: "诚信等级" },
  { name: "status", label: "状态", type: "badge" },
  { name: "licenseFile", label: "经营许可证", type: "image", colSpan: 2 },
  { name: "attachment", label: "附件材料", type: "file", colSpan: 2 },
];

export default function BusinessEnterprisesPage() {
  const [data, setData, hydrated] = useLocalStorage<Enterprise[]>(
    "business-enterprises",
    (initialData as unknown as Enterprise[]).map((e) => ({ ...e, attachment: [], licenseFile: [] }))
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("全部");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // 搜索/筛选变化时重置页码
  useEffect(() => { setCurrentPage(1); }, [search, statusFilter]);

  if (!hydrated) {
    return <div className="p-6">加载中...</div>;
  }

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<Record<string, unknown> | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState("");

  const statusCounts = useMemo(() => ({
    "全部": data.length,
    "正常": data.filter((e) => e.status === "正常").length,
    "整改中": data.filter((e) => e.status === "整改中").length,
    "已停业": data.filter((e) => e.status === "已停业").length,
    "许可证过期": data.filter((e) => e.status === "过期").length,
  }), [data]);

  const filtered = useMemo(() =>
    data.filter((e) => {
      if (statusFilter !== "全部" && statusFilter !== "许可证过期" && e.status !== statusFilter) return false;
      if (statusFilter === "许可证过期" && e.status !== "过期") return false;
      if (search && !e.name.includes(search) && !e.licenseNo.includes(search)) return false;
      return true;
    }),
    [data, statusFilter, search]
  );

  const openAdd = () => {
    setFormMode("add");
    setFormValues({ status: "正常", creditGrade: "A", type: "零售", canRestricted: "否", attachment: [], licenseFile: [] });
    setEditingId(null);
    setFormOpen(true);
  };

  const openEdit = (item: Enterprise) => {
    setFormMode("edit");
    setFormValues({
      ...item,
      attachment: item.attachment || [],
      licenseFile: item.licenseFile || [],
    });
    setEditingId(item.id);
    setFormOpen(true);
  };

  const openDetail = (item: Enterprise) => {
    setDetailData({ ...item });
    setDetailOpen(true);
  };

  const openDelete = (item: Enterprise) => {
    setDeleteId(item.id);
    setDeleteName(item.name);
    setDeleteOpen(true);
  };

  const handleFormChange = (name: string, value: unknown) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = () => {
    if (!formValues.name) {
      toast.error("请填写企业名称");
      return;
    }
    if (formMode === "add") {
      const newItem: Enterprise = {
        id: `be-${Date.now()}`,
        name: String(formValues.name || ""),
        creditCode: String(formValues.creditCode || ""),
        legalPerson: String(formValues.legalPerson || ""),
        phone: String(formValues.phone || ""),
        region: String(formValues.region || ""),
        address: String(formValues.address || ""),
        type: String(formValues.type || "零售"),
        licenseNo: String(formValues.licenseNo || ""),
        licenseExpiry: String(formValues.licenseExpiry || ""),
        creditGrade: String(formValues.creditGrade || "A"),
        status: String(formValues.status || "正常"),
        canRestricted: String(formValues.canRestricted || "否"),
        attachment: (formValues.attachment as UploadedFile[]) || [],
        licenseFile: (formValues.licenseFile as UploadedFile[]) || [],
      };
      setData((prev) => [newItem, ...prev]);
      toast.success("新增成功", { description: `企业「${newItem.name}」已添加` });
    } else {
      setData((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                ...formValues,
                attachment: (formValues.attachment as UploadedFile[]) || item.attachment || [],
                licenseFile: (formValues.licenseFile as UploadedFile[]) || item.licenseFile || [],
              }
            : item
        )
      );
      toast.success("编辑成功", { description: `企业「${formValues.name}」已更新` });
    }
    setFormOpen(false);
  };

  const handleDelete = () => {
    setData((prev) => prev.filter((item) => item.id !== deleteId));
    toast.success("删除成功", { description: `企业「${deleteName}」已删除` });
    setDeleteOpen(false);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">经营企业管理</h1>
        <div className="flex gap-2">
          <Button onClick={openAdd}><Plus className="mr-1 h-4 w-4" />新增企业</Button>
          <Button variant="outline"><Upload className="mr-1 h-4 w-4" />批量导入</Button>
          <Button variant="outline"><Download className="mr-1 h-4 w-4" />导出</Button>
        </div>
      </div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          {Object.entries(statusCounts).map(([key, count]) => (
            <TabsTrigger key={key} value={key}>{key}({count})</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="搜索企业名称/许可证号..." className="w-[240px] pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[260px]">企业名称</TableHead>
                <TableHead>经营类型</TableHead>
                <TableHead>许可证号</TableHead>
                <TableHead>有效期至</TableHead>
                <TableHead>诚信等级</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-center w-[200px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((e) => {
                const sc = statusConfig[e.status] || statusConfig["正常"];
                return (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.name}</TableCell>
                    <TableCell>{e.type}</TableCell>
                    <TableCell className="font-mono text-sm">{e.licenseNo}</TableCell>
                    <TableCell>{e.licenseExpiry}</TableCell>
                    <TableCell><Badge variant="outline">{e.creditGrade}级</Badge></TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={sc.badge}>
                        <span className={`inline-block h-1.5 w-1.5 rounded-full ${sc.dot} mr-1`} />
                        {e.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openDetail(e)}>
                          <Eye className="mr-0.5 h-3.5 w-3.5" />查看
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(e)}>
                          <Pencil className="mr-0.5 h-3.5 w-3.5" />编辑
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => openDelete(e)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">暂无数据</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
            <span>共 {filtered.length} 条记录，第 {currentPage}/{Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))} 页</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => p - 1)}>&lt;</Button>
              {Array.from({ length: Math.min(5, Math.ceil(filtered.length / PAGE_SIZE)) }, (_, i) => {
                const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
                let start = Math.max(1, currentPage - 2);
                if (start + 4 > totalPages) start = Math.max(1, totalPages - 4);
                const page = start + i;
                if (page > totalPages) return null;
                return (
                  <Button key={page} variant="outline" size="sm" className={page === currentPage ? "bg-primary text-white" : ""} onClick={() => setCurrentPage(page)}>{page}</Button>
                );
              })}
              <Button variant="outline" size="sm" disabled={currentPage >= Math.ceil(filtered.length / PAGE_SIZE)} onClick={() => setCurrentPage((p) => p + 1)}>&gt;</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <FormModal
        open={formOpen} onClose={() => setFormOpen(false)}
        title={formMode === "add" ? "新增经营企业" : "编辑经营企业"}
        fields={formFields} values={formValues} onChange={handleFormChange} onSubmit={handleFormSubmit}
      />
      <DetailModal open={detailOpen} onClose={() => setDetailOpen(false)} title="企业详情" fields={detailFields} data={detailData} />
      <DeleteDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} description={`确定要删除企业「${deleteName}」吗？删除后将无法恢复。`} />
    </div>
  );
}
