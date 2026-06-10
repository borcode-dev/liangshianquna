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
import { ArrowLeft, Save, Send, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface OutboundRecord {
  id: number;
  orderNo: string;
  enterprise: string;
  date: string;
  type: string;
  buyerType: string;
  buyerName: string;
  buyerIdCard: string;
  buyerPhone: string;
  buyerRegion: string;
  buyerAddress: string;
  productName: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  purpose: string;
  createdAt: string;
}

const initialForm = {
  enterprise: '',
  date: '',
  type: 'sale',
  buyerType: 'farmer',
  buyerName: '',
  buyerIdCard: '',
  buyerPhone: '',
  buyerCity: '',
  buyerCounty: '',
  buyerAddress: '',
  productName: '',
  quantity: '',
  unit: 'L',
  unitPrice: '',
  purpose: 'agri',
};

function generateOutboundOrderNo(records: OutboundRecord[]): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const dateStr = `${y}${m}${d}`;
  const prefix = `CK-${dateStr}-`;
  const todayRecords = records.filter((r) => r.orderNo.startsWith(prefix));
  const seq = todayRecords.length + 1;
  return `${prefix}${String(seq).padStart(2, '0')}`;
}

export default function OutboundPage() {
  const router = useRouter();
  const [records, setRecords] = useLocalStorage<OutboundRecord[]>('outbound-records', []);
  const [form, setForm] = useState(initialForm);

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (): boolean => {
    if (!form.productName) {
      toast.error('请填写产品名称');
      return false;
    }
    if (!form.quantity) {
      toast.error('请填写数量');
      return false;
    }
    if (!form.buyerName) {
      toast.error('请填写购买方名称');
      return false;
    }
    return true;
  };

  const buildRecord = (): OutboundRecord => {
    const orderNo = generateOutboundOrderNo(records);
    return {
      id: Date.now(),
      orderNo,
      enterprise: form.enterprise,
      date: form.date,
      type: form.type,
      buyerType: form.buyerType,
      buyerName: form.buyerName,
      buyerIdCard: form.buyerIdCard,
      buyerPhone: form.buyerPhone,
      buyerRegion: `${form.buyerCity}${form.buyerCounty}`,
      buyerAddress: form.buyerAddress,
      productName: form.productName,
      quantity: form.quantity,
      unit: form.unit,
      unitPrice: form.unitPrice,
      purpose: form.purpose,
      createdAt: new Date().toISOString(),
    };
  };

  const handleSave = () => {
    if (!validate()) return;
    const record = buildRecord();
    setRecords((prev) => [...prev, record]);
    toast.success('出库记录已保存', { description: `单号：${record.orderNo}` });
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const record = buildRecord();
    setRecords((prev) => [...prev, record]);
    toast.success('出库记录已提交', { description: `单号：${record.orderNo}` });
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
          <h1 className="text-xl font-semibold">农药出库登记</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave}><Save className="mr-1 h-4 w-4" />保存</Button>
          <Button onClick={handleSubmit}><Send className="mr-1 h-4 w-4" />提交</Button>
        </div>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">出库基本信息</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>出库单号</Label>
              <Input value="保存后自动生成" disabled />
            </div>
            <div className="space-y-2">
              <Label>出库企业</Label>
              <Select value={form.enterprise} onValueChange={(v) => updateForm('enterprise', v)}>
                <SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="怀远县农技服务站">怀远县农技服务站</SelectItem>
                  <SelectItem value="阜阳农药批发中心">阜阳农药批发中心</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>出库日期</Label>
              <Input type="date" value={form.date} onChange={(e) => updateForm('date', e.target.value)} />
            </div>
            <div className="space-y-2 lg:col-span-3">
              <Label>出库类型</Label>
              <RadioGroup value={form.type} onValueChange={(v) => updateForm('type', v)} className="flex gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="sale" id="s1" /><Label htmlFor="s1">销售出库</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="return" id="s2" /><Label htmlFor="s2">退货出库</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="damage" id="s3" /><Label htmlFor="s3">报损出库</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="other" id="s4" /><Label htmlFor="s4">其他</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Buyer Info */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">购买方信息（销售出库时必填）</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>购买方类型</Label>
              <RadioGroup value={form.buyerType} onValueChange={(v) => updateForm('buyerType', v)} className="flex gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="farmer" id="b1" /><Label htmlFor="b1">农户</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="company" id="b2" /><Label htmlFor="b2">农业企业</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="coop" id="b3" /><Label htmlFor="b3">合作社</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="other" id="b4" /><Label htmlFor="b4">其他</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label>购买方名称 <span className="text-red-500">*</span></Label>
              <Input placeholder="农户/企业名称" value={form.buyerName} onChange={(e) => updateForm('buyerName', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>身份证号</Label>
              <Input placeholder="农户必填" value={form.buyerIdCard} onChange={(e) => updateForm('buyerIdCard', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>联系电话</Label>
              <Input placeholder="手机号" value={form.buyerPhone} onChange={(e) => updateForm('buyerPhone', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>所在地区</Label>
              <div className="flex gap-2">
                <Select value={form.buyerCity} onValueChange={(v) => updateForm('buyerCity', v)}>
                  <SelectTrigger className="w-[100px]"><SelectValue placeholder="市" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="蚌埠市">蚌埠市</SelectItem>
                    <SelectItem value="阜阳市">阜阳市</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={form.buyerCounty} onValueChange={(v) => updateForm('buyerCounty', v)}>
                  <SelectTrigger className="w-[100px]"><SelectValue placeholder="县" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="怀远县">怀远县</SelectItem>
                    <SelectItem value="固镇县">固镇县</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>详细地址</Label>
              <Input placeholder="详细地址" value={form.buyerAddress} onChange={(e) => updateForm('buyerAddress', e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Details */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">出库产品明细</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 text-left font-medium">农药名称 <span className="text-red-500">*</span></th>
                  <th className="pb-2 text-left font-medium">登记证号</th>
                  <th className="pb-2 text-left font-medium">当前库存</th>
                  <th className="pb-2 text-left font-medium">数量 <span className="text-red-500">*</span></th>
                  <th className="pb-2 text-left font-medium">单价</th>
                  <th className="pb-2 text-left font-medium">金额</th>
                  <th className="pb-2 text-left font-medium">购买用途</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">
                    <Input className="w-[120px]" value={form.productName} onChange={(e) => updateForm('productName', e.target.value)} placeholder="农药名称" />
                  </td>
                  <td className="font-mono">PD20101001</td>
                  <td>8吨</td>
                  <td><Input className="w-[80px]" type="number" value={form.quantity} onChange={(e) => updateForm('quantity', e.target.value)} />{form.unit}</td>
                  <td><Input className="w-[100px]" type="number" value={form.unitPrice} onChange={(e) => updateForm('unitPrice', e.target.value)} />元</td>
                  <td className="font-medium">
                    {form.quantity && form.unitPrice
                      ? `${(Number(form.quantity) * Number(form.unitPrice)).toLocaleString()}元`
                      : '-'}
                  </td>
                  <td>
                    <Select value={form.purpose} onValueChange={(v) => updateForm('purpose', v)}>
                      <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agri">农业生产</SelectItem>
                        <SelectItem value="self">自用</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="font-medium">
                  <td colSpan={3}>合计</td>
                  <td>{form.quantity ? `${form.quantity}${form.unit}` : '-'}</td>
                  <td></td>
                  <td>{form.quantity && form.unitPrice ? `${(Number(form.quantity) * Number(form.unitPrice)).toLocaleString()}元` : '-'}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
          <Button variant="outline" size="sm" className="mt-3">+ 添加产品</Button>
        </CardContent>
      </Card>

      {/* Restricted Pesticide Warning */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
            <div>
              <p>该农药为一般毒性以下农药，可正常销售。</p>
              <p className="mt-1 text-muted-foreground">如销售限制使用农药，需查验购买方资质（限制农药经营许可证）。</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
