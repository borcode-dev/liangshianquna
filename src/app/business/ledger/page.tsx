'use client';

import React, { useState } from 'react';
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Plus, AlertTriangle, AlertCircle, ArrowRight, Package, LogIn, LogOut, Bell, Eye, CheckCircle } from 'lucide-react';
import { inventoryData, inboundRecords, outboundRecords, alertRecords } from '@/lib/mock-data';
import Link from 'next/link';

const stockStatusColors: Record<string, string> = {
  '正常': 'bg-green-500',
  '临期': 'bg-amber-500',
  '不足': 'bg-red-500',
  '过期': 'bg-red-600',
};

const stockStatusBg: Record<string, string> = {
  '正常': 'bg-green-50 text-green-700 border-green-200',
  '临期': 'bg-amber-50 text-amber-700 border-amber-200',
  '不足': 'bg-red-50 text-red-700 border-red-200',
  '过期': 'bg-red-50 text-red-700 border-red-200',
};

const inboundStatusBg: Record<string, string> = {
  '已入库': 'bg-green-50 text-green-700 border-green-200',
  '待验收': 'bg-amber-50 text-amber-700 border-amber-200',
};

const outboundStatusBg: Record<string, string> = {
  '已出库': 'bg-green-50 text-green-700 border-green-200',
  '待出库': 'bg-blue-50 text-blue-700 border-blue-200',
};

const alertLevelBg: Record<string, string> = {
  '严重': 'bg-red-50 text-red-700 border-red-200',
  '警告': 'bg-amber-50 text-amber-700 border-amber-200',
};

const alertTypeIcon: Record<string, React.ReactNode> = {
  '库存不足': <Package className="h-4 w-4 text-red-500" />,
  '临近过期': <AlertTriangle className="h-4 w-4 text-amber-500" />,
  '过期农药': <AlertCircle className="h-4 w-4 text-red-600" />,
  '台账异常': <AlertTriangle className="h-4 w-4 text-amber-500" />,
  '许可证临期': <AlertCircle className="h-4 w-4 text-amber-500" />,
};

