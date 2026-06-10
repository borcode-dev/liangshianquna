'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Search, Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import { FormModal, type FormField, DetailModal, type DetailField, DeleteDialog } from '@/components/crud';
import type { UploadedFile } from '@/components/crud/file-upload';
import { toast } from 'sonner';

interface InterfaceItem {
  id: string;
  name: string;
  type: string;
  system: string;
  frequency: string;
  url: string;
  status: string;
  lastSync: string;
  document?: UploadedFile[];
}

const initialInterfaceData: InterfaceItem[] = [
  { id: '1', name: '生产台账同步', type: '推送', system: '省农药监管平台', status: '正常', lastSync: '10:30', url: 'https://api.ahpesticide.gov.cn/produce/sync', frequency: '每小时', document: [] },
  { id: '2', name: '经营台账同步', type: '推送', system: '省农药监管平台', status: '正常', lastSync: '10:25', url: 'https://api.ahpesticide.gov.cn/business/sync', frequency: '每小时', document: [] },
  { id: '3', name: '企业信息查询', type: '查询', system: '省农药监管平台', status: '正常', lastSync: '10:20', url: 'https://api.ahpesticide.gov.cn/enterprise/query', frequency: '实时', document: [] },
  { id: '4', name: '登记证信息同步', type: '接收', system: '农业农村部', status: '正常', lastSync: '昨日', url: 'https://api.moa.gov.cn/registration/sync', frequency: '每日', document: [] },
  { id: '5', name: '经营许可查询', type: '查询', system: '市场监管局', status: '降级', lastSync: '10:15', url: 'https://api.samr.gov.cn/license/query', frequency: '实时', document: [] },
  { id: '6', name: '农药抽检数据同步', type: '接收', system: '省农检中心', status: '正常', lastSync: '09:00', url: 'https://api.ahnc.org.cn/inspection/sync', frequency: '每日', document: [] },
  { id: '7', name: '预警信息推送', type: '推送', system: '省预警平台', status: '正常', lastSync: '10:00', url: 'https://api.ahwarning.gov.cn/alert/push', frequency: '实时', document: [] },
];

