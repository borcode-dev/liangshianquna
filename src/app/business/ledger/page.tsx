'use client';

import React, { useState, useMemo } from 'react';
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
import { Search, Plus, AlertTriangle, AlertCircle, ArrowRight, Package, LogIn, LogOut, Bell, Eye, Pencil, Trash2, CheckCircle } from 'lucide-react';
import { inventoryData as initialInventoryData, inboundRecords as initialInboundRecords, outboundRecords as initialOutboundRecords, alertRecords } from '@/lib/mock-data';
import { FormModal, type FormField, DetailModal, type DetailField, DeleteDialog } from '@/components/crud';
import type { UploadedFile } from '@/components/crud/file-upload';
import { toast } from 'sonner';
import Link from 'next/link';

// ==================== 类型定义 ====================

interface InboundRecord {
  id: string;
  orderNo: string;
  enterpriseId: string;
  enterprise: string;
  supplier: string;
  product: string;
  batchNo: string;
  quantity: string;
  amount: string;
  date: string;
  type: string;
  warehouse: string;
  position: string;
  status: string;
  attachment?: UploadedFile[];
}

interface OutboundRecord {
  id: string;
  orderNo: string;
  enterpriseId: string;
  enterprise: string;
  buyer: string;
  buyerType: string;
  product: string;
  quantity: string;
  amount: string;
  date: string;
  type: string;
  purpose: string;
  region: string;
  status: string;
  attachment?: UploadedFile[];
}

interface InventoryItem {
  id: string;
  enterpriseId: string;
  productName: string;
  regNo: string;
  stock: number;
  safeStock: number;
  expiry: string;
  productionEnterprise: string;
  status: string;
  attachment?: UploadedFile[];
}

// ==================== 样式映射 ====================

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

// ==================== 表单/详情字段定义 ====================

const inboundFormFields: FormField[] = [
  { name: 'orderNo', label: '入库单号', type: 'text', required: true, placeholder: '请输入入库单号' },
  { name: 'enterprise', label: '入库企业', type: 'text', required: true, placeholder: '请输入入库企业' },
  { name: 'supplier', label: '供货单位', type: 'text', required: true, placeholder: '请输入供货单位' },
  { name: 'product', label: '产品名称', type: 'text', required: true, placeholder: '请输入产品名称' },
  { name: 'batchNo', label: '批次号', type: 'text', required: true, placeholder: '请输入批次号' },
  { name: 'quantity', label: '数量', type: 'text', required: true, placeholder: '请输入数量' },
  { name: 'amount', label: '金额', type: 'text', required: true, placeholder: '请输入金额' },
  { name: 'date', label: '入库日期', type: 'date', required: true },
  { name: 'type', label: '入库类型', type: 'select', required: true, options: [
    { label: '采购入库', value: '采购入库' },
    { label: '退货入库', value: '退货入库' },
    { label: '其他', value: '其他' },
  ]},
  { name: 'warehouse', label: '存放位置', type: 'text', required: true, placeholder: '请输入存放仓库' },
  { name: 'position', label: '仓位', type: 'text', required: true, placeholder: '请输入仓位' },
  { name: 'status', label: '状态', type: 'select', required: true, options: [
    { label: '已入库', value: '已入库' },
    { label: '待验收', value: '待验收' },
  ]},
  { name: 'attachment', label: '附件', type: 'file', accept: 'image/*,.pdf,.doc,.docx', maxFiles: 5, colSpan: 2 },
];

const inboundDetailFields: DetailField[] = [
  { name: 'orderNo', label: '入库单号' },
  { name: 'enterprise', label: '入库企业' },
  { name: 'supplier', label: '供货单位' },
  { name: 'product', label: '产品名称' },
  { name: 'batchNo', label: '批次号' },
  { name: 'quantity', label: '数量' },
  { name: 'amount', label: '金额' },
  { name: 'date', label: '入库日期' },
  { name: 'type', label: '入库类型' },
  { name: 'warehouse', label: '存放位置' },
  { name: 'position', label: '仓位' },
  { name: 'status', label: '状态', type: 'badge' },
  { name: 'attachment', label: '附件', type: 'file', colSpan: 2 },
];

