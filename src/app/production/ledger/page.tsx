"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Upload, Eye, Pencil, Trash2 } from "lucide-react";
import { productionLedger as initialData, productionEnterprises, pesticideRegistrations } from "@/lib/mock-data";
import { FormModal, type FormField, DetailModal, type DetailField, DeleteDialog } from "@/components/crud";
import { toast } from "sonner";
import Link from "next/link";

type LedgerItem = (typeof initialData)[number] & { id: string; dataStatus?: string; attachment?: string };

const formFields: FormField[] = [
  { name: "batchNo", label: "批次编号", type: "text", required: true, placeholder: "PC-YYYYMMDD-XXX" },
  { name: "productName", label: "农药名称", type: "select", required: true, options: pesticideRegistrations.map((p) => ({ label: p.name, value: p.name })) },
  { name: "regNo", label: "登记证号", type: "select", required: true, options: pesticideRegistrations.map((p) => ({ label: p.regNo, value: p.regNo })) },
  { name: "enterpriseId", label: "生产企业", type: "select", required: true, options: productionEnterprises.map((e) => ({ label: e.name, value: e.id })) },
  { name: "date", label: "生产日期", type: "date", required: true },
  { name: "output", label: "生产数量(吨)", type: "number", required: true, placeholder: "0" },
  { name: "sold", label: "销售数量(吨)", type: "number", required: true, placeholder: "0" },
  { name: "stock", label: "库存(吨)", type: "number", required: true, placeholder: "0" },
  { name: "status", label: "状态", type: "select", required: true, options: [
    { label: "正常", value: "正常" }, { label: "临期", value: "临期" },
  ]},
  { name: "dataStatus", label: "数据状态", type: "select", options: [
    { label: "待上报", value: "待上报" }, { label: "已上报", value: "已上报" }, { label: "已同步", value: "已同步" },
  ]},
  { name: "attachment", label: "质检报告", type: "file", accept: ".pdf,.doc,.docx,image/*" },
];

const detailFields: DetailField[] = [
  { name: "batchNo", label: "批次编号" },
  { name: "productName", label: "农药名称" },
  { name: "regNo", label: "登记证号" },
  { name: "enterprise", label: "生产企业" },
  { name: "date", label: "生产日期" },
  { name: "output", label: "产量(吨)", type: "number" },
  { name: "sold", label: "销量(吨)", type: "number" },
  { name: "stock", label: "库存(吨)", type: "number" },
  { name: "status", label: "状态", type: "badge" },
  { name: "dataStatus", label: "数据状态" },
  { name: "attachment", label: "质检报告", type: "file" },
];

