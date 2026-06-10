import type {
  PlantPlan, PlotInfo, ProgressRecord, DisasterReport,
  SyncRecord, TodoItem, UserInfo, LayerConfig, StatisticsData,
  MapEntity, MapPlot
} from '@/types';

// 用户信息
export const mockUser: UserInfo = {
  name: '张三',
  phone: '138****5678',
  entity: '张三种粮大户',
  region: '蚌埠市怀远县龙亢镇',
  role: '种植户',
  avatar: '',
};

// 地块数据
export const mockPlots: PlotInfo[] = [
  { id: 'DK-001', planId: 'ZZ-001', plotCode: 'DK-001', area: 200, landSource: '自有', description: '龙亢镇汪圩村东地块', longitude: 117.123, latitude: 33.456 },
  { id: 'DK-002', planId: 'ZZ-001', plotCode: 'DK-002', area: 180, landSource: '流转', description: '龙亢镇汪圩村南地块', longitude: 117.128, latitude: 33.452 },
  { id: 'DK-003', planId: 'ZZ-001', plotCode: 'DK-003', area: 120, landSource: '流转', description: '龙亢镇汪圩村西地块', longitude: 117.118, latitude: 33.460 },
  { id: 'DK-004', planId: 'ZZ-002', plotCode: 'DK-004', area: 150, landSource: '自有', description: '龙亢镇李庄村北地块', longitude: 117.135, latitude: 33.470 },
  { id: 'DK-005', planId: 'ZZ-002', plotCode: 'DK-005', area: 150, landSource: '流转', description: '龙亢镇李庄村南地块', longitude: 117.140, latitude: 33.465 },
  { id: 'DK-006', planId: 'ZZ-003', plotCode: 'DK-006', area: 100, landSource: '自有', description: '龙亢镇赵圩村地块', longitude: 117.110, latitude: 33.445 },
  { id: 'DK-007', planId: 'ZZ-003', plotCode: 'DK-007', area: 100, landSource: '流转', description: '龙亢镇赵圩村东地块', longitude: 117.115, latitude: 33.442 },
  { id: 'DK-008', planId: 'ZZ-004', plotCode: 'DK-008', area: 250, landSource: '自有', description: '龙亢镇大圩村地块', longitude: 117.145, latitude: 33.475 },
  { id: 'DK-009', planId: 'ZZ-005', plotCode: 'DK-009', area: 160, landSource: '流转', description: '龙亢镇小圩村地块', longitude: 117.105, latitude: 33.438 },
  { id: 'DK-010', planId: 'ZZ-005', plotCode: 'DK-010', area: 140, landSource: '自有', description: '龙亢镇小圩村南地块', longitude: 117.100, latitude: 33.435 },
];

// 种植计划数据
export const mockPlans: PlantPlan[] = [
  {
    id: 'ZZ-001', year: '2026', cropType: '青贮玉米', plantType: '混合',
    area: 500, expectedYield: 1500, status: 'approved', remark: '',
    isOffline: false, plots: mockPlots.filter(p => p.planId === 'ZZ-001'),
    attachments: [{ id: 'a1', name: '土地流转合同.pdf', type: 'pdf', url: '' }],
    createdAt: '2026-06-05', updatedAt: '2026-06-05',
  },
  {
    id: 'ZZ-002', year: '2026', cropType: '青贮玉米', plantType: '流转土地',
    area: 300, expectedYield: 900, status: 'draft', remark: '草稿待完善',
    isOffline: true, plots: mockPlots.filter(p => p.planId === 'ZZ-002'),
    attachments: [], createdAt: '2026-06-10', updatedAt: '2026-06-10 14:30',
  },
  {
    id: 'ZZ-003', year: '2026', cropType: '青贮高粱', plantType: '自有土地',
    area: 200, expectedYield: 600, status: 'pending', remark: '',
    isOffline: false, plots: mockPlots.filter(p => p.planId === 'ZZ-003'),
    attachments: [], createdAt: '2026-06-08', updatedAt: '2026-06-08',
  },
  {
    id: 'ZZ-004', year: '2026', cropType: '青贮玉米', plantType: '自有土地',
    area: 250, expectedYield: 750, status: 'approved', remark: '',
    isOffline: false, plots: mockPlots.filter(p => p.planId === 'ZZ-004'),
    attachments: [], createdAt: '2026-05-20', updatedAt: '2026-05-25',
  },
  {
    id: 'ZZ-005', year: '2026', cropType: '青贮玉米', plantType: '混合',
    area: 300, expectedYield: 900, status: 'rejected', remark: '面积信息有误，请核实后重新提交',
    isOffline: false, plots: mockPlots.filter(p => p.planId === 'ZZ-005'),
    attachments: [], createdAt: '2026-06-01', updatedAt: '2026-06-03',
  },
];

