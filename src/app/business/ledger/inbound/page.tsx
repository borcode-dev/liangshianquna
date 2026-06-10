'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Save, Send } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { productionProducts } from '@/lib/mock-data';

interface InboundRecord {
  id: number;
  orderNo: string;
  enterprise: string;
  date: string;
  type: string;
  supplier: string;
  supplierContact: string;
  supplierPhone: string;
  invoiceNo: string;
  invoiceDate: string;
  productName: string;
  regNo: string;
  batchNo: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  warehouse: string;
  location: string;
  createdAt: string;
}

const initialForm = {
  enterprise: '',
  date: '',
  type: 'purchase',
  supplier: '',
  supplierContact: '',
  supplierPhone: '',
  invoiceNo: '',
  invoiceDate: '',
  selectedRegNo: 'PD20101001',
  batchNo: '',
  quantity: '',
  unit: '吨',
  unitPrice: '',
  warehouse: '',
  location: '',
};

function generateInboundOrderNo(records: InboundRecord[]): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const dateStr = `${y}${m}${d}`;
  const prefix = `RK-${dateStr}-`;
  const todayRecords = records.filter((r) => r.orderNo.startsWith(prefix));
  const seq = todayRecords.length + 1;
  return `${prefix}${String(seq).padStart(2, '0')}`;
}

