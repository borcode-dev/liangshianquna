"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Upload, Eye, Pencil, Trash2 } from "lucide-react";
import { pesticideRegistrations as initialData, productionLedger } from "@/lib/mock-data";
import { FormModal, type FormField, DetailModal, type DetailField, DeleteDialog } from "@/components/crud";
import { toast } from "sonner";

type Registration = (typeof initialData)[number] & { id: string; producers?: string; attachment?: string };

const formFields: FormField[] = [
  { name: "regNo", label: "登记证号", type: "text", required: true, placeholder: "PDXXXXXXXX" },
  { name: "name", label: "农药名称", type: "text", required: true, placeholder: "请输入农药名称" },
  { name: "form", label: "剂型", type: "select", required: true, options: [
    { label: "水剂", value: "水剂" }, { label: "可湿性粉剂", value: "可湿性粉剂" },
    { label: "悬浮剂", value: "悬浮剂" }, { label: "乳油", value: "乳油" },
    { label: "水分散粒剂", value: "水分散粒剂" },
  ]},
  { name: "toxicity", label: "毒性等级", type: "select", required: true, options: [
    { label: "低毒", value: "低毒" }, { label: "中等毒", value: "中等毒" }, { label: "高毒", value: "高毒" },
  ]},
  { name: "content", label: "有效成分含量", type: "text", required: true, placeholder: "如41%" },
  { name: "category", label: "农药类别", type: "select", required: true, options: [
    { label: "除草剂", value: "除草剂" }, { label: "杀虫剂", value: "杀虫剂" },
    { label: "杀菌剂", value: "杀菌剂" }, { label: "植物生长调节剂", value: "植物生长调节剂" },
  ]},
  { name: "expiry", label: "有效期至", type: "date", required: true },
  { name: "status", label: "状态", type: "select", required: true, options: [
    { label: "有效", value: "有效" }, { label: "即将到期", value: "即将到期" }, { label: "已过期", value: "已过期" },
  ]},
  { name: "attachment", label: "附件材料", type: "file", accept: ".pdf,.doc,.docx,image/*" },
];

const detailFields: DetailField[] = [
  { name: "regNo", label: "登记证号" },
  { name: "name", label: "农药名称" },
  { name: "form", label: "剂型" },
  { name: "toxicity", label: "毒性等级" },
  { name: "content", label: "有效成分含量" },
  { name: "category", label: "农药类别" },
  { name: "expiry", label: "有效期至" },
  { name: "status", label: "状态", type: "badge" },
  { name: "producers", label: "生产企业", colSpan: 2 },
  { name: "attachment", label: "附件材料", type: "file" },
];