// 进度记录
export const mockProgress: ProgressRecord[] = [
  {
    id: 'PR-001', planId: 'ZZ-001', recordDate: '2026-06-01',
    growthStage: '生长期', avgHeight: 120, leafCount: 12, growthEval: '良好',
    remark: '', isOffline: false, photos: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'],
    plotIds: ['DK-001', 'DK-002'], verified: true, createdAt: '2026-06-01 10:30',
  },
  {
    id: 'PR-002', planId: 'ZZ-001', recordDate: '2026-05-15',
    growthStage: '拔节期', avgHeight: 80, leafCount: 10, growthEval: '良好',
    remark: '', isOffline: true, photos: ['photo4.jpg', 'photo5.jpg'],
    plotIds: ['DK-001', 'DK-002', 'DK-003'], verified: false, createdAt: '2026-05-15 14:20',
  },
  {
    id: 'PR-003', planId: 'ZZ-001', recordDate: '2026-05-01',
    growthStage: '苗期', avgHeight: 30, leafCount: 6, growthEval: '正常',
    remark: '出苗整齐', isOffline: false, photos: ['photo6.jpg'],
    plotIds: ['DK-001'], verified: true, createdAt: '2026-05-01 09:15',
  },
  {
    id: 'PR-004', planId: 'ZZ-004', recordDate: '2026-06-05',
    growthStage: '生长期', avgHeight: 110, leafCount: 11, growthEval: '良好',
    remark: '', isOffline: false, photos: ['photo7.jpg', 'photo8.jpg'],
    plotIds: ['DK-008'], verified: true, createdAt: '2026-06-05 16:00',
  },
  {
    id: 'PR-005', planId: 'ZZ-004', recordDate: '2026-05-20',
    growthStage: '拔节期', avgHeight: 75, leafCount: 9, growthEval: '正常',
    remark: '', isOffline: false, photos: ['photo9.jpg'],
    plotIds: ['DK-008'], verified: true, createdAt: '2026-05-20 11:30',
  },
  {
    id: 'PR-006', planId: 'ZZ-003', recordDate: '2026-06-08',
    growthStage: '苗期', avgHeight: 25, leafCount: 5, growthEval: '偏差',
    remark: '部分地块出苗不齐', isOffline: false, photos: ['photo10.jpg'],
    plotIds: ['DK-006', 'DK-007'], verified: false, createdAt: '2026-06-08 15:45',
  },
  {
    id: 'PR-007', planId: 'ZZ-001', recordDate: '2026-04-20',
    growthStage: '苗期', avgHeight: 15, leafCount: 4, growthEval: '正常',
    remark: '播种完成', isOffline: false, photos: [],
    plotIds: ['DK-001', 'DK-002', 'DK-003'], verified: true, createdAt: '2026-04-20 08:00',
  },
  {
    id: 'PR-008', planId: 'ZZ-004', recordDate: '2026-06-10',
    growthStage: '生长期', avgHeight: 130, leafCount: 13, growthEval: '良好',
    remark: '', isOffline: true, photos: ['photo11.jpg', 'photo12.jpg'],
    plotIds: ['DK-008'], verified: false, createdAt: '2026-06-10 09:30',
  },
];

// 受灾申报
export const mockDisasters: DisasterReport[] = [
  {
    id: 'BC-001', disasterType: '洪涝', disasterDate: '2026-06-01',
    affectedArea: 200, totalLossArea: 180, estimatedYield: 360,
    storageEntity: '安徽青贮公司', storageWeight: 360, expectedPrice: 300,
    deadline: '2026-06-15', status: 'pending', isOffline: false,
    plotIds: ['DK-001'], photos: ['d1.jpg', 'd2.jpg', 'd3.jpg'],
    description: '连续暴雨导致地块积水严重，玉米倒伏面积约180亩',
    createdAt: '2026-06-06',
  },
  {
    id: 'BC-002', disasterType: '干旱', disasterDate: '2026-06-05',
    affectedArea: 150, totalLossArea: 100, estimatedYield: 300,
    storageEntity: '蚌埠收储中心', storageWeight: 300, expectedPrice: 280,
    deadline: '2026-06-25', status: 'pending', isOffline: false,
    plotIds: ['DK-006'], photos: ['d4.jpg', 'd5.jpg'],
    description: '持续高温干旱，部分地块玉米叶片卷曲',
    createdAt: '2026-06-10',
  },
  {
    id: 'BC-003', disasterType: '风灾', disasterDate: '2026-05-28',
    affectedArea: 80, totalLossArea: 50, estimatedYield: 150,
    storageEntity: '安徽青贮公司', storageWeight: 150, expectedPrice: 260,
    deadline: '2026-06-20', status: 'approved', isOffline: false,
    plotIds: ['DK-008'], photos: ['d6.jpg'],
    description: '大风导致部分玉米倒伏',
    createdAt: '2026-05-29',
  },
];

