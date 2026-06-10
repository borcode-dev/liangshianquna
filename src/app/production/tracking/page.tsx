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
import { Search, Download, Printer, FileText, ArrowRight } from 'lucide-react';
import { productionLedger, productionFlowSales, productionEnterprises } from '@/lib/mock-data';

export default function ProductionTrackingPage() {
  const [selectedBatch, setSelectedBatch] = useState(productionLedger[0].batchNo);
  const [enterpriseFilter, setEnterpriseFilter] = useState('all');
  const [searchText, setSearchText] = useState('');

  const selected = productionLedger.find((l) => l.batchNo === selectedBatch) || productionLedger[0];
  const outRate = selected.output > 0 ? Math.round((selected.sold / selected.output) * 100) : 0;

  // 数据闭环：从 productionFlowSales 获取该批次的销售流向
  const batchSales = useMemo(() => {
    return productionFlowSales.filter((s) => s.batchNo === selectedBatch);
  }, [selectedBatch]);

  // 过滤批次
  const filteredBatches = useMemo(() => {
    let result = productionLedger;
    if (enterpriseFilter !== 'all') {
      result = result.filter((l) => l.enterpriseId === enterpriseFilter);
    }
    if (searchText) {
      result = result.filter((l) => l.productName.includes(searchText));
    }
    return result;
  }, [enterpriseFilter, searchText]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">生产流向追踪</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="mr-1 h-3.5 w-3.5" />导出</Button>
          <Button variant="outline" size="sm"><Printer className="mr-1 h-3.5 w-3.5" />打印</Button>
          <Button variant="outline" size="sm"><FileText className="mr-1 h-3.5 w-3.5" />追溯报告</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={selectedBatch} onValueChange={setSelectedBatch}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="批次编号" />
          </SelectTrigger>
          <SelectContent>
            {filteredBatches.map((l) => (
              <SelectItem key={l.batchNo} value={l.batchNo}>
                {l.batchNo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={enterpriseFilter} onValueChange={setEnterpriseFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="生产企业" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部企业</SelectItem>
            {productionEnterprises.map((e) => (
              <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="搜索产品名称..." className="w-[200px] pl-9" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
        </div>
      </div>

      {/* Flow Tracking */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            流向追踪 - 批次编号：{selected.batchNo}
          </CardTitle>
          <div className="mt-1 flex gap-4 text-sm text-muted-foreground">
            <span>产品：{selected.productName}</span>
            <span>产量：{selected.output}吨</span>
            <span>生产企业：{selected.enterprise}</span>
            <span>生产日期：{selected.date}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Flow Steps */}
          <div className="flex items-center justify-center gap-2 py-4">
            {['生产入库', '库存', '销售出库', '经销商', '零售商', '农户'].map((step, i) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center gap-1">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full text-xs font-medium ${
                    i <= 2 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {i === 0 ? `${selected.output}` : i === 2 ? `${selected.sold}` : ''}
                  </div>
                  <span className="text-xs">{step}</span>
                </div>
                {i < 5 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
              </React.Fragment>
            ))}
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border p-3 text-center">
              <p className="text-lg font-semibold text-primary">{selected.stock}吨</p>
              <p className="text-sm text-muted-foreground">当前库存</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-lg font-semibold text-primary">{outRate}%</p>
              <p className="text-sm text-muted-foreground">出库率</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-lg font-semibold text-green-600">100%</p>
              <p className="text-sm text-muted-foreground">可追溯率</p>
            </div>
          </div>

          {/* Sales Detail - 数据闭环：使用 productionFlowSales */}
          <div>
            <h4 className="mb-3 text-sm font-medium">
              销售明细（共{batchSales.length}笔）
            </h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>购买方</TableHead>
                  <TableHead>购买量(吨)</TableHead>
                  <TableHead>购买日期</TableHead>
                  <TableHead>流向地区</TableHead>
                  <TableHead>状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batchSales.map((s, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{s.buyer}</TableCell>
                    <TableCell>{s.quantity}</TableCell>
                    <TableCell>{s.date}</TableCell>
                    <TableCell>{s.region}</TableCell>
                    <TableCell>
                      <Badge variant={s.status === '已发货' ? 'default' : 'secondary'}>
                        {s.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
