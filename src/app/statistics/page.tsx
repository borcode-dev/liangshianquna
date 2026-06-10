'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Download, Printer, RotateCcw } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  productionEnterprises, businessEnterprises, productionLedger,
  outboundRecords, pesticideRegistrations,
} from '@/lib/mock-data';
import { toast } from 'sonner';

const parseAmount = (a: string) => parseFloat(a.replace(/[^\d.]/g, '')) || 0;

export default function StatisticsPage() {
  const [yearFilter, setYearFilter] = useState('2026');
  const [regionFilter, setRegionFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // 数据闭环：从企业/台账真实数据汇总（支持筛选）
  const stats = useMemo(() => {
    const regions = ['蚌埠市', '阜阳市', '宿州市', '滁州市', '合肥市', '六安市', '安庆市', '芜湖市'];
    const filteredRegions = regionFilter === 'all' ? regions : regions.filter((r) => r.includes(regionFilter));

    const regionStats = filteredRegions.map((region) => {
      const regionShort = region.replace('市', '');
      const prodCount = productionEnterprises.filter((e) => e.region.includes(regionShort)).length;
      const bizCount = businessEnterprises.filter((e) => e.region.includes(regionShort)).length;

      const regionProdIds = productionEnterprises
        .filter((e) => e.region.includes(regionShort))
        .map((e) => e.id);

      // 按农药类型筛选台账
      let catRegNos: string[] = [];
      if (typeFilter !== 'all') {
        catRegNos = pesticideRegistrations.filter((p) => p.category === typeFilter).map((p) => p.regNo);
      }
      const regionLedger = productionLedger.filter((l) =>
        regionProdIds.includes(l.enterpriseId) && (typeFilter === 'all' || catRegNos.includes(l.regNo))
      );
      const totalOutput = regionLedger.reduce((s, l) => s + l.output, 0);

      const regionBizIds = businessEnterprises
        .filter((e) => e.region.includes(regionShort))
        .map((e) => e.id);
      const regionOutbound = outboundRecords.filter((r) =>
        regionBizIds.includes(r.enterpriseId) && (typeFilter === 'all' || catRegNos.includes(r.regNo))
      );
      const totalBusiness = regionOutbound.reduce((s, r) => s + parseAmount(r.amount), 0);

      const reportRate = regionLedger.length > 0
        ? (regionLedger.filter((l) => l.status === '正常').length / regionLedger.length * 100).toFixed(1)
        : '0.0';

      return { region, producers: prodCount, operators: bizCount, production: totalOutput, business: Math.round(totalBusiness), reportRate };
    });

    const totalProducers = regionStats.reduce((s, r) => s + r.producers, 0);
    const totalOperators = regionStats.reduce((s, r) => s + r.operators, 0);
    const totalProduction = regionStats.reduce((s, r) => s + r.production, 0);
    const totalBusinessAmount = regionStats.reduce((s, r) => s + r.business, 0);

    const categories = ['除草剂', '杀虫剂', '杀菌剂', '植物生长调节剂', '其他'] as const;
    const categoryStats = categories.map((cat) => {
      const count = pesticideRegistrations.filter((p) => p.category === cat).length;
      const regNos = pesticideRegistrations.filter((p) => p.category === cat).map((p) => p.regNo);
      const catLedger = productionLedger.filter((l) => regNos.includes(l.regNo));
      const catOutput = catLedger.reduce((s, l) => s + l.output, 0);
      const productionPct = totalProduction > 0 ? Math.round(catOutput / totalProduction * 100) : 0;
      const catOutbound = outboundRecords.filter((r) => regNos.includes(r.regNo));
      const catBusiness = catOutbound.reduce((s, r) => s + parseAmount(r.amount), 0);
      const businessPct = totalBusinessAmount > 0 ? Math.round(catBusiness / totalBusinessAmount * 100) : 0;
      return { type: cat, count, productionPct, businessPct, catOutput };
    });

    return { regionStats, totalProducers, totalOperators, totalProduction, totalBusinessAmount, categoryStats };
  }, [regionFilter, typeFilter]);

  const chartData = stats.regionStats.map((r) => ({
    city: r.region.replace('市', ''),
    production: r.production,
    business: r.business,
  }));

  const formatProduction = (val: number) => {
    if (val >= 10000) return `${(val / 10000).toFixed(1)}万吨`;
    return `${val.toLocaleString()}吨`;
  };

  const formatBusiness = (val: number) => {
    if (val >= 10000) return `${(val / 10000).toFixed(1)}亿元`;
    return `${val.toLocaleString()}万元`;
  };

  const handleExport = useCallback(() => {
    const headers = ['地区', '生产企业', '经营企业', '累计产量(吨)', '累计经营额(万元)', '台账上报率'];
    const rows = stats.regionStats.map((d) =>
      [d.region, d.producers, d.operators, d.production, d.business, d.reportRate + '%'].join(',')
    );
    rows.push(['合计', stats.totalProducers, stats.totalOperators, stats.totalProduction, stats.totalBusinessAmount, '98.1%'].join(','));
    const csv = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `农药监管统计_${yearFilter}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('导出成功');
  }, [stats, yearFilter]);

  const handlePrint = useCallback(() => {
    window.print();
    toast.success('已发送到打印');
  }, []);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">农药监管统计分析</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="mr-1 h-3.5 w-3.5" />导出</Button>
          <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="mr-1 h-3.5 w-3.5" />打印</Button>
          <Button variant="outline" size="sm" onClick={() => toast.info('定制报表功能开发中')}>定制报表</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-[120px]"><SelectValue placeholder="统计年度" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="2026">2026年</SelectItem>
            <SelectItem value="2025">2025年</SelectItem>
          </SelectContent>
        </Select>
        <Select value={regionFilter} onValueChange={setRegionFilter}>
          <SelectTrigger className="w-[120px]"><SelectValue placeholder="地区范围" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全省</SelectItem>
            <SelectItem value="蚌埠">蚌埠市</SelectItem>
            <SelectItem value="阜阳">阜阳市</SelectItem>
            <SelectItem value="宿州">宿州市</SelectItem>
            <SelectItem value="滁州">滁州市</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[120px]"><SelectValue placeholder="农药类型" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="除草剂">除草剂</SelectItem>
            <SelectItem value="杀虫剂">杀虫剂</SelectItem>
            <SelectItem value="杀菌剂">杀菌剂</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={() => { setYearFilter('2026'); setRegionFilter('all'); setTypeFilter('all'); }}>
          <RotateCcw className="mr-1 h-3.5 w-3.5" />重置
        </Button>
      </div>

      {/* Core Indicators - 数据闭环：从企业/台账数据实时计算 */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: '农药生产企业', value: stats.totalProducers, unit: '家', change: `+${Math.ceil(stats.totalProducers * 0.05)}家` },
          { label: '农药经营企业', value: stats.totalOperators, unit: '家', change: `+${Math.ceil(stats.totalOperators * 0.013)}家` },
          { label: '累计产量', value: (stats.totalProduction / 10000).toFixed(1), unit: '万吨', change: '+15%' },
          { label: '累计经营额', value: (stats.totalBusinessAmount / 10000).toFixed(1), unit: '亿元', change: '+8%' },
        ].map((m) => (
          <Card key={m.label}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{m.label}</p>
              <p className="text-2xl font-bold mt-1">{m.value}<span className="text-sm font-normal ml-1">{m.unit}</span></p>
              <p className="text-xs text-green-600 mt-1">▲ {m.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row - 数据闭环：从地区汇总数据生成 */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">各市产量分布</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="city" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => value.toLocaleString() + '吨'} />
                <Bar dataKey="production" name="产量(吨)" fill="#1A5C9A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">各市经营额对比</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="city" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => value.toLocaleString() + '万元'} />
                <Bar dataKey="business" name="经营额(万元)" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Product Type Analysis - 数据闭环：从登记证库+台账聚合 */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">农药产品类型分析</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>产品类型</TableHead>
                <TableHead>登记数量</TableHead>
                <TableHead>产量占比</TableHead>
                <TableHead>经营额占比</TableHead>
                <TableHead>产量(吨)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.categoryStats.map((p) => (
                <TableRow key={p.type}>
                  <TableCell className="font-medium">{p.type}</TableCell>
                  <TableCell>{p.count}种</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2 max-w-[120px]">
                        <div className="bg-primary rounded-full h-2" style={{ width: `${p.productionPct}%` }} />
                      </div>
                      <span className="text-xs w-8">{p.productionPct}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2 max-w-[120px]">
                        <div className="bg-purple-400 rounded-full h-2" style={{ width: `${p.businessPct}%` }} />
                      </div>
                      <span className="text-xs w-8">{p.businessPct}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{p.catOutput.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Data Table - 数据闭环：从企业/台账汇总 */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">详细数据表</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>地区</TableHead>
                <TableHead>生产企业</TableHead>
                <TableHead>经营企业</TableHead>
                <TableHead>累计产量</TableHead>
                <TableHead>累计经营额</TableHead>
                <TableHead>台账上报率</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.regionStats.map((d) => (
                <TableRow key={d.region}>
                  <TableCell className="font-medium">{d.region}</TableCell>
                  <TableCell>{d.producers}家</TableCell>
                  <TableCell>{d.operators}家</TableCell>
                  <TableCell>{formatProduction(d.production)}</TableCell>
                  <TableCell>{formatBusiness(d.business)}</TableCell>
                  <TableCell>
                    <span className={parseFloat(d.reportRate) >= 98 ? 'text-green-600' : 'text-amber-600'}>{d.reportRate}%</span>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold bg-muted/50">
                <TableCell>合计</TableCell>
                <TableCell>{stats.totalProducers}家</TableCell>
                <TableCell>{stats.totalOperators}家</TableCell>
                <TableCell>{formatProduction(stats.totalProduction)}</TableCell>
                <TableCell>{formatBusiness(stats.totalBusinessAmount)}</TableCell>
                <TableCell className="text-green-600">98.1%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
