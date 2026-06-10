'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Download, Printer, FileText, ArrowDown } from 'lucide-react';
import { inboundRecords, outboundRecords, inventoryData, businessEnterprises, pesticideRegistrations } from '@/lib/mock-data';
import { toast } from 'sonner';

export default function BusinessTrackingPage() {
  const [enterpriseFilter, setEnterpriseFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');
  const [flowType, setFlowType] = useState('all');
  const [searchText, setSearchText] = useState('');

  const parseQuantity = (q: string) => parseFloat(q.replace(/[^\d.]/g, '')) || 0;
  const parseAmount = (a: string) => parseFloat(a.replace(/[^\d.]/g, '')) || 0;

  // 数据闭环：根据筛选条件过滤入库/出库/库存数据
  const filteredInbound = useMemo(() => {
    let result = inboundRecords;
    if (enterpriseFilter !== 'all') result = result.filter((r) => r.enterpriseId === enterpriseFilter);
    if (productFilter !== 'all') result = result.filter((r) => r.regNo === productFilter);
    if (searchText) result = result.filter((r) => r.product.includes(searchText));
    return result;
  }, [enterpriseFilter, productFilter, searchText]);

  const filteredOutbound = useMemo(() => {
    let result = outboundRecords;
    if (enterpriseFilter !== 'all') result = result.filter((r) => r.enterpriseId === enterpriseFilter);
    if (productFilter !== 'all') result = result.filter((r) => r.regNo === productFilter);
    if (searchText) result = result.filter((r) => r.product.includes(searchText));
    return result;
  }, [enterpriseFilter, productFilter, searchText]);

  const filteredInventory = useMemo(() => {
    let result = inventoryData;
    if (enterpriseFilter !== 'all') result = result.filter((r) => r.enterpriseId === enterpriseFilter);
    if (productFilter !== 'all') result = result.filter((r) => r.regNo === productFilter);
    if (searchText) result = result.filter((r) => r.productName.includes(searchText));
    return result;
  }, [enterpriseFilter, productFilter, searchText]);

  // 选择第一条出库记录作为默认展示的追踪详情
  const selectedOutbound = filteredOutbound[0];

  // 汇总统计
  const totalInboundQty = filteredInbound.reduce((sum, r) => sum + parseQuantity(r.quantity), 0);
  const totalInboundAmount = filteredInbound.reduce((sum, r) => sum + parseAmount(r.amount), 0);
  const totalOutboundQty = filteredOutbound.length;
  const totalOutboundAmount = filteredOutbound.reduce((sum, r) => sum + parseAmount(r.amount), 0);
  const totalStock = filteredInventory.reduce((sum, i) => sum + i.stock, 0);
  const outRate = totalInboundQty > 0 ? Math.round(((totalInboundQty - totalStock) / totalInboundQty) * 100) : 0;

  const handleExport = () => {
    const headers = ['出库单号', '购买方', '产品', '数量', '金额', '出库日期', '购买用途', '状态'];
    const rows = filteredOutbound.map((r) => [r.orderNo, r.buyer, r.product, r.quantity, r.amount, r.date, r.purpose, r.status]);
    const csv = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `经营流向追踪_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('导出成功', { description: `已导出 ${filteredOutbound.length} 条出库明细` });
  };

  const handlePrint = () => {
    window.print();
    toast.success('已调用打印');
  };

  const handleTraceReport = () => {
    const now = new Date().toLocaleString('zh-CN');
    const lines = [
      '═══════════════════════════════════════',
      '          经营流向追溯报告',
      '═══════════════════════════════════════',
      '',
      `生成时间：${now}`,
      '',
      '【汇总统计】',
      `采购总量：${totalInboundQty}吨`,
      `采购总额：${totalInboundAmount.toFixed(1)}万元`,
      `销售总额：${totalOutboundAmount.toFixed(1)}万元`,
      `在库库存：${totalStock}吨`,
      `出库率：${outRate}%`,
      `可追溯率：100%`,
      '',
      '【销售出库明细】',
      ...filteredOutbound.map((r, i) => `  ${i + 1}. ${r.orderNo} | ${r.buyer} | ${r.product} | ${r.quantity} | ${r.amount} | ${r.date} | ${r.purpose} | ${r.status}`),
      '',
      '═══════════════════════════════════════',
    ];
    const text = lines.join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `追溯报告_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('追溯报告已生成', { description: `包含 ${filteredOutbound.length} 条出库记录` });
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">经营流向追踪</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="mr-1 h-3.5 w-3.5" />导出</Button>
          <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="mr-1 h-3.5 w-3.5" />打印</Button>
          <Button variant="outline" size="sm" onClick={handleTraceReport}><FileText className="mr-1 h-3.5 w-3.5" />追溯报告</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={enterpriseFilter} onValueChange={setEnterpriseFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="企业名称" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部企业</SelectItem>
            {businessEnterprises.slice(0, 10).map((e) => (
              <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={productFilter} onValueChange={setProductFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="产品名称" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部产品</SelectItem>
            {pesticideRegistrations.map((p) => (
              <SelectItem key={p.regNo} value={p.regNo}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={flowType} onValueChange={setFlowType}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="流向类型" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="inbound">入库</SelectItem>
            <SelectItem value="outbound">出库</SelectItem>
          </SelectContent>
        </Select>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="搜索产品..." className="w-[200px] pl-9" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
        </div>
      </div>

      {/* Flow Detail */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">经营流向追踪</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Flow Steps */}
          <div className="flex items-center justify-center gap-4 py-4">
            <div className="flex flex-col items-center gap-1">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white text-sm font-medium">{totalInboundQty}吨</div>
              <span className="text-xs">采购入库</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <ArrowDown className="h-4 w-4 rotate-[-90deg]" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 text-white text-sm font-medium">{totalStock}吨</div>
              <span className="text-xs">在库库存</span>
              <span className="text-xs text-muted-foreground">出库率 {outRate}%</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <ArrowDown className="h-4 w-4 rotate-[-90deg]" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white text-sm font-medium">{filteredOutbound.length}笔</div>
              <span className="text-xs">销售出库</span>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="rounded-lg border p-3 text-center">
              <p className="text-lg font-semibold text-primary">{totalInboundQty}吨</p>
              <p className="text-sm text-muted-foreground">采购总量</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-lg font-semibold text-primary">{totalInboundAmount.toFixed(1)}万元</p>
              <p className="text-sm text-muted-foreground">采购总额</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-lg font-semibold text-green-600">{totalOutboundAmount.toFixed(1)}万元</p>
              <p className="text-sm text-muted-foreground">销售总额</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-lg font-semibold text-green-600">100%</p>
              <p className="text-sm text-muted-foreground">可追溯率</p>
            </div>
          </div>

          {/* Outbound Detail Table */}
          <div>
            <h4 className="mb-3 text-sm font-medium">销售出库明细（共{filteredOutbound.length}笔）</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>出库单号</TableHead>
                  <TableHead>购买方</TableHead>
                  <TableHead>产品</TableHead>
                  <TableHead>数量</TableHead>
                  <TableHead>金额</TableHead>
                  <TableHead>出库日期</TableHead>
                  <TableHead>购买用途</TableHead>
                  <TableHead>状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOutbound.slice(0, 10).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-sm">{r.orderNo}</TableCell>
                    <TableCell className="font-medium">{r.buyer}</TableCell>
                    <TableCell>{r.product}</TableCell>
                    <TableCell>{r.quantity}</TableCell>
                    <TableCell>{r.amount}</TableCell>
                    <TableCell>{r.date}</TableCell>
                    <TableCell>{r.purpose}</TableCell>
                    <TableCell>
                      <Badge variant={r.status === '已出库' ? 'default' : 'secondary'}>{r.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Inventory Table */}
          {flowType === 'all' || flowType === 'inbound' ? (
            <div>
              <h4 className="mb-3 text-sm font-medium">在库库存明细（共{filteredInventory.length}种产品）</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>产品名称</TableHead>
                    <TableHead>登记证号</TableHead>
                    <TableHead>库存量(吨)</TableHead>
                    <TableHead>安全库存(吨)</TableHead>
                    <TableHead>有效期至</TableHead>
                    <TableHead>状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.slice(0, 8).map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell className="font-mono text-sm">{item.regNo}</TableCell>
                      <TableCell>{item.stock}</TableCell>
                      <TableCell>{item.safeStock}</TableCell>
                      <TableCell>{item.expiry}</TableCell>
                      <TableCell>
                        <Badge variant={item.status === '正常' ? 'default' : item.status === '不足' ? 'destructive' : 'secondary'}>
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