const outboundFormFields: FormField[] = [
  { name: 'orderNo', label: '出库单号', type: 'text', required: true, placeholder: '请输入出库单号' },
  { name: 'enterprise', label: '出库企业', type: 'text', required: true, placeholder: '请输入出库企业' },
  { name: 'buyer', label: '购买方', type: 'text', required: true, placeholder: '请输入购买方' },
  { name: 'buyerType', label: '购买方类型', type: 'select', required: true, options: [
    { label: '农户', value: '农户' },
    { label: '农业企业', value: '农业企业' },
    { label: '合作社', value: '合作社' },
  ]},
  { name: 'product', label: '产品名称', type: 'text', required: true, placeholder: '请输入产品名称' },
  { name: 'quantity', label: '数量', type: 'text', required: true, placeholder: '请输入数量' },
  { name: 'amount', label: '金额', type: 'text', required: true, placeholder: '请输入金额' },
  { name: 'date', label: '出库日期', type: 'date', required: true },
  { name: 'type', label: '出库类型', type: 'select', required: true, options: [
    { label: '销售出库', value: '销售出库' },
    { label: '退货出库', value: '退货出库' },
    { label: '报损出库', value: '报损出库' },
  ]},
  { name: 'purpose', label: '购买用途', type: 'text', required: true, placeholder: '请输入购买用途' },
  { name: 'region', label: '流向地区', type: 'text', required: true, placeholder: '请输入流向地区' },
  { name: 'status', label: '状态', type: 'select', required: true, options: [
    { label: '已出库', value: '已出库' },
    { label: '待出库', value: '待出库' },
  ]},
  { name: 'attachment', label: '附件', type: 'file', accept: 'image/*,.pdf,.doc,.docx', maxFiles: 5, colSpan: 2 },
];

const outboundDetailFields: DetailField[] = [
  { name: 'orderNo', label: '出库单号' },
  { name: 'enterprise', label: '出库企业' },
  { name: 'buyer', label: '购买方' },
  { name: 'buyerType', label: '购买方类型' },
  { name: 'product', label: '产品名称' },
  { name: 'quantity', label: '数量' },
  { name: 'amount', label: '金额' },
  { name: 'date', label: '出库日期' },
  { name: 'type', label: '出库类型' },
  { name: 'purpose', label: '购买用途' },
  { name: 'region', label: '流向地区' },
  { name: 'status', label: '状态', type: 'badge' },
  { name: 'attachment', label: '附件', type: 'file', colSpan: 2 },
];

const inventoryFormFields: FormField[] = [
  { name: 'productName', label: '产品名称', type: 'text', required: true, placeholder: '请输入产品名称' },
  { name: 'regNo', label: '登记证号', type: 'text', required: true, placeholder: '请输入登记证号' },
  { name: 'stock', label: '库存量', type: 'number', required: true, placeholder: '请输入库存量' },
  { name: 'safeStock', label: '安全库存', type: 'number', required: true, placeholder: '请输入安全库存' },
  { name: 'expiry', label: '有效期至', type: 'date', required: true },
  { name: 'productionEnterprise', label: '生产企业', type: 'text', required: true, placeholder: '请输入生产企业' },
  { name: 'status', label: '状态', type: 'select', required: true, options: [
    { label: '正常', value: '正常' },
    { label: '临期', value: '临期' },
    { label: '不足', value: '不足' },
    { label: '过期', value: '过期' },
  ]},
  { name: 'attachment', label: '附件', type: 'file', accept: 'image/*,.pdf,.doc,.docx', maxFiles: 5, colSpan: 2 },
];

const inventoryDetailFields: DetailField[] = [
  { name: 'productName', label: '产品名称' },
  { name: 'regNo', label: '登记证号' },
  { name: 'stock', label: '库存量' },
  { name: 'safeStock', label: '安全库存' },
  { name: 'expiry', label: '有效期至' },
  { name: 'productionEnterprise', label: '生产企业' },
  { name: 'status', label: '状态', type: 'badge' },
  { name: 'attachment', label: '附件', type: 'file', colSpan: 2 },
];

