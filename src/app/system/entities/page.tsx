"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Upload, Download, Eye, Pencil, Trash2 } from "lucide-react";
import { productionEnterprises as initProd, businessEnterprises as initBiz } from "@/lib/mock-data";
import { FormModal, type FormField, DetailModal, type DetailField, DeleteDialog } from "@/components/crud";
import { toast } from "sonner";

type ProdEntity = (typeof initProd)[number] & { id: string; entityType?: string; attachment?: string };
type BizEntity = (typeof initBiz)[number] & { id: string; entityType?: string; attachment?: string };
type EntityItem = ProdEntity | BizEntity;

const prodFormFields: FormField[] = [
  { name: "name", label: "企业名称", type: "text", required: true, placeholder: "请输入企业全称" },
  { name: "creditCode", label: "统一社会信用代码", type: "text", required: true, placeholder: "18位信用代码" },
  { name: "legalPerson", label: "法定代表人", type: "text", required: true },
  { name: "phone", label: "联系电话", type: "text", required: true, placeholder: "0552-XXXXXXX" },
  { name: "region", label: "所在地区", type: "select", required: true, options: [
    { label: "蚌埠市", value: "蚌埠市" }, { label: "合肥市", value: "合肥市" },
    { label: "阜阳市", value: "阜阳市" }, { label: "宿州市", value: "宿州市" },
    { label: "滁州市", value: "滁州市" }, { label: "芜湖市", value: "芜湖市" },
  ]},
  { name: "address", label: "详细地址", type: "text", required: true, colSpan: 2 },
  { name: "licenseNo", label: "生产许可证号", type: "text", required: true, placeholder: "WP-XXXXXXX" },
  { name: "licenseExpiry", label: "许可证有效期至", type: "date", required: true },
  { name: "productionType", label: "生产类型", type: "select", required: true, options: [
    { label: "原药+制剂", value: "原药+制剂" }, { label: "原药", value: "原药" }, { label: "制剂", value: "制剂" },
  ]},
  { name: "status", label: "状态", type: "select", required: true, options: [
    { label: "正常", value: "正常" }, { label: "临期", value: "临期" }, { label: "过期", value: "过期" }, { label: "整改中", value: "整改中" },
  ]},
  { name: "creditGrade", label: "诚信等级", type: "select", required: true, options: [
    { label: "A级", value: "A" }, { label: "B级", value: "B" }, { label: "C级", value: "C" }, { label: "D级", value: "D" },
  ]},
  { name: "attachment", label: "附件材料", type: "file", accept: ".pdf,.doc,.docx,image/*" },
];

const bizFormFields: FormField[] = [
  { name: "name", label: "企业名称", type: "text", required: true, placeholder: "请输入企业全称" },
  { name: "creditCode", label: "统一社会信用代码", type: "text", required: true, placeholder: "18位信用代码" },
  { name: "legalPerson", label: "法定代表人", type: "text", required: true },
  { name: "phone", label: "联系电话", type: "text", required: true },
  { name: "region", label: "所在地区", type: "select", required: true, options: [
    { label: "蚌埠市", value: "蚌埠市" }, { label: "合肥市", value: "合肥市" },
    { label: "阜阳市", value: "阜阳市" }, { label: "宿州市", value: "宿州市" },
    { label: "滁州市", value: "滁州市" }, { label: "芜湖市", value: "芜湖市" },
  ]},
  { name: "address", label: "详细地址", type: "text", required: true, colSpan: 2 },
  { name: "licenseNo", label: "经营许可证号", type: "text", required: true, placeholder: "JY-XXXXXXX" },
  { name: "licenseExpiry", label: "许可证有效期至", type: "date", required: true },
  { name: "type", label: "经营类型", type: "select", required: true, options: [
    { label: "批发+零售", value: "批发+零售" }, { label: "批发", value: "批发" }, { label: "零售", value: "零售" },
  ]},
  { name: "status", label: "状态", type: "select", required: true, options: [
    { label: "正常", value: "正常" }, { label: "临期", value: "临期" }, { label: "过期", value: "过期" }, { label: "整改中", value: "整改中" },
  ]},
  { name: "creditGrade", label: "诚信等级", type: "select", required: true, options: [
    { label: "A级", value: "A" }, { label: "B级", value: "B" }, { label: "C级", value: "C" }, { label: "D级", value: "D" },
  ]},
  { name: "attachment", label: "附件材料", type: "file", accept: ".pdf,.doc,.docx,image/*" },
];