// 同步历史
export const mockSyncRecords: SyncRecord[] = [
  { id: 'SY-001', syncTime: '2026-06-10 15:30', syncType: 'auto', recordCount: 3, status: 'success', detail: '同步成功：3条数据' },
  { id: 'SY-002', syncTime: '2026-06-09 10:15', syncType: 'manual', recordCount: 1, status: 'success', detail: '同步成功：1条数据' },
  { id: 'SY-003', syncTime: '2026-06-08 08:30', syncType: 'auto', recordCount: 0, status: 'failed', detail: '同步失败：网络错误' },
  { id: 'SY-004', syncTime: '2026-06-07 16:45', syncType: 'auto', recordCount: 2, status: 'success', detail: '同步成功：2条数据' },
  { id: 'SY-005', syncTime: '2026-06-06 09:00', syncType: 'manual', recordCount: 5, status: 'success', detail: '同步成功：5条数据' },
];

// 待办事项
export const mockTodos: TodoItem[] = [
  { id: 't1', type: 'progress', title: '待填报进度', description: '播种进度尚未填报，请尽快填报', actionLabel: '去填报', actionPath: '/progress/new', priority: 'high' },
  { id: 't2', type: 'verify', title: '待核实进度', description: '6月1日生长记录待核实', actionLabel: '去核实', actionPath: '/progress', priority: 'medium' },
  { id: 't3', type: 'approved', title: '审核已通过', description: '种植计划ZZ-001已通过审核', actionLabel: '查看详情', actionPath: '/tasks/ZZ-001', priority: 'low' },
];

// 图层配置
export const mockLayers: LayerConfig[] = [
  { id: 'entity', name: '种植主体位置（点）', visible: true, type: 'point', color: '#1A5C9A', subOptions: [{ label: '按面积分级', value: 'graded', selected: false }, { label: '统一图标', value: 'uniform', selected: true }] },
  { id: 'plot', name: '种植地块范围（面）', visible: true, type: 'polygon', color: '#2E7D32', subOptions: [{ label: '按品种着色', value: 'byCrop', selected: true }, { label: '按主体着色', value: 'byEntity', selected: false }] },
  { id: 'storage', name: '收储站点位置', visible: true, type: 'point', color: '#E6A23C' },
  { id: 'disaster', name: '受灾地块', visible: false, type: 'polygon', color: '#F56C6C' },
  { id: 'boundary', name: '行政区划边界', visible: true, type: 'line', color: '#909399' },
  { id: 'road', name: '道路水系', visible: true, type: 'line', color: '#C0C4CC' },
  { id: 'satellite', name: '卫星影像', visible: false, type: 'polygon', color: '#333' },
];

// 统计数据
export const mockStatistics: StatisticsData = {
  personalArea: 500,
  personalYield: 1500,
  personalSown: 500,
  personalHarvested: 0,
  regionEntities: 256,
  regionArea: 16.3,
  regionYield: 48.9,
  regionStorageEntities: 12,
  regionStorageWeight: 45,
  trendData: [
    { year: '2022', area: 38 },
    { year: '2023', area: 42 },
    { year: '2024', area: 45 },
    { year: '2025', area: 48 },
    { year: '2026', area: 50 },
  ],
};

// 地图主体
export const mockMapEntities: MapEntity[] = [
  { id: 'e1', name: '张三种粮大户', type: '种植户', longitude: 117.123, latitude: 33.456, area: 500, cropType: '青贮玉米', expectedYield: 1500, plotCount: 3, phone: '138****5678', region: '蚌埠市怀远县龙亢镇' },
  { id: 'e2', name: '李四家庭农场', type: '种植户', longitude: 117.145, latitude: 33.475, area: 250, cropType: '青贮玉米', expectedYield: 750, plotCount: 1, phone: '139****1234', region: '蚌埠市怀远县龙亢镇' },
  { id: 'e3', name: '王五种植合作社', type: '种植户', longitude: 117.110, latitude: 33.445, area: 200, cropType: '青贮高粱', expectedYield: 600, plotCount: 2, phone: '137****5678', region: '蚌埠市怀远县龙亢镇' },
  { id: 'e4', name: '赵六农业公司', type: '种植户', longitude: 117.135, latitude: 33.470, area: 300, cropType: '青贮玉米', expectedYield: 900, plotCount: 2, phone: '136****9012', region: '蚌埠市怀远县龙亢镇' },
  { id: 'e5', name: '钱七农场', type: '种植户', longitude: 117.105, latitude: 33.438, area: 300, cropType: '青贮玉米', expectedYield: 900, plotCount: 2, phone: '135****3456', region: '蚌埠市怀远县龙亢镇' },
];