export default function BusinessLedgerPage() {
  const [tab, setTab] = useState('all');
  const [inboundSearch, setInboundSearch] = useState('');
  const [outboundSearch, setOutboundSearch] = useState('');
  const [stockSearch, setStockSearch] = useState('');
  const [alertSearch, setAlertSearch] = useState('');
  const [inboundType, setInboundType] = useState('all');
  const [outboundType, setOutboundType] = useState('all');
  const [alertLevel, setAlertLevel] = useState('all');
  const [handledFilter, setHandledFilter] = useState('all');

  const filteredInbound = inboundRecords.filter((r) => {
    if (inboundSearch && !r.product.includes(inboundSearch) && !r.orderNo.includes(inboundSearch) && !r.enterprise.includes(inboundSearch)) return false;
    if (inboundType !== 'all' && r.type !== inboundType) return false;
    return true;
  });

  const filteredOutbound = outboundRecords.filter((r) => {
    if (outboundSearch && !r.product.includes(outboundSearch) && !r.orderNo.includes(outboundSearch) && !r.buyer.includes(outboundSearch)) return false;
    if (outboundType !== 'all' && r.type !== outboundType) return false;
    return true;
  });

  const filteredStock = inventoryData.filter((r) => {
    if (stockSearch && !r.productName.includes(stockSearch) && !r.regNo.includes(stockSearch)) return false;
    return true;
  });

  const filteredAlerts = alertRecords.filter((r) => {
    if (alertSearch && !r.product.includes(alertSearch) && !r.enterprise.includes(alertSearch) && !r.detail.includes(alertSearch)) return false;
    if (alertLevel !== 'all' && r.level !== alertLevel) return false;
    if (handledFilter === 'unhandled' && r.handled) return false;
    if (handledFilter === 'handled' && !r.handled) return false;
    return true;
  });

  const unhandledCount = alertRecords.filter(a => !a.handled).length;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">经营电子台账</h1>
        <div className="flex gap-2">
          <Link href="/business/ledger/inbound">
            <Button><Plus className="mr-1 h-4 w-4" />入库登记</Button>
          </Link>
          <Link href="/business/ledger/outbound">
            <Button variant="outline"><Plus className="mr-1 h-4 w-4" />出库登记</Button>
          </Link>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">全部</TabsTrigger>
          <TabsTrigger value="inbound">
            <LogIn className="mr-1 h-3.5 w-3.5" />入库记录(5,678)
          </TabsTrigger>
          <TabsTrigger value="outbound">
            <LogOut className="mr-1 h-3.5 w-3.5" />出库记录(8,234)
          </TabsTrigger>
          <TabsTrigger value="stock">
            <Package className="mr-1 h-3.5 w-3.5" />在库库存(1,456)
          </TabsTrigger>
          <TabsTrigger value="alert">
            <Bell className="mr-1 h-3.5 w-3.5" />异常预警({unhandledCount})
          </TabsTrigger>
        </TabsList>

        {/* ========== 全部 Tab ========== */}
        <TabsContent value="all" className="space-y-4 mt-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">125吨</p>
                <p className="mt-1 text-sm text-muted-foreground">本月采购量</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">98吨</p>
                <p className="mt-1 text-sm text-muted-foreground">本月销售量</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">156.3万元</p>
                <p className="mt-1 text-sm text-muted-foreground">本月采购额</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">128.5万元</p>
                <p className="mt-1 text-sm text-muted-foreground">本月销售额</p>
              </CardContent>
            </Card>
          </div>

          {/* Alerts Summary */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">在库库存预警</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setTab('alert')}>查看全部 <ArrowRight className="ml-1 h-3.5 w-3.5" /></Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {alertRecords.filter(a => !a.handled).slice(0, 3).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between gap-2 rounded-lg bg-amber-50 p-3 text-sm">
                  <div className="flex items-center gap-2">
                    {alertTypeIcon[alert.type]}
                    <span>{alert.detail}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setTab('alert')}>处理</Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Inventory Table */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">库存明细</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setTab('stock')}>查看全部 <ArrowRight className="ml-1 h-3.5 w-3.5" /></Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>产品名称</TableHead>
                    <TableHead>登记证号</TableHead>
                    <TableHead className="text-right">库存量</TableHead>
                    <TableHead className="text-right">安全库存</TableHead>
                    <TableHead>有效期至</TableHead>
                    <TableHead>状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryData.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell className="font-mono text-sm">{item.regNo}</TableCell>
                      <TableCell className="text-right">{item.stock}吨</TableCell>
                      <TableCell className="text-right">{item.safeStock}吨</TableCell>
                      <TableCell>{item.expiry}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={stockStatusBg[item.status]}>
                          <span className={`inline-block h-1.5 w-1.5 rounded-full ${stockStatusColors[item.status]} mr-1`} />
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
                <span>共 1,456 种产品</span>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" disabled>&lt;</Button>
                  <Button variant="outline" size="sm" className="bg-primary text-white">1</Button>
                  <Button variant="outline" size="sm">2</Button>
                  <Button variant="outline" size="sm">3</Button>
                  <Button variant="outline" size="sm">&gt;</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== 入库记录 Tab ========== */}
        <TabsContent value="inbound" className="space-y-4 mt-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <Select value={inboundType} onValueChange={setInboundType}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="入库类型" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="采购入库">采购入库</SelectItem>
                <SelectItem value="退货入库">退货入库</SelectItem>
                <SelectItem value="其他">其他</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="搜索产品/单号/企业..." className="pl-9 w-[240px]" value={inboundSearch} onChange={(e) => setInboundSearch(e.target.value)} />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">5,678</p>
                <p className="mt-1 text-sm text-muted-foreground">累计入库记录</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">35吨</p>
                <p className="mt-1 text-sm text-muted-foreground">本月入库量</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">127.2万元</p>
                <p className="mt-1 text-sm text-muted-foreground">本月入库金额</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">98.5%</p>
                <p className="mt-1 text-sm text-muted-foreground">入库验收率</p>
              </CardContent>
            </Card>
          </div>

          {/* Inbound Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>入库单号</TableHead>
                    <TableHead>入库企业</TableHead>
                    <TableHead>供货单位</TableHead>
                    <TableHead>产品名称</TableHead>
                    <TableHead>批次号</TableHead>
                    <TableHead className="text-right">数量</TableHead>
                    <TableHead className="text-right">金额</TableHead>
                    <TableHead>入库日期</TableHead>
                    <TableHead>入库类型</TableHead>
                    <TableHead>存放位置</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInbound.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-sm">{r.orderNo}</TableCell>
                      <TableCell className="font-medium">{r.enterprise}</TableCell>
                      <TableCell>{r.supplier}</TableCell>
                      <TableCell>{r.product}</TableCell>
                      <TableCell className="font-mono text-sm">{r.batchNo}</TableCell>
                      <TableCell className="text-right">{r.quantity}</TableCell>
                      <TableCell className="text-right">{r.amount}</TableCell>
                      <TableCell>{r.date}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={r.type === '采购入库' ? 'bg-blue-50 text-blue-700 border-blue-200' : r.type === '退货入库' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-50 text-gray-700 border-gray-200'}>
                          {r.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{r.warehouse}-{r.position}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={inboundStatusBg[r.status]}>
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm"><Eye className="h-3.5 w-3.5" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
                <span>共 {filteredInbound.length} 条记录</span>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" disabled>&lt;</Button>
                  <Button variant="outline" size="sm" className="bg-primary text-white">1</Button>
                  <Button variant="outline" size="sm">2</Button>
                  <Button variant="outline" size="sm">&gt;</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== 出库记录 Tab ========== */}
        <TabsContent value="outbound" className="space-y-4 mt-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <Select value={outboundType} onValueChange={setOutboundType}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="出库类型" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="销售出库">销售出库</SelectItem>
                <SelectItem value="退货出库">退货出库</SelectItem>
                <SelectItem value="报损出库">报损出库</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="搜索产品/单号/购买方..." className="pl-9 w-[240px]" value={outboundSearch} onChange={(e) => setOutboundSearch(e.target.value)} />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">8,234</p>
                <p className="mt-1 text-sm text-muted-foreground">累计出库记录</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">28吨</p>
                <p className="mt-1 text-sm text-muted-foreground">本月出库量</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">98.5万元</p>
                <p className="mt-1 text-sm text-muted-foreground">本月出库金额</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">100%</p>
                <p className="mt-1 text-sm text-muted-foreground">购买方实名率</p>
              </CardContent>
            </Card>
          </div>

          {/* Outbound Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>出库单号</TableHead>
                    <TableHead>出库企业</TableHead>
                    <TableHead>购买方</TableHead>
                    <TableHead>购买方类型</TableHead>
                    <TableHead>产品名称</TableHead>
                    <TableHead className="text-right">数量</TableHead>
                    <TableHead className="text-right">金额</TableHead>
                    <TableHead>出库日期</TableHead>
                    <TableHead>出库类型</TableHead>
                    <TableHead>购买用途</TableHead>
                    <TableHead>流向地区</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOutbound.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-sm">{r.orderNo}</TableCell>
                      <TableCell className="font-medium">{r.enterprise}</TableCell>
                      <TableCell>{r.buyer}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">{r.buyerType}</Badge>
                      </TableCell>
                      <TableCell>{r.product}</TableCell>
                      <TableCell className="text-right">{r.quantity}</TableCell>
                      <TableCell className="text-right">{r.amount}</TableCell>
                      <TableCell>{r.date}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={r.type === '销售出库' ? 'bg-blue-50 text-blue-700 border-blue-200' : r.type === '退货出库' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-50 text-gray-700 border-gray-200'}>
                          {r.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{r.purpose}</TableCell>
                      <TableCell className="text-sm">{r.region}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={outboundStatusBg[r.status]}>
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm"><Eye className="h-3.5 w-3.5" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
                <span>共 {filteredOutbound.length} 条记录</span>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" disabled>&lt;</Button>
                  <Button variant="outline" size="sm" className="bg-primary text-white">1</Button>
                  <Button variant="outline" size="sm">2</Button>
                  <Button variant="outline" size="sm">&gt;</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== 在库库存 Tab ========== */}
        <TabsContent value="stock" className="space-y-4 mt-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <Select defaultValue="all">
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="库存状态" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="正常">正常</SelectItem>
                <SelectItem value="临期">临期</SelectItem>
                <SelectItem value="不足">不足</SelectItem>
                <SelectItem value="过期">过期</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="搜索产品名称/登记证号..." className="pl-9 w-[240px]" value={stockSearch} onChange={(e) => setStockSearch(e.target.value)} />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">1,456</p>
                <p className="mt-1 text-sm text-muted-foreground">在库产品种类</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">28.5吨</p>
                <p className="mt-1 text-sm text-muted-foreground">在库总量</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-amber-600">5种</p>
                <p className="mt-1 text-sm text-muted-foreground">库存不足产品</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-red-600">8批次</p>
                <p className="mt-1 text-sm text-muted-foreground">临近过期</p>
              </CardContent>
            </Card>
          </div>

          {/* Inventory Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>产品名称</TableHead>
                    <TableHead>登记证号</TableHead>
                    <TableHead>剂型</TableHead>
                    <TableHead>毒性等级</TableHead>
                    <TableHead className="text-right">库存量</TableHead>
                    <TableHead className="text-right">安全库存</TableHead>
                    <TableHead>库存占比</TableHead>
                    <TableHead>有效期至</TableHead>
                    <TableHead>生产企业</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStock.map((item, i) => {
                    const ratio = item.stock / item.safeStock;
                    return (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell className="font-mono text-sm">{item.regNo}</TableCell>
                        <TableCell>水剂</TableCell>
                        <TableCell>低毒</TableCell>
                        <TableCell className="text-right">{item.stock}吨</TableCell>
                        <TableCell className="text-right">{item.safeStock}吨</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-20 rounded-full bg-gray-200">
                              <div
                                className={`h-full rounded-full ${ratio >= 1 ? 'bg-green-500' : ratio >= 0.5 ? 'bg-amber-500' : 'bg-red-500'}`}
                                style={{ width: `${Math.min(ratio * 100, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">{(ratio * 100).toFixed(0)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{item.expiry}</TableCell>
                        <TableCell className="text-sm">安徽农药化工集团</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={stockStatusBg[item.status]}>
                            <span className={`inline-block h-1.5 w-1.5 rounded-full ${stockStatusColors[item.status]} mr-1`} />
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm"><Eye className="h-3.5 w-3.5" /></Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
                <span>共 {filteredStock.length} 种产品</span>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" disabled>&lt;</Button>
                  <Button variant="outline" size="sm" className="bg-primary text-white">1</Button>
                  <Button variant="outline" size="sm">2</Button>
                  <Button variant="outline" size="sm">3</Button>
                  <Button variant="outline" size="sm">&gt;</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== 异常预警 Tab ========== */}
        <TabsContent value="alert" className="space-y-4 mt-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <Select value={alertLevel} onValueChange={setAlertLevel}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="预警级别" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部级别</SelectItem>
                <SelectItem value="严重">严重</SelectItem>
                <SelectItem value="警告">警告</SelectItem>
              </SelectContent>
            </Select>
            <Select value={handledFilter} onValueChange={setHandledFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="处理状态" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="unhandled">未处理</SelectItem>
                <SelectItem value="handled">已处理</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="搜索产品/企业/详情..." className="pl-9 w-[240px]" value={alertSearch} onChange={(e) => setAlertSearch(e.target.value)} />
            </div>
          </div>

          {/* Alert Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{alertRecords.filter(a => a.level === '严重').length}</p>
                <p className="mt-1 text-sm text-muted-foreground">严重预警</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-amber-600">{alertRecords.filter(a => a.level === '警告').length}</p>
                <p className="mt-1 text-sm text-muted-foreground">警告预警</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">{unhandledCount}</p>
                <p className="mt-1 text-sm text-muted-foreground">待处理</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{alertRecords.filter(a => a.handled).length}</p>
                <p className="mt-1 text-sm text-muted-foreground">已处理</p>
              </CardContent>
            </Card>
          </div>

          {/* Alert Cards */}
          <div className="space-y-3">
            {filteredAlerts.map((alert) => (
              <Card key={alert.id} className={alert.handled ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100">
                      {alertTypeIcon[alert.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={alertLevelBg[alert.level]}>{alert.level}</Badge>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{alert.type}</Badge>
                        {alert.handled && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="mr-1 h-3 w-3" />已处理
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium mb-1">{alert.detail}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {alert.product !== '-' && <span>产品：{alert.product}</span>}
                        <span>企业：{alert.enterprise}</span>
                        <span>时间：{alert.date}</span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {!alert.handled && (
                        <Button size="sm" variant="outline">处理</Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredAlerts.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <CheckCircle className="mx-auto h-10 w-10 text-green-400 mb-2" />
                  <p>暂无符合条件的预警记录</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>共 {filteredAlerts.length} 条预警记录</span>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