const prodDetailFields: DetailField[] = [
  { name: "name", label: "企业名称" },
  { name: "creditCode", label: "统一社会信用代码" },
  { name: "legalPerson", label: "法定代表人" },
  { name: "phone", label: "联系电话" },
  { name: "region", label: "所在地区" },
  { name: "address", label: "详细地址" },
  { name: "licenseNo", label: "生产许可证号" },
  { name: "licenseExpiry", label: "许可证有效期至" },
  { name: "productionType", label: "生产类型" },
  { name: "status", label: "状态", type: "badge" },
  { name: "creditGrade", label: "诚信等级" },
  { name: "attachment", label: "附件材料", type: "file" },
];

const bizDetailFields: DetailField[] = [
  { name: "name", label: "企业名称" },
  { name: "creditCode", label: "统一社会信用代码" },
  { name: "legalPerson", label: "法定代表人" },
  { name: "phone", label: "联系电话" },
  { name: "region", label: "所在地区" },
  { name: "address", label: "详细地址" },
  { name: "licenseNo", label: "经营许可证号" },
  { name: "licenseExpiry", label: "许可证有效期至" },
  { name: "type", label: "经营类型" },
  { name: "status", label: "状态", type: "badge" },
  { name: "creditGrade", label: "诚信等级" },
  { name: "attachment", label: "附件材料", type: "file" },
];

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={status === "正常" ? "secondary" : status === "临期" ? "outline" : "destructive"}
      className={`text-xs ${status === "临期" ? "border-amber-500 text-amber-600" : ""}`}>
      {status === "正常" ? "🟢" : status === "临期" ? "🟡" : status === "过期" ? "🔴" : "🟠"} {status}
    </Badge>
  );
}

function CreditBadge({ grade }: { grade: string }) {
  return <Badge variant={grade === "A" ? "secondary" : grade === "B" ? "outline" : "destructive"} className="text-xs">{grade}级</Badge>;
}