export default function ProductManagementPage() {
  const [data, setData] = useState<Registration[]>(
    initialData.map((item, i) => ({ ...item, id: `reg-${i}` }))
  );
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<Record<string, unknown> | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState("");

  const producersByRegNo = useMemo(() => {
    const map: Record<string, string[]> = {};
    productionLedger.forEach((ledger) => {
      if (!map[ledger.regNo]) map[ledger.regNo] = [];
      if (!map[ledger.regNo].includes(ledger.enterprise)) map[ledger.regNo].push(ledger.enterprise);
    });
    return map;
  }, []);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: data.length, "有效": 0, "即将到期": 0, "已过期": 0 };
    data.forEach((p) => { if (counts[p.status] !== undefined) counts[p.status]++; });
    return counts;
  }, [data]);

  const categories = useMemo(() => Array.from(new Set(data.map((p) => p.category))), [data]);

  const filteredData = useMemo(() =>
    data.filter((item) => {
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      const matchesSearch = !searchTerm || item.name.includes(searchTerm) || item.regNo.includes(searchTerm);
      return matchesStatus && matchesCategory && matchesSearch;
    }),
    [data, statusFilter, categoryFilter, searchTerm]
  );

  const enrichItem = (item: Registration) => ({
    ...item,
    producers: producersByRegNo[item.regNo]?.join("、") || "暂无",
  });

  const openAdd = () => {
    setFormMode("add");
    setFormValues({ status: "有效", toxicity: "低毒", form: "水剂", category: "除草剂" });
    setEditingId(null);
    setFormOpen(true);
  };

  const openEdit = (item: Registration) => {
    setFormMode("edit");
    setFormValues({ ...item });
    setEditingId(item.id);
    setFormOpen(true);
  };

  const openDetail = (item: Registration) => {
    setDetailData(enrichItem(item));
    setDetailOpen(true);
  };

  const openDelete = (item: Registration) => {
    setDeleteId(item.id);
    setDeleteName(item.name);
    setDeleteOpen(true);
  };

  const handleFormChange = (name: string, value: unknown) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = () => {
    if (formMode === "add") {
      const newItem = { ...formValues, id: `reg-${Date.now()}` } as Registration;
      setData((prev) => [newItem, ...prev]);
      toast.success("新增成功", { description: `登记证「${formValues.regNo}」已添加` });
    } else {
      setData((prev) => prev.map((item) => item.id === editingId ? { ...item, ...formValues } as Registration : item));
      toast.success("编辑成功", { description: `登记证「${formValues.regNo}」已更新` });
    }
    setFormOpen(false);
  };

  const handleDelete = () => {
    setData((prev) => prev.filter((item) => item.id !== deleteId));
    toast.success("删除成功", { description: `登记证「${deleteName}」已删除` });
    setDeleteOpen(false);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">农药登记证管理</h1>
        <div className="flex gap-2">
          <Button onClick={openAdd}><Plus className="mr-1 h-4 w-4" />新增登记证</Button>
          <Button variant="outline"><Upload className="mr-1 h-4 w-4" />批量导入</Button>
        </div>
      </div>

      <div className="flex gap-4 border-b pb-2 text-sm">
        {[{ key: "all", label: "全部" }, { key: "有效", label: "有效" }, { key: "即将到期", label: "即将到期" }, { key: "已过期", label: "已过期" }].map((tab) => (
          <button key={tab.key} className={`pb-2 ${statusFilter === tab.key ? "text-primary border-b-2 border-primary font-medium" : "text-muted-foreground hover:text-foreground"}`} onClick={() => setStatusFilter(tab.key)}>
            {tab.label}({statusCounts[tab.key] || 0})
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="农药类别" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部类别</SelectItem>
            {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="搜索农药名称/证号..." className="w-[220px] pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>登记证号</TableHead>
                <TableHead>农药名称</TableHead>
                <TableHead>剂型</TableHead>
                <TableHead>毒性</TableHead>
                <TableHead>有效成分</TableHead>
                <TableHead>类别</TableHead>
                <TableHead>有效期至</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-center w-[200px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs">{item.regNo}</TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.form}</TableCell>
                  <TableCell>
                    <Badge variant={item.toxicity === "高毒" ? "destructive" : item.toxicity === "中等毒" ? "outline" : "secondary"} className="text-[10px]">
                      {item.toxicity}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.content}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.expiry}</TableCell>
                  <TableCell>
                    <Badge variant={item.status === "有效" ? "secondary" : item.status === "即将到期" ? "outline" : "destructive"} className={`text-[10px] ${item.status === "即将到期" ? "border-amber-500 text-amber-600" : ""}`}>
                      {item.status === "有效" ? "🟢" : item.status === "即将到期" ? "🟡" : "🔴"} {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openDetail(item)}><Eye className="mr-0.5 h-3.5 w-3.5" />查看</Button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(item)}><Pencil className="mr-0.5 h-3.5 w-3.5" />编辑</Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => openDelete(item)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredData.length === 0 && (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">暂无数据</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between p-4 text-sm text-muted-foreground">
            <span>共 {filteredData.length} 种登记证</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>◀</Button>
              <Button variant="outline" size="sm">1</Button>
              <Button variant="outline" size="sm" disabled>▶</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <FormModal
        open={formOpen} onClose={() => setFormOpen(false)}
        title={formMode === "add" ? "新增登记证" : "编辑登记证"}
        fields={formFields} values={formValues} onChange={handleFormChange} onSubmit={handleFormSubmit}
      />
      <DetailModal open={detailOpen} onClose={() => setDetailOpen(false)} title="登记证详情" fields={detailFields} data={detailData} />
      <DeleteDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} description={`确定要删除登记证「${deleteName}」吗？删除后将无法恢复。`} />
    </div>
  );
}