// 地图地块
export const mockMapPlots: MapPlot[] = [
  {
    id: 'DK-001', entityId: 'e1', plotCode: 'DK-001', area: 200, cropType: '青贮玉米',
    sowDate: '2026-03-15', harvestDate: '2026-08-15', region: '龙亢镇汪圩村',
    latestRecord: { date: '2026-06-01', avgHeight: 120, growthEval: '良好' },
    polygon: [[117.120, 33.458], [117.126, 33.458], [117.126, 33.454], [117.120, 33.454]],
  },
  {
    id: 'DK-002', entityId: 'e1', plotCode: 'DK-002', area: 180, cropType: '青贮玉米',
    sowDate: '2026-03-15', harvestDate: '2026-08-15', region: '龙亢镇汪圩村',
    latestRecord: { date: '2026-06-01', avgHeight: 115, growthEval: '良好' },
    polygon: [[117.125, 33.454], [117.131, 33.454], [117.131, 33.450], [117.125, 33.450]],
  },
  {
    id: 'DK-003', entityId: 'e1', plotCode: 'DK-003', area: 120, cropType: '青贮玉米',
    sowDate: '2026-03-20', harvestDate: '2026-08-20', region: '龙亢镇汪圩村',
    latestRecord: { date: '2026-05-15', avgHeight: 80, growthEval: '良好' },
    polygon: [[117.115, 33.462], [117.121, 33.462], [117.121, 33.458], [117.115, 33.458]],
  },
  {
    id: 'DK-008', entityId: 'e2', plotCode: 'DK-008', area: 250, cropType: '青贮玉米',
    sowDate: '2026-03-10', harvestDate: '2026-08-10', region: '龙亢镇大圩村',
    latestRecord: { date: '2026-06-05', avgHeight: 110, growthEval: '良好' },
    polygon: [[117.142, 33.477], [117.148, 33.477], [117.148, 33.473], [117.142, 33.473]],
  },
  {
    id: 'DK-006', entityId: 'e3', plotCode: 'DK-006', area: 100, cropType: '青贮高粱',
    sowDate: '2026-04-01', harvestDate: '2026-09-01', region: '龙亢镇赵圩村',
    latestRecord: { date: '2026-06-08', avgHeight: 25, growthEval: '偏差' },
    polygon: [[117.107, 33.447], [117.113, 33.447], [117.113, 33.443], [117.107, 33.443]],
  },
  {
    id: 'DK-007', entityId: 'e3', plotCode: 'DK-007', area: 100, cropType: '青贮高粱',
    sowDate: '2026-04-01', harvestDate: '2026-09-01', region: '龙亢镇赵圩村',
    latestRecord: null,
    polygon: [[117.112, 33.444], [117.118, 33.444], [117.118, 33.440], [117.112, 33.440]],
  },
  {
    id: 'DK-004', entityId: 'e4', plotCode: 'DK-004', area: 150, cropType: '青贮玉米',
    sowDate: '2026-03-18', harvestDate: '2026-08-18', region: '龙亢镇李庄村',
    latestRecord: null,
    polygon: [[117.132, 33.472], [117.138, 33.472], [117.138, 33.468], [117.132, 33.468]],
  },
  {
    id: 'DK-005', entityId: 'e4', plotCode: 'DK-005', area: 150, cropType: '青贮玉米',
    sowDate: '2026-03-18', harvestDate: '2026-08-18', region: '龙亢镇李庄村',
    latestRecord: null,
    polygon: [[117.137, 33.467], [117.143, 33.467], [117.143, 33.463], [117.137, 33.463]],
  },
];

// 字典选项
export const dictOptions = {
  cropType: ['青贮玉米', '青贮高粱', '其他'],
  plantType: ['自有土地', '流转土地', '混合'],
  landSource: ['自有', '流转'],
  growthStage: ['苗期', '拔节期', '生长期', '成熟期'],
  growthEval: ['良好', '正常', '偏差', '异常'],
  disasterType: ['洪涝', '干旱', '风灾', '冰雹', '病虫害', '其他'],
  year: ['2026', '2025', '2024'],
  storageEntity: ['安徽青贮公司', '蚌埠收储中心', '怀远收储站'],
};