// ==================== 页面组件 ====================

export default function BusinessLedgerPage() {
  const [tab, setTab] = useState('all');

  // 搜索与筛选
  const [inboundSearch, setInboundSearch] = useState('');
  const [outboundSearch, setOutboundSearch] = useState('');
  const [stockSearch, setStockSearch] = useState('');
  const [alertSearch, setAlertSearch] = useState('');
  const [inboundType, setInboundType] = useState('all');
  const [outboundType, setOutboundType] = useState('all');
  const [alertLevel, setAlertLevel] = useState('all');
  const [handledFilter, setHandledFilter] = useState('all');

  // 数据状态
  const [inboundData, setInboundData] = useState<InboundRecord[]>(
    (initialInboundRecords as unknown as InboundRecord[]).map((r) => ({ ...r, attachment: [] }))
  );
  const [outboundData, setOutboundData] = useState<OutboundRecord[]>(
    (initialOutboundRecords as unknown as OutboundRecord[]).map((r) => ({ ...r, attachment: [] }))
  );
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>(
    (initialInventoryData as unknown as InventoryItem[]).map((item, i) => ({
      ...item,
      id: `inv-${i + 1}`,
      productionEnterprise: '安徽农药化工集团',
      attachment: [],
    }))
  );

  // ===== 入库 CRUD 状态 =====
  const [inboundFormOpen, setInboundFormOpen] = useState(false);
  const [inboundFormMode, setInboundFormMode] = useState<'add' | 'edit'>('add');
  const [inboundFormValues, setInboundFormValues] = useState<Record<string, unknown>>({});
  const [inboundEditingId, setInboundEditingId] = useState<string | null>(null);
  const [inboundDetailOpen, setInboundDetailOpen] = useState(false);
  const [inboundDetailData, setInboundDetailData] = useState<Record<string, unknown> | null>(null);
  const [inboundDeleteOpen, setInboundDeleteOpen] = useState(false);
  const [inboundDeleteId, setInboundDeleteId] = useState<string | null>(null);
  const [inboundDeleteName, setInboundDeleteName] = useState('');

  // ===== 出库 CRUD 状态 =====
  const [outboundFormOpen, setOutboundFormOpen] = useState(false);
  const [outboundFormMode, setOutboundFormMode] = useState<'add' | 'edit'>('add');
  const [outboundFormValues, setOutboundFormValues] = useState<Record<string, unknown>>({});
  const [outboundEditingId, setOutboundEditingId] = useState<string | null>(null);
  const [outboundDetailOpen, setOutboundDetailOpen] = useState(false);
  const [outboundDetailData, setOutboundDetailData] = useState<Record<string, unknown> | null>(null);
  const [outboundDeleteOpen, setOutboundDeleteOpen] = useState(false);
  const [outboundDeleteId, setOutboundDeleteId] = useState<string | null>(null);
  const [outboundDeleteName, setOutboundDeleteName] = useState('');

  // ===== 在库库存 CRUD 状态 =====
  const [inventoryFormOpen, setInventoryFormOpen] = useState(false);
  const [inventoryFormMode, setInventoryFormMode] = useState<'add' | 'edit'>('add');
  const [inventoryFormValues, setInventoryFormValues] = useState<Record<string, unknown>>({});
  const [inventoryEditingId, setInventoryEditingId] = useState<string | null>(null);
  const [inventoryDetailOpen, setInventoryDetailOpen] = useState(false);
  const [inventoryDetailData, setInventoryDetailData] = useState<Record<string, unknown> | null>(null);
  const [inventoryDeleteOpen, setInventoryDeleteOpen] = useState(false);
  const [inventoryDeleteId, setInventoryDeleteId] = useState<string | null>(null);
  const [inventoryDeleteName, setInventoryDeleteName] = useState('');

  // ==================== 过滤逻辑 ====================

  const filteredInbound = useMemo(() =>
    inboundData.filter((r) => {
      if (inboundSearch && !r.product.includes(inboundSearch) && !r.orderNo.includes(inboundSearch) && !r.enterprise.includes(inboundSearch)) return false;
      if (inboundType !== 'all' && r.type !== inboundType) return false;
      return true;
    }),
    [inboundData, inboundSearch, inboundType]
  );

  const filteredOutbound = useMemo(() =>
    outboundData.filter((r) => {
      if (outboundSearch && !r.product.includes(outboundSearch) && !r.orderNo.includes(outboundSearch) && !r.buyer.includes(outboundSearch)) return false;
      if (outboundType !== 'all' && r.type !== outboundType) return false;
      return true;
    }),
    [outboundData, outboundSearch, outboundType]
  );

  const filteredStock = useMemo(() =>
    inventoryList.filter((r) => {
      if (stockSearch && !r.productName.includes(stockSearch) && !r.regNo.includes(stockSearch)) return false;
      return true;
    }),
    [inventoryList, stockSearch]
  );

  const filteredAlerts = useMemo(() =>
    alertRecords.filter((r) => {
      if (alertSearch && !r.product.includes(alertSearch) && !r.enterprise.includes(alertSearch) && !r.detail.includes(alertSearch)) return false;
      if (alertLevel !== 'all' && r.level !== alertLevel) return false;
      if (handledFilter === 'unhandled' && r.handled) return false;
      if (handledFilter === 'handled' && !r.handled) return false;
      return true;
    }),
    [alertSearch, alertLevel, handledFilter]
  );

  const unhandledCount = alertRecords.filter(a => !a.handled).length;

  // ==================== 入库 CRUD 操作 ====================

  const openInboundAdd = () => {
    setInboundFormMode('add');
    setInboundFormValues({ status: '已入库', type: '采购入库', attachment: [] });
    setInboundEditingId(null);
    setInboundFormOpen(true);
  };

  const openInboundEdit = (item: InboundRecord) => {
    setInboundFormMode('edit');
    setInboundFormValues({ ...item, attachment: item.attachment || [] });
    setInboundEditingId(item.id);
    setInboundFormOpen(true);
  };

  const openInboundDetail = (item: InboundRecord) => {
    setInboundDetailData({ ...item });
    setInboundDetailOpen(true);
  };

  const openInboundDelete = (item: InboundRecord) => {
    setInboundDeleteId(item.id);
    setInboundDeleteName(item.orderNo);
    setInboundDeleteOpen(true);
  };

  const handleInboundFormChange = (name: string, value: unknown) => {
    setInboundFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleInboundFormSubmit = () => {
    if (!inboundFormValues.orderNo) {
      toast.error('请填写入库单号');
      return;
    }
    if (inboundFormMode === 'add') {
      const newItem: InboundRecord = {
        id: `in-${Date.now()}`,
        orderNo: String(inboundFormValues.orderNo || ''),
        enterprise: String(inboundFormValues.enterprise || ''),
        enterpriseId: String(inboundFormValues.enterpriseId || ''),
        supplier: String(inboundFormValues.supplier || ''),
        product: String(inboundFormValues.product || ''),
        batchNo: String(inboundFormValues.batchNo || ''),
        quantity: String(inboundFormValues.quantity || ''),
        amount: String(inboundFormValues.amount || ''),
        date: String(inboundFormValues.date || ''),
        type: String(inboundFormValues.type || '采购入库'),
        warehouse: String(inboundFormValues.warehouse || ''),
        position: String(inboundFormValues.position || ''),
        status: String(inboundFormValues.status || '已入库'),
        attachment: (inboundFormValues.attachment as UploadedFile[]) || [],
      };
      setInboundData((prev) => [newItem, ...prev]);
      toast.success('新增成功', { description: `入库记录「${newItem.orderNo}」已添加` });
    } else {
      setInboundData((prev) =>
        prev.map((item) =>
          item.id === inboundEditingId
            ? { ...item, ...inboundFormValues, attachment: (inboundFormValues.attachment as UploadedFile[]) || item.attachment || [] }
            : item
        )
      );
      toast.success('编辑成功', { description: `入库记录「${inboundFormValues.orderNo}」已更新` });
    }
    setInboundFormOpen(false);
  };

  const handleInboundDelete = () => {
    setInboundData((prev) => prev.filter((item) => item.id !== inboundDeleteId));
    toast.success('删除成功', { description: `入库记录「${inboundDeleteName}」已删除` });
    setInboundDeleteOpen(false);
  };

  // ==================== 出库 CRUD 操作 ====================

  const openOutboundAdd = () => {
    setOutboundFormMode('add');
    setOutboundFormValues({ status: '已出库', type: '销售出库', buyerType: '农户', attachment: [] });
    setOutboundEditingId(null);
    setOutboundFormOpen(true);
  };

  const openOutboundEdit = (item: OutboundRecord) => {
    setOutboundFormMode('edit');
    setOutboundFormValues({ ...item, attachment: item.attachment || [] });
    setOutboundEditingId(item.id);
    setOutboundFormOpen(true);
  };

  const openOutboundDetail = (item: OutboundRecord) => {
    setOutboundDetailData({ ...item });
    setOutboundDetailOpen(true);
  };

  const openOutboundDelete = (item: OutboundRecord) => {
    setOutboundDeleteId(item.id);
    setOutboundDeleteName(item.orderNo);
    setOutboundDeleteOpen(true);
  };

  const handleOutboundFormChange = (name: string, value: unknown) => {
    setOutboundFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleOutboundFormSubmit = () => {
    if (!outboundFormValues.orderNo) {
      toast.error('请填写出库单号');
      return;
    }
    if (outboundFormMode === 'add') {
      const newItem: OutboundRecord = {
        id: `out-${Date.now()}`,
        orderNo: String(outboundFormValues.orderNo || ''),
        enterprise: String(outboundFormValues.enterprise || ''),
        enterpriseId: String(outboundFormValues.enterpriseId || ''),
        buyer: String(outboundFormValues.buyer || ''),
        buyerType: String(outboundFormValues.buyerType || '农户'),
        product: String(outboundFormValues.product || ''),
        quantity: String(outboundFormValues.quantity || ''),
        amount: String(outboundFormValues.amount || ''),
        date: String(outboundFormValues.date || ''),
        type: String(outboundFormValues.type || '销售出库'),
        purpose: String(outboundFormValues.purpose || ''),
        region: String(outboundFormValues.region || ''),
        status: String(outboundFormValues.status || '已出库'),
        attachment: (outboundFormValues.attachment as UploadedFile[]) || [],
      };
      setOutboundData((prev) => [newItem, ...prev]);
      toast.success('新增成功', { description: `出库记录「${newItem.orderNo}」已添加` });
    } else {
      setOutboundData((prev) =>
        prev.map((item) =>
          item.id === outboundEditingId
            ? { ...item, ...outboundFormValues, attachment: (outboundFormValues.attachment as UploadedFile[]) || item.attachment || [] }
            : item
        )
      );
      toast.success('编辑成功', { description: `出库记录「${outboundFormValues.orderNo}」已更新` });
    }
    setOutboundFormOpen(false);
  };

  const handleOutboundDelete = () => {
    setOutboundData((prev) => prev.filter((item) => item.id !== outboundDeleteId));
    toast.success('删除成功', { description: `出库记录「${outboundDeleteName}」已删除` });
    setOutboundDeleteOpen(false);
  };

  // ==================== 在库库存 CRUD 操作 ====================

  const openInventoryAdd = () => {
    setInventoryFormMode('add');
    setInventoryFormValues({ status: '正常', attachment: [] });
    setInventoryEditingId(null);
    setInventoryFormOpen(true);
  };

  const openInventoryEdit = (item: InventoryItem) => {
    setInventoryFormMode('edit');
    setInventoryFormValues({ ...item, attachment: item.attachment || [] });
    setInventoryEditingId(item.id);
    setInventoryFormOpen(true);
  };

  const openInventoryDetail = (item: InventoryItem) => {
    setInventoryDetailData({ ...item });
    setInventoryDetailOpen(true);
  };

  const openInventoryDelete = (item: InventoryItem) => {
    setInventoryDeleteId(item.id);
    setInventoryDeleteName(item.productName);
    setInventoryDeleteOpen(true);
  };

  const handleInventoryFormChange = (name: string, value: unknown) => {
    setInventoryFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleInventoryFormSubmit = () => {
    if (!inventoryFormValues.productName) {
      toast.error('请填写产品名称');
      return;
    }
    if (inventoryFormMode === 'add') {
      const newItem: InventoryItem = {
        id: `inv-${Date.now()}`,
        enterpriseId: String(inventoryFormValues.enterpriseId || ''),
        productName: String(inventoryFormValues.productName || ''),
        regNo: String(inventoryFormValues.regNo || ''),
        stock: Number(inventoryFormValues.stock || 0),
        safeStock: Number(inventoryFormValues.safeStock || 0),
        expiry: String(inventoryFormValues.expiry || ''),
        productionEnterprise: String(inventoryFormValues.productionEnterprise || ''),
        status: String(inventoryFormValues.status || '正常'),
        attachment: (inventoryFormValues.attachment as UploadedFile[]) || [],
      };
      setInventoryList((prev) => [newItem, ...prev]);
      toast.success('新增成功', { description: `库存记录「${newItem.productName}」已添加` });
    } else {
      setInventoryList((prev) =>
        prev.map((item) =>
          item.id === inventoryEditingId
            ? {
                ...item,
                ...inventoryFormValues,
                stock: Number(inventoryFormValues.stock ?? item.stock),
                safeStock: Number(inventoryFormValues.safeStock ?? item.safeStock),
                attachment: (inventoryFormValues.attachment as UploadedFile[]) || item.attachment || [],
              }
            : item
        )
      );
      toast.success('编辑成功', { description: `库存记录「${inventoryFormValues.productName}」已更新` });
    }
    setInventoryFormOpen(false);
  };

  const handleInventoryDelete = () => {
    setInventoryList((prev) => prev.filter((item) => item.id !== inventoryDeleteId));
    toast.success('删除成功', { description: `库存记录「${inventoryDeleteName}」已删除` });
    setInventoryDeleteOpen(false);
  };

  // ==================== 渲染 ====================

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
            <LogIn className="mr-1 h-3.5 w-3.5" />入库记录({inboundData.length})
          </TabsTrigger>
          <TabsTrigger value="outbound">
            <LogOut className="mr-1 h-3.5 w-3.5" />出库记录({outboundData.length})
          </TabsTrigger>
          <TabsTrigger value="stock">
            <Package className="mr-1 h-3.5 w-3.5" />在库库存({inventoryList.length})
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
                  {inventoryList.map((item) => (
                    <TableRow key={item.id}>
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
                <span>共 {inventoryList.length} 种产品</span>
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
            <div className="flex-1" />
            <Button onClick={openInboundAdd}>
              <Plus className="mr-1 h-4 w-4" />新增入库记录
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">{inboundData.length}</p>
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
                    <TableHead className="text-center w-[180px]">操作</TableHead>
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
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openInboundDetail(r)}>
                            <Eye className="mr-0.5 h-3.5 w-3.5" />查看
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openInboundEdit(r)}>
                            <Pencil className="mr-0.5 h-3.5 w-3.5" />编辑
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => openInboundDelete(r)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredInbound.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                        暂无数据
                      </TableCell>
                    </TableRow>
                  )}
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
            <div className="flex-1" />
            <Button onClick={openOutboundAdd}>
              <Plus className="mr-1 h-4 w-4" />新增出库记录
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">{outboundData.length}</p>
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
                    <TableHead className="text-center w-[180px]">操作</TableHead>
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
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openOutboundDetail(r)}>
                            <Eye className="mr-0.5 h-3.5 w-3.5" />查看
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openOutboundEdit(r)}>
                            <Pencil className="mr-0.5 h-3.5 w-3.5" />编辑
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => openOutboundDelete(r)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredOutbound.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={13} className="text-center py-8 text-muted-foreground">
                        暂无数据
                      </TableCell>
                    </TableRow>
                  )}
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
            <div className="flex-1" />
            <Button onClick={openInventoryAdd}>
              <Plus className="mr-1 h-4 w-4" />新增库存记录
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">{inventoryList.length}</p>
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
                <p className="text-2xl font-bold text-amber-600">{inventoryList.filter(i => i.status === '不足').length}种</p>
                <p className="mt-1 text-sm text-muted-foreground">库存不足产品</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{inventoryList.filter(i => i.status === '临期' || i.status === '过期').length}批次</p>
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
                    <TableHead className="text-right">库存量</TableHead>
                    <TableHead className="text-right">安全库存</TableHead>
                    <TableHead>库存占比</TableHead>
                    <TableHead>有效期至</TableHead>
                    <TableHead>生产企业</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead className="text-center w-[180px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStock.map((item) => {
                    const ratio = item.safeStock > 0 ? item.stock / item.safeStock : 0;
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell className="font-mono text-sm">{item.regNo}</TableCell>
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
                        <TableCell className="text-sm">{item.productionEnterprise}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={stockStatusBg[item.status]}>
                            <span className={`inline-block h-1.5 w-1.5 rounded-full ${stockStatusColors[item.status]} mr-1`} />
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openInventoryDetail(item)}>
                              <Eye className="mr-0.5 h-3.5 w-3.5" />查看
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openInventoryEdit(item)}>
                              <Pencil className="mr-0.5 h-3.5 w-3.5" />编辑
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => openInventoryDelete(item)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredStock.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        暂无数据
                      </TableCell>
                    </TableRow>
                  )}
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

      {/* ===== 入库 CRUD 弹窗 ===== */}
      <FormModal
        open={inboundFormOpen}
        onClose={() => setInboundFormOpen(false)}
        title={inboundFormMode === 'add' ? '新增入库记录' : '编辑入库记录'}
        fields={inboundFormFields}
        values={inboundFormValues}
        onChange={handleInboundFormChange}
        onSubmit={handleInboundFormSubmit}
      />
      <DetailModal
        open={inboundDetailOpen}
        onClose={() => setInboundDetailOpen(false)}
        title="入库记录详情"
        fields={inboundDetailFields}
        data={inboundDetailData}
      />
      <DeleteDialog
        open={inboundDeleteOpen}
        onClose={() => setInboundDeleteOpen(false)}
        onConfirm={handleInboundDelete}
        description={`确定要删除入库记录「${inboundDeleteName}」吗？删除后将无法恢复。`}
      />

      {/* ===== 出库 CRUD 弹窗 ===== */}
      <FormModal
        open={outboundFormOpen}
        onClose={() => setOutboundFormOpen(false)}
        title={outboundFormMode === 'add' ? '新增出库记录' : '编辑出库记录'}
        fields={outboundFormFields}
        values={outboundFormValues}
        onChange={handleOutboundFormChange}
        onSubmit={handleOutboundFormSubmit}
      />
      <DetailModal
        open={outboundDetailOpen}
        onClose={() => setOutboundDetailOpen(false)}
        title="出库记录详情"
        fields={outboundDetailFields}
        data={outboundDetailData}
      />
      <DeleteDialog
        open={outboundDeleteOpen}
        onClose={() => setOutboundDeleteOpen(false)}
        onConfirm={handleOutboundDelete}
        description={`确定要删除出库记录「${outboundDeleteName}」吗？删除后将无法恢复。`}
      />

      {/* ===== 在库库存 CRUD 弹窗 ===== */}
      <FormModal
        open={inventoryFormOpen}
        onClose={() => setInventoryFormOpen(false)}
        title={inventoryFormMode === 'add' ? '新增库存记录' : '编辑库存记录'}
        fields={inventoryFormFields}
        values={inventoryFormValues}
        onChange={handleInventoryFormChange}
        onSubmit={handleInventoryFormSubmit}
      />
      <DetailModal
        open={inventoryDetailOpen}
        onClose={() => setInventoryDetailOpen(false)}
        title="库存记录详情"
        fields={inventoryDetailFields}
        data={inventoryDetailData}
      />
      <DeleteDialog
        open={inventoryDeleteOpen}
        onClose={() => setInventoryDeleteOpen(false)}
        onConfirm={handleInventoryDelete}
        description={`确定要删除库存记录「${inventoryDeleteName}」吗？删除后将无法恢复。`}
      />
    </div>
  );
}
