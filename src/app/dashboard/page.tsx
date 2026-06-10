'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  RefreshCw, Maximize2, Factory, Store, TrendingUp, DollarSign,
  AlertTriangle, ChevronRight, ArrowUp,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  productionEnterprises, businessEnterprises, productionLedger,
  outboundRecords, alertRecords, monthlyProductionTrend, monthlyBusinessTrend,
} from '@/lib/mock-data';
import Link from 'next/link';

export default function DashboardPage() {
  const [now, setNow] = useState(0);
  useEffect(() => { setNow(Date.now()); }, []);

  // 数据闭环：从真实数据源计算指标
  const metrics = useMemo(() => {
    const totalProducers = productionEnterprises.length;
    const totalOperators = businessEnterprises.length;
    const totalProduction = productionLedger.reduce((s, l) => s + l.output, 0);
    // 出库金额是字符串如 "12,400元"，需解析
    const totalBusiness = outboundRecords.reduce((s, r) => {
      const num = parseFloat(r.amount.replace(/[^\d.]/g, ''));
      return s + (isNaN(num) ? 0 : num);
    }, 0);

    return [
      { label: '农药生产企业', value: `${totalProducers}家`, change: `+${Math.ceil(totalProducers * 0.05)}家`, icon: Factory, color: '#1A5C9A' },
      { label: '农药经营企业', value: `${totalOperators.toLocaleString()}家`, change: `+${Math.ceil(totalOperators * 0.013)}家`, icon: Store, color: '#8B5CF6' },
      { label: '累计产量', value: `${(totalProduction / 10000).toFixed(1)}万吨`, change: '+15%', icon: TrendingUp, color: '#67C23A' },
      { label: '累计经营额', value: `${(totalBusiness / 10000).toFixed(1)}万元`, change: '+8%', icon: DollarSign, color: '#E6A23C' },
    ];
  }, []);

  // 数据闭环：从预警记录和企业数据提取
  const alerts = useMemo(() => {
    const overdueLedger = productionEnterprises.filter((e) => e.status === '整改中').length;
    const expiringLicenses = businessEnterprises.filter((e) => {
      if (!now) return false;
      const days = Math.ceil((new Date(e.licenseExpiry).getTime() - now) / (1000 * 60 * 60 * 24));
      return days > 0 && days <= 90;
    }).length;
    const criticalAlerts = alertRecords.filter((a) => a.level === '严重' && !a.handled).length;

    return [
      { type: 'danger' as const, text: `${overdueLedger}家企业生产台账逾期未报`, action: '立即处理', href: '/production/enterprises' },
      { type: 'warning' as const, text: `${expiringLicenses}家企业农药经营许可证即将到期`, action: '查看详情', href: '/business/enterprises' },
      { type: 'warning' as const, text: `${criticalAlerts}批次农药异常预警待处理`, action: '查看详情', href: '/business/ledger' },
    ];
  }, [now]);

  // 数据闭环：快捷入口数据
  const quickLinks = useMemo(() => {
    const totalProducers = productionEnterprises.length;
    const totalOperators = businessEnterprises.length;
    const totalBatches = productionLedger.length;
    const totalAlerts = alertRecords.filter((a) => !a.handled).length;

    return [
      { label: '生产企业', value: `${totalProducers}家`, icon: Factory, iconColor: '#1A5C9A', iconBg: 'rgba(26,92,154,0.1)', href: '/production/enterprises' },
      { label: '经营企业', value: `${totalOperators.toLocaleString()}家`, icon: Store, iconColor: '#8B5CF6', iconBg: 'rgba(139,92,246,0.1)', href: '/business/enterprises' },
      { label: '生产追踪', value: `${totalBatches}批次`, icon: TrendingUp, iconColor: '#E6A23C', iconBg: 'rgba(230,162,60,0.1)', href: '/production/tracking' },
      { label: '异常预警', value: `${totalAlerts}条`, icon: AlertTriangle, iconColor: '#F56C6C', iconBg: 'rgba(245,108,108,0.1)', href: '/business/ledger' },
    ];
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">农药数字监管首页</h1>
          <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
            <span>当前层级：安徽省</span>
            <span>数据更新时间：2026-06-06 17:30</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-1 h-3.5 w-3.5" />刷新
          </Button>
          <Button variant="outline" size="sm">
            <Maximize2 className="mr-1 h-3.5 w-3.5" />全屏
          </Button>
        </div>
      </div>

      {/* Metric Cards - 数据闭环 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.label} className="relative overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{m.label}</p>
                  <p className="mt-1 text-2xl font-bold" style={{ color: m.color }}>{m.value}</p>
                  <p className="mt-1 flex items-center text-xs text-green-600">
                    <ArrowUp className="mr-0.5 h-3 w-3" />{m.change}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg" style={{ backgroundColor: `${m.color}15` }}>
                  <m.icon className="h-6 w-6" style={{ color: m.color }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alert Section - 数据闭环 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">预警提醒</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {alerts.map((alert, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Badge variant={alert.type === 'danger' ? 'destructive' : 'secondary'}>
                  {alert.type === 'danger' ? '严重' : '警告'}
                </Badge>
                <span className="text-sm">{alert.text}</span>
              </div>
              <Link href={alert.href}>
                <Button variant="ghost" size="sm" className="text-primary">
                  {alert.action} <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Charts - 数据闭环 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">本月生产量趋势（万吨）</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthlyProductionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#1A5C9A" strokeWidth={2} dot={{ fill: '#1A5C9A' }} name="产量(万吨)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">本月经营额趋势（亿元）</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthlyBusinessTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={2} dot={{ fill: '#8B5CF6' }} name="经营额(亿元)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links - 数据闭环 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">功能快捷入口</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {quickLinks.map((link) => (
              <Link key={link.label} href={link.href}>
                <div className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50 cursor-pointer">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: link.iconBg }}>
                    <link.icon className="h-5 w-5" style={{ color: link.iconColor }} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{link.label}</p>
                    <p className="text-lg font-semibold">{link.value}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