export default function EntityManagementPage() {
  const [tab, setTab] = useState("production");
  const [searchTerm, setSearchTerm] = useState("");
  const [prodData, setProdData] = useState<ProdEntity[]>(initProd.map((e) => ({ ...e, entityType: "生产" })));
  const [bizData, setBizData] = useState<BizEntity[]>(initBiz.map((e) => ({ ...e, entityType: "经营" })));

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<Record<string, unknown> | null>(null);
  const [detailFields, setDetailFields] = useState<DetailField[]>(prodDetailFields);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState("");

  const isProd = tab === "production";
  const currentData = isProd ? prodData : bizData;

  const filteredData = useMemo(
    () => currentData.filter((e) => !searchTerm || e.name.includes(searchTerm)),
    [currentData, searchTerm]
  );

  const openAdd = () => {
    setFormMode("add");
    setFormValues({ status: "正常", creditGrade: "A", ...(isProd ? { productionType: "制剂" } : { type: "零售" }) });
    setEditingId(null);
    setFormOpen(true);
  };

  const openEdit = (item: EntityItem) => {
    setFormMode("edit");
    setFormValues({ ...item });
    setEditingId(item.id);
    setFormOpen(true);
  };

  const openDetail = (item: EntityItem) => {
    setDetailData({ ...item, creditGrade: `${item.creditGrade}级` });
    setDetailFields(isProd ? prodDetailFields : bizDetailFields);
    setDetailOpen(true);
  };

  const openDelete = (item: EntityItem) => {
    setDeleteId(item.id);
    setDeleteName(item.name);
    setDeleteOpen(true);
  };

  const handleFormChange = (name: string, value: unknown) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = () => {
    if (formMode === "add") {
      const newItem = { ...formValues, id: `${tab}-${Date.now()}`, entityType: isProd ? "生产" : "经营" } as EntityItem;
      if (isProd) setProdData((prev) => [newItem as ProdEntity, ...prev]);
      else setBizData((prev) => [newItem as BizEntity, ...prev]);
      toast.success("新增成功", { description: `企业「${formValues.name}」已添加` });
    } else {
      if (isProd) setProdData((prev) => prev.map((item) => item.id === editingId ? { ...item, ...formValues } as ProdEntity : item));
      else setBizData((prev) => prev.map((item) => item.id === editingId ? { ...item, ...formValues } as BizEntity : item));
      toast.success("编辑成功", { description: `企业「${formValues.name}」已更新` });
    }
    setFormOpen(false);
  };

  const handleDelete = () => {
    if (isProd) setProdData((prev) => prev.filter((item) => item.id !== deleteId));
    else setBizData((prev) => prev.filter((item) => item.id !== deleteId));
    toast.success("删除成功", { description: `企业「${deleteName}」已删除` });
    setDeleteOpen(false);
  };

  const currentFormFields = isProd ? prodFormFields : bizFormFields;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">主体管理</h1>
        <div className="flex gap-2">
          <Button onClick={openAdd}><Plus className="mr-1 h-4 w-4" />新增主体</Button>
          <Button variant="outline"><Upload className="mr-1 h-4 w-4" />批量导入</Button>
          <Button variant="outline"><Download className="mr-1 h-4 w-4" />导出</Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="production">生产企业 ({prodData.length})</TabsTrigger>
          <TabsTrigger value="business">经营企业 ({bizData.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="production" className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="搜索企业名称..." className="w-[200px] pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>企业名称</TableHead>
                    <TableHead>统一社会信用代码</TableHead>
                    <TableHead>所在地区</TableHead>
                    <TableHead>许可证号</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>诚信等级</TableHead>
                    <TableHead className="text-center w-[200px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.name}</TableCell>
                      <TableCell className="font-mono text-xs">{e.creditCode}</TableCell>
                      <TableCell>{e.region}</TableCell>
                      <TableCell className="font-mono text-xs">{e.licenseNo}</TableCell>
                      <TableCell><StatusBadge status={e.status} /></TableCell>
                      <TableCell><CreditBadge grade={e.creditGrade} /></TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openDetail(e)}><Eye className="mr-0.5 h-3.5 w-3.5" />查看</Button>
                          <Button variant="ghost" size="sm" onClick={() => openEdit(e)}><Pencil className="mr-0.5 h-3.5 w-3.5" />编辑</Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => openDelete(e)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="搜索企业名称..." className="w-[200px] pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>企业名称</TableHead>
                    <TableHead>经营类型</TableHead>
                    <TableHead>所在地区</TableHead>
                    <TableHead>许可证号</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>诚信等级</TableHead>
                    <TableHead className="text-center w-[200px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.name}</TableCell>
                      <TableCell>{e.type}</TableCell>
                      <TableCell>{e.region}</TableCell>
                      <TableCell className="font-mono text-xs">{e.licenseNo}</TableCell>
                      <TableCell><StatusBadge status={e.status} /></TableCell>
                      <TableCell><CreditBadge grade={e.creditGrade} /></TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openDetail(e)}><Eye className="mr-0.5 h-3.5 w-3.5" />查看</Button>
                          <Button variant="ghost" size="sm" onClick={() => openEdit(e)}><Pencil className="mr-0.5 h-3.5 w-3.5" />编辑</Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => openDelete(e)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <FormModal
        open={formOpen} onClose={() => setFormOpen(false)}
        title={formMode === "add" ? `新增${isProd ? "生产" : "经营"}企业` : `编辑${isProd ? "生产" : "经营"}企业`}
        fields={currentFormFields} values={formValues} onChange={handleFormChange} onSubmit={handleFormSubmit}
      />
      <DetailModal open={detailOpen} onClose={() => setDetailOpen(false)} title={`${isProd ? "生产" : "经营"}企业详情`} fields={detailFields} data={detailData} />
      <DeleteDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} description={`确定要删除企业「${deleteName}」吗？删除后将无法恢复。`} />
    </div>
  );
}