export default function InboundPage() {
  const router = useRouter();
  const [records, setRecords] = useLocalStorage<InboundRecord[]>('inbound-records', []);
  const [form, setForm] = useState(initialForm);

  const selectedProduct = productionProducts.find((p) => p.regNo === form.selectedRegNo);

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (): boolean => {
    if (!selectedProduct) {
      toast.error('请选择产品名称');
      return false;
    }
    if (!form.quantity) {
      toast.error('请填写数量');
      return false;
    }
    if (!form.supplier) {
      toast.error('请选择供货单位');
      return false;
    }
    return true;
  };

  const buildRecord = (): InboundRecord => {
    const orderNo = generateInboundOrderNo(records);
    return {
      id: Date.now(),
      orderNo,
      enterprise: form.enterprise,
      date: form.date,
      type: form.type,
      supplier: form.supplier,
      supplierContact: form.supplierContact,
      supplierPhone: form.supplierPhone,
      invoiceNo: form.invoiceNo,
      invoiceDate: form.invoiceDate,
      productName: selectedProduct?.name ?? '',
      regNo: form.selectedRegNo,
      batchNo: form.batchNo,
      quantity: form.quantity,
      unit: form.unit,
      unitPrice: form.unitPrice,
      warehouse: form.warehouse,
      location: form.location,
      createdAt: new Date().toISOString(),
    };
  };

  const handleSave = () => {
    if (!validate()) return;
    const record = buildRecord();
    setRecords((prev) => [...prev, record]);
    toast.success('入库记录已保存', { description: `单号：${record.orderNo}` });
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const record = buildRecord();
    setRecords((prev) => [...prev, record]);
    toast.success('入库记录已提交', { description: `单号：${record.orderNo}` });
    setForm(initialForm);
    router.push('/business/ledger');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/business/ledger">
            <Button variant="ghost" size="sm"><ArrowLeft className="mr-1 h-4 w-4" />返回</Button>
          </Link>
          <h1 className="text-xl font-semibold">农药入库登记</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave}><Save className="mr-1 h-4 w-4" />保存</Button>
          <Button onClick={handleSubmit}><Send className="mr-1 h-4 w-4" />提交</Button>
        </div>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">入库基本信息</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>入库单号</Label>
              <Input value="保存后自动生成" disabled />
            </div>
            <div className="space-y-2">
              <Label>入库企业</Label>
              <Select value={form.enterprise} onValueChange={(v) => updateForm('enterprise', v)}>
                <SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="怀远县农技服务站">怀远县农技服务站</SelectItem>
                  <SelectItem value="阜阳农药批发中心">阜阳农药批发中心</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>入库日期</Label>
              <Input type="date" value={form.date} onChange={(e) => updateForm('date', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>入库类型</Label>
              <RadioGroup value={form.type} onValueChange={(v) => updateForm('type', v)} className="flex gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="purchase" id="r1" /><Label htmlFor="r1">采购入库</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="return" id="r2" /><Label htmlFor="r2">退货入库</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="other" id="r3" /><Label htmlFor="r3">其他</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supplier Info */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">供货方信息</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>供货单位 <span className="text-red-500">*</span></Label>
              <Select value={form.supplier} onValueChange={(v) => updateForm('supplier', v)}>
                <SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="安徽农药化工集团">安徽农药化工集团</SelectItem>
                  <SelectItem value="蚌埠农化股份公司">蚌埠农化股份公司</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>联系人</Label>
              <Input placeholder="联系人" value={form.supplierContact} onChange={(e) => updateForm('supplierContact', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>联系电话</Label>
              <Input placeholder="联系电话" value={form.supplierPhone} onChange={(e) => updateForm('supplierPhone', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>发票号</Label>
              <Input placeholder="发票号" value={form.invoiceNo} onChange={(e) => updateForm('invoiceNo', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>发票日期</Label>
              <Input type="date" value={form.invoiceDate} onChange={(e) => updateForm('invoiceDate', e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Details */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">入库产品明细</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 text-left font-medium">农药名称 <span className="text-red-500">*</span></th>
                  <th className="pb-2 text-left font-medium">登记证号</th>
                  <th className="pb-2 text-left font-medium">批次号</th>
                  <th className="pb-2 text-left font-medium">生产日期</th>
                  <th className="pb-2 text-left font-medium">数量 <span className="text-red-500">*</span></th>
                  <th className="pb-2 text-left font-medium">单价</th>
                  <th className="pb-2 text-left font-medium">金额</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-2">
                    <Select value={form.selectedRegNo} onValueChange={(v) => updateForm('selectedRegNo', v)}>
                      <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {productionProducts.map((p) => (
                          <SelectItem key={p.regNo} value={p.regNo}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="font-mono">{form.selectedRegNo}</td>
                  <td><Input className="w-[120px]" value={form.batchNo} onChange={(e) => updateForm('batchNo', e.target.value)} placeholder="批次号" /></td>
                  <td>06-01</td>
                  <td><Input className="w-[80px]" type="number" value={form.quantity} onChange={(e) => updateForm('quantity', e.target.value)} />{form.unit}</td>
                  <td><Input className="w-[100px]" type="number" value={form.unitPrice} onChange={(e) => updateForm('unitPrice', e.target.value)} /></td>
                  <td className="font-medium">
                    {form.quantity && form.unitPrice
                      ? `${(Number(form.quantity) * Number(form.unitPrice) / 10000).toFixed(1)}万`
                      : '-'}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t font-medium">
                  <td colSpan={4}>合计</td>
                  <td>{form.quantity ? `${form.quantity}${form.unit}` : '-'}</td>
                  <td></td>
                  <td>{form.quantity && form.unitPrice ? `${(Number(form.quantity) * Number(form.unitPrice) / 10000).toFixed(1)}万元` : '-'}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <Button variant="outline" size="sm" className="mt-3">+ 添加产品</Button>
        </CardContent>
      </Card>

      {/* Auto-filled Product Detail */}
      {selectedProduct && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">农药产品详情（自动带出）</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm lg:grid-cols-3">
              <div><span className="text-muted-foreground">农药名称：</span>{selectedProduct.name}</div>
              <div><span className="text-muted-foreground">登记证号：</span>{selectedProduct.regNo}</div>
              <div><span className="text-muted-foreground">剂型：</span>{selectedProduct.form}</div>
              <div><span className="text-muted-foreground">毒性：</span>{selectedProduct.toxicity}</div>
              <div><span className="text-muted-foreground">有效成分：</span>{selectedProduct.content}</div>
              <div><span className="text-muted-foreground">有效期至：</span>{selectedProduct.expiry}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Storage Info */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">存储信息</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label>存放仓库</Label>
              <Select value={form.warehouse} onValueChange={(v) => updateForm('warehouse', v)}>
                <SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1号仓库">1号仓库</SelectItem>
                  <SelectItem value="2号仓库">2号仓库</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>存放位置</Label>
              <Select value={form.location} onValueChange={(v) => updateForm('location', v)}>
                <SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="农药货架A区-03">农药货架A区-03</SelectItem>
                  <SelectItem value="农药货架B区-01">农药货架B区-01</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