export default function ProductionLedgerPage() {
  const [data, setData] = useState<LedgerItem[]>(
    initialData.map((item, i) => ({
      ...item,
      id: `pl-${i}`,
      dataStatus: i % 3 === 0 ? "待上报" : i % 3 === 1 ? "已上报" : "已同步",
      enterprise: item.enterprise || productionEnterprises.find((e) => e.id === item.enterpriseId)?.name || "",
    }))
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<Record<string, unknown> | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState("");

  const filtered = useMemo(() =>
    data.filter((e) => {
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      if (search && !e.productName.includes(search) && !e.batchNo.includes(search)) return false;
      return true;
    }),
    [data, statusFilter, search]
  );

  const totalOutput = useMemo(() => data.reduce((s, e) => s + e.output, 0), [data]);
  const totalSold = useMemo(() => data.reduce((s, e) => s + e.sold, 0), [data]);
  const totalStock = useMemo(() => data.reduce((s, e) => s + e.stock, 0), [data]);

  const openAdd = () => {
    setFormMode("add");
    setFormValues({ status: "正常", dataStatus: "待上报" });
    setEditingId(null);
    setFormOpen(true);
  };

  const openEdit = (item: LedgerItem) => {
    setFormMode("edit");
    setFormValues({ ...item });
    setEditingId(item.id);
    setFormOpen(true);
  };

  const openDetail = (item: LedgerItem) => {
    setDetailData({ ...item });
    setDetailOpen(true);
  };

  const openDelete = (item: LedgerItem) => {
    setDeleteId(item.id);
    setDeleteName(item.batchNo);
    setDeleteOpen(true);
  };

  const handleFormChange = (name: string, value: unknown) => {
    setFormValues((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "productName") {
        const reg = pesticideRegistrations.find((p) => p.name === value);
        if (reg) updated.regNo = reg.regNo;
      }
      if (name === "enterpriseId") {
        const ent = productionEnterprises.find((e) => e.id === value);
        if (ent) updated.enterprise = ent.name;
      }
      return updated;
    });
  };

  const handleFormSubmit = () => {
    if (formMode === "add") {
      const ent = productionEnterprises.find((e) => e.id === formValues.enterpriseId);
      const newItem = {
        ...formValues,
        id: `pl-${Date.now()}`,
        enterprise: ent?.name || formValues.enterprise || "",
        output: Number(formValues.output) || 0,
        sold: Number(formValues.sold) || 0,
        stock: Number(formValues.stock) || 0,
        enterpriseId: formValues.enterpriseId || "",
      } as LedgerItem;
      setData((prev) => [newItem, ...prev]);
      toast.success("新增成功", { description: `批次「${formValues.batchNo}」已添加` });
    } else {
      setData((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                ...formValues,
                output: Number(formValues.output) ?? item.output,
                sold: Number(formValues.sold) ?? item.sold,
                stock: Number(formValues.stock) ?? item.stock,
              }
            : item
        )
      );
      toast.success("编辑成功", { description: `批次「${formValues.batchNo}」已更新` });
    }
    setFormOpen(false);
  };

  const handleDelete = () => {
    setData((prev) => prev.filter((item) => item.id !== deleteId));
    toast.success("删除成功", { description: `批次「${deleteName}」已删除` });
    setDeleteOpen(false);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">生产台账</h1>
        <div className="flex gap-2">
          <Button onClick={openAdd}><Plus className="mr-1 h-4 w-4" />新增批次</Button>
          <Link href="/production/ledger/new">
            <Button variant="outline"><Plus className="mr-1 h-4 w-4" />完整录入</Button>
          </Link>
          <Button variant="outline"><Upload className="mr-1 h-4 w-4" />批量导入</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="数据状态" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="正常">正常</SelectItem>
            <SelectItem value="临期">临期</SelectItem>
          </SelectContent>
        </Select>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="搜索批次号/产品名称..." className="w-[240px] pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-primary">{data.length}批</p><p className="mt-1 text-sm text-muted-foreground">本月生产批次</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-primary">{totalOutput.toLocaleString()}吨</p><p className="mt-1 text-sm text-muted-foreground">本月产量</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-primary">{totalSold.toLocaleString()}吨</p><p className="mt-1 text-sm text-muted-foreground">本月销量</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-amber-600">{totalStock.toLocaleString()}吨</p><p className="mt-1 text-sm text-muted-foreground">在库库存</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>批次编号</TableHead>
                <TableHead>产品名称</TableHead>
                <TableHead>登记证号</TableHead>
                <TableHead>生产企业</TableHead>
                <TableHead>生产日期</TableHead>
                <TableHead className="text-right">产量</TableHead>
                <TableHead className="text-right">销量</TableHead>
                <TableHead className="text-right">库存</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-center w-[200px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-mono text-sm">{e.batchNo}</TableCell>
                  <TableCell className="font-medium">{e.productName}</TableCell>
                  <TableCell className="font-mono text-sm">{e.regNo}</TableCell>
                  <TableCell>{e.enterprise}</TableCell>
                  <TableCell>{e.date}</TableCell>
                  <TableCell className="text-right">{e.output}吨</TableCell>
                  <TableCell className="text-right">{e.sold}吨</TableCell>
                  <TableCell className="text-right">{e.stock}吨</TableCell>
                  <TableCell><Badge variant={e.status === "临期" ? "destructive" : "default"}>{e.status}</Badge></TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openDetail(e)}><Eye className="mr-0.5 h-3.5 w-3.5" />查看</Button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(e)}><Pencil className="mr-0.5 h-3.5 w-3.5" />编辑</Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => openDelete(e)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground">暂无数据</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
            <span>共 {filtered.length} 条记录</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>&lt;</Button>
              <Button variant="outline" size="sm" className="bg-primary text-white">1</Button>
              <Button variant="outline" size="sm" disabled>&gt;</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <FormModal
        open={formOpen} onClose={() => setFormOpen(false)}
        title={formMode === "add" ? "新增生产批次" : "编辑生产批次"}
        fields={formFields} values={formValues} onChange={handleFormChange} onSubmit={handleFormSubmit}
      />
      <DetailModal open={detailOpen} onClose={() => setDetailOpen(false)} title="批次详情" fields={detailFields} data={detailData} />
      <DeleteDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} description={`确定要删除批次「${deleteName}」吗？删除后将无法恢复。`} />
    </div>
  );
}