const statusConfig: Record<string, { dot: string; badge: string }> = {
  '正常': { dot: 'bg-green-500', badge: 'bg-green-100 text-green-700' },
  '降级': { dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700' },
  '异常': { dot: 'bg-red-500', badge: 'bg-red-100 text-red-700' },
};

const formFields: FormField[] = [
  { name: 'name', label: '接口名称', type: 'text', required: true, placeholder: '请输入接口名称' },
  { name: 'type', label: '接口类型', type: 'select', required: true, options: [
    { label: '推送', value: '推送' }, { label: '查询', value: '查询' }, { label: '接收', value: '接收' },
  ]},
  { name: 'system', label: '对接系统', type: 'text', required: true, placeholder: '请输入对接系统名称' },
  { name: 'frequency', label: '同步频率', type: 'select', required: true, options: [
    { label: '实时', value: '实时' }, { label: '每小时', value: '每小时' }, { label: '每日', value: '每日' }, { label: '每周', value: '每周' },
  ]},
  { name: 'url', label: '接口地址', type: 'text', required: true, colSpan: 2, placeholder: '请输入接口地址' },
  { name: 'status', label: '状态', type: 'select', options: [
    { label: '正常', value: '正常' }, { label: '降级', value: '降级' }, { label: '异常', value: '异常' },
  ]},
  { name: 'document', label: '接口文档', type: 'file', accept: '.pdf,.doc,.docx', maxFiles: 3, colSpan: 2 },
];

const detailFields: DetailField[] = [
  { name: 'name', label: '接口名称' },
  { name: 'type', label: '接口类型', type: 'badge' },
  { name: 'system', label: '对接系统' },
  { name: 'frequency', label: '同步频率' },
  { name: 'url', label: '接口地址', colSpan: 2 },
  { name: 'status', label: '状态', type: 'badge' },
  { name: 'lastSync', label: '最后同步' },
  { name: 'document', label: '接口文档', type: 'file', colSpan: 2 },
];

export default function InterfaceManagementPage() {
  const [data, setData, hydrated] = useLocalStorage<InterfaceItem[]>("system-interfaces", initialInterfaceData);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // 搜索变化时重置页码
  useEffect(() => { setCurrentPage(1); }, [search]);

  if (!hydrated) {
    return <div className="p-6">加载中...</div>;
  }

  // CRUD modal states
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<Record<string, unknown> | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState('');

  const filtered = useMemo(() =>
    data.filter((item) => {
      if (search && !item.name.includes(search) && !item.system.includes(search)) return false;
      return true;
    }),
    [data, search]
  );

  // Handlers
  const openAdd = () => {
    setFormMode('add');
    setFormValues({ status: '正常', type: '推送', frequency: '实时', document: [] });
    setEditingId(null);
    setFormOpen(true);
  };

  const openEdit = (item: InterfaceItem) => {
    setFormMode('edit');
    setFormValues({
      ...item,
      document: item.document || [],
    });
    setEditingId(item.id);
    setFormOpen(true);
  };

  const openDetail = (item: InterfaceItem) => {
    setDetailData({ ...item });
    setDetailOpen(true);
  };

  const openDelete = (item: InterfaceItem) => {
    setDeleteId(item.id);
    setDeleteName(item.name);
    setDeleteOpen(true);
  };

  const handleFormChange = (name: string, value: unknown) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = () => {
    if (!formValues.name) {
      toast.error('请填写接口名称');
      return;
    }
    if (formMode === 'add') {
      const newItem: InterfaceItem = {
        id: `if-${Date.now()}`,
        name: String(formValues.name || ''),
        type: String(formValues.type || '推送'),
        system: String(formValues.system || ''),
        frequency: String(formValues.frequency || '实时'),
        url: String(formValues.url || ''),
        status: String(formValues.status || '正常'),
        lastSync: '-',
        document: (formValues.document as UploadedFile[]) || [],
      };
      setData((prev) => [newItem, ...prev]);
      toast.success('新增成功', { description: `接口「${newItem.name}」已添加` });
    } else {
      setData((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                ...formValues,
                document: (formValues.document as UploadedFile[]) || item.document || [],
              }
            : item
        )
      );
      toast.success('编辑成功', { description: `接口「${formValues.name}」已更新` });
    }
    setFormOpen(false);
  };

  const handleDelete = () => {
    setData((prev) => prev.filter((item) => item.id !== deleteId));
    toast.success('删除成功', { description: `接口「${deleteName}」已删除` });
    setDeleteOpen(false);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">接口管理</h1>
        <div className="flex gap-2">
          <Button onClick={openAdd}>
            <Plus className="mr-1 h-4 w-4" />新增接口
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索接口名称/对接系统..."
            className="w-[240px] pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">接口名称</TableHead>
                <TableHead>接口类型</TableHead>
                <TableHead>对接系统</TableHead>
                <TableHead>同步频率</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>最后同步</TableHead>
                <TableHead className="text-center w-[200px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((item) => {
                const sc = statusConfig[item.status] || statusConfig['正常'];
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {item.type === '推送' ? '↑' : item.type === '查询' ? '↔' : '↓'} {item.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.system}</TableCell>
                    <TableCell>{item.frequency}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={sc.badge}>
                        <span className={`inline-block h-1.5 w-1.5 rounded-full ${sc.dot} mr-1`} />
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.lastSync}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openDetail(item)}>
                          <Eye className="mr-0.5 h-3.5 w-3.5" />查看
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                          <Pencil className="mr-0.5 h-3.5 w-3.5" />编辑
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => openDelete(item)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    暂无数据
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
            <span>共 {filtered.length} 条记录，第 {currentPage}/{Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))} 页</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => p - 1)}>&lt;</Button>
              {Array.from({ length: Math.min(5, Math.ceil(filtered.length / PAGE_SIZE)) }, (_, i) => {
                const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
                let start = Math.max(1, currentPage - 2);
                if (start + 4 > totalPages) start = Math.max(1, totalPages - 4);
                const page = start + i;
                if (page > totalPages) return null;
                return (
                  <Button key={page} variant="outline" size="sm" className={page === currentPage ? "bg-primary text-white" : ""} onClick={() => setCurrentPage(page)}>{page}</Button>
                );
              })}
              <Button variant="outline" size="sm" disabled={currentPage >= Math.ceil(filtered.length / PAGE_SIZE)} onClick={() => setCurrentPage((p) => p + 1)}>&gt;</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Modal (Add/Edit) */}
      <FormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={formMode === 'add' ? '新增接口' : '编辑接口'}
        fields={formFields}
        values={formValues}
        onChange={handleFormChange}
        onSubmit={handleFormSubmit}
      />

      {/* Detail Modal */}
      <DetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="接口详情"
        fields={detailFields}
        data={detailData}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        description={`确定要删除接口「${deleteName}」吗？删除后将无法恢复。`}
      />
    </div>
  );
}
