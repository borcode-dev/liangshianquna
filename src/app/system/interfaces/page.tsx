'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Eye, Settings, Zap } from 'lucide-react';

const interfaceData = [
  { name: '生产台账同步', type: '推送', system: '省农药监管平台', status: '正常', lastSync: '10:30', url: 'https://api.ahpesticide.gov.cn/produce/sync', frequency: '每小时' },
  { name: '经营台账同步', type: '推送', system: '省农药监管平台', status: '正常', lastSync: '10:25', url: 'https://api.ahpesticide.gov.cn/business/sync', frequency: '每小时' },
  { name: '企业信息查询', type: '查询', system: '省农药监管平台', status: '正常', lastSync: '10:20', url: 'https://api.ahpesticide.gov.cn/enterprise/query', frequency: '实时' },
  { name: '登记证信息同步', type: '接收', system: '农业农村部', status: '正常', lastSync: '昨日', url: 'https://api.moa.gov.cn/registration/sync', frequency: '每日' },
  { name: '经营许可查询', type: '查询', system: '市场监管局', status: '降级', lastSync: '10:15', url: 'https://api.samr.gov.cn/license/query', frequency: '实时' },
  { name: '农药抽检数据同步', type: '接收', system: '省农检中心', status: '正常', lastSync: '09:00', url: 'https://api.ahnc.org.cn/inspection/sync', frequency: '每日' },
  { name: '预警信息推送', type: '推送', system: '省预警平台', status: '正常', lastSync: '10:00', url: 'https://api.ahwarning.gov.cn/alert/push', frequency: '实时' },
];

export default function InterfaceManagementPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState(interfaceData[0]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">接口管理</h1>
        <div className="flex gap-2">
          <Button size="sm"><Plus className="mr-1 h-3.5 w-3.5" />新增接口</Button>
          <Button variant="outline" size="sm"><Zap className="mr-1 h-3.5 w-3.5" />测试</Button>
        </div>
      </div>

      {/* Interface List */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>接口名称</TableHead>
                <TableHead>接口类型</TableHead>
                <TableHead>对接系统</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>最后同步</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interfaceData.map((item) => (
                <TableRow key={item.name}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {item.type === '推送' ? '↑' : item.type === '查询' ? '↔' : '↓'} {item.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.system}</TableCell>
                  <TableCell>
                    <Badge variant={item.status === '正常' ? 'secondary' : 'outline'} className={`text-xs ${item.status === '降级' ? 'border-amber-500 text-amber-600' : 'text-green-600'}`}>
                      {item.status === '正常' ? '🟢' : '🟡'} {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{item.lastSync}</TableCell>
                  <TableCell>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setSelected(item)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>接口配置详情</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div><span className="text-muted-foreground">接口名称：</span>{selected.name}</div>
                            <div><span className="text-muted-foreground">接口类型：</span>{selected.type}</div>
                            <div><span className="text-muted-foreground">对接系统：</span>{selected.system}</div>
                            <div><span className="text-muted-foreground">同步频率：</span>{selected.frequency}</div>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">接口地址：</span>
                            <code className="ml-2 bg-muted px-2 py-0.5 rounded text-xs">{selected.url}</code>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">最后同步：</span>{selected.lastSync}
                            <Badge variant={selected.status === '正常' ? 'secondary' : 'outline'} className={`ml-2 text-xs ${selected.status === '降级' ? 'border-amber-500 text-amber-600' : 'text-green-600'}`}>
                              {selected.status}
                            </Badge>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">推送数据：</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {['批次编号', '产品名称', '数量', '生产日期', '销售去向'].map((field) => (
                                <label key={field} className="flex items-center gap-1.5 text-xs">
                                  <input type="checkbox" defaultChecked={field !== '批次编号'} className="rounded" />
                                  {field}
                                </label>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button variant="outline" size="sm">测试连接</Button>
                            <Button variant="outline" size="sm">重新同步</Button>
                            <Button variant="outline" size="sm">配置告警</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
