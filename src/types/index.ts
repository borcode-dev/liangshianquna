// 类型定义

// 种植计划
export interface PlantPlan {
  id: string;
  year: string;
  cropType: string;
  plantType: string;
  area: number;
  expectedYield: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  remark: string;
  isOffline: boolean;
  plots: PlotInfo[];
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

// 地块信息
export interface PlotInfo {
  id: string;
  planId: string;
  plotCode: string;
  area: number;
  landSource: '自有' | '流转';
  description: string;
  longitude: number;
  latitude: number;
}

// 进度记录
export interface ProgressRecord {
  id: string;
  planId: string;
  recordDate: string;
  growthStage: string;
  avgHeight: number;
  leafCount: number;
  growthEval: string;
  remark: string;
  isOffline: boolean;
  photos: string[];
  plotIds: string[];
  verified: boolean;
  createdAt: string;
}

// 受灾申报
export interface DisasterReport {
  id: string;
  disasterType: string;
  disasterDate: string;
  affectedArea: number;
  totalLossArea: number;
  estimatedYield: number;
  storageEntity: string;
  storageWeight: number;
  expectedPrice: number;
  deadline: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  isOffline: boolean;
  plotIds: string[];
  photos: string[];
  description: string;
  createdAt: string;
}

// 附件
export interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
}

// 同步记录
export interface SyncRecord {
  id: string;
  syncTime: string;
  syncType: 'auto' | 'manual';
  recordCount: number;
  status: 'success' | 'failed' | 'syncing';
  detail: string;
}

// 待办事项
export interface TodoItem {
  id: string;
  type: 'progress' | 'verify' | 'approved' | 'disaster';
  title: string;
  description: string;
  actionLabel: string;
  actionPath: string;
  priority: 'high' | 'medium' | 'low';
}

// 用户信息
export interface UserInfo {
  name: string;
  phone: string;
  entity: string;
  region: string;
  role: string;
  avatar: string;
}

// 图层配置
export interface LayerConfig {
  id: string;
  name: string;
  visible: boolean;
  type: 'point' | 'polygon' | 'line';
  color?: string;
  subOptions?: { label: string; value: string; selected: boolean }[];
}

// 统计数据
export interface StatisticsData {
  personalArea: number;
  personalYield: number;
  personalSown: number;
  personalHarvested: number;
  regionEntities: number;
  regionArea: number;
  regionYield: number;
  regionStorageEntities: number;
  regionStorageWeight: number;
  trendData: { year: string; area: number }[];
}

// 地图主体标记
export interface MapEntity {
  id: string;
  name: string;
  type: string;
  longitude: number;
  latitude: number;
  area: number;
  cropType: string;
  expectedYield: number;
  plotCount: number;
  phone: string;
  region: string;
}

// 地图地块
export interface MapPlot {
  id: string;
  entityId: string;
  plotCode: string;
  area: number;
  cropType: string;
  sowDate: string;
  harvestDate: string;
  region: string;
  latestRecord: {
    date: string;
    avgHeight: number;
    growthEval: string;
  } | null;
  // 多边形顶点（模拟）
  polygon: [number, number][];
}
