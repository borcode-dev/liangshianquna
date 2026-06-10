import { create } from 'zustand';
import type { PlantPlan, PlotInfo, ProgressRecord, DisasterReport, SyncRecord, UserInfo, LayerConfig } from '@/types';
import { mockPlans, mockProgress, mockDisasters, mockSyncRecords, mockUser, mockLayers, mockPlots } from '@/lib/mock-data';

// App Store - 全局状态
interface AppState {
  user: UserInfo;
  isOnline: boolean;
  syncStatus: 'idle' | 'syncing' | 'success' | 'failed';
  lastSyncTime: string;
  offlineCount: number;
  setOnline: (online: boolean) => void;
  triggerSync: () => void;
  toggleOnline: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: mockUser,
  isOnline: true,
  syncStatus: 'idle',
  lastSyncTime: '2026-06-10 15:30',
  offlineCount: 3,
  setOnline: (online) => set({ isOnline: online }),
  triggerSync: () => {
    set({ syncStatus: 'syncing' });
    setTimeout(() => {
      set({ syncStatus: 'success', offlineCount: 0, lastSyncTime: new Date().toLocaleString('zh-CN') });
      setTimeout(() => set({ syncStatus: 'idle' }), 3000);
    }, 2000);
  },
  toggleOnline: () => set((s) => ({ isOnline: !s.isOnline })),
}));

// Plan Store - 种植计划
interface PlanState {
  plans: PlantPlan[];
  addPlan: (plan: PlantPlan) => void;
  updatePlan: (id: string, data: Partial<PlantPlan>) => void;
  deletePlan: (id: string) => void;
  addPlot: (planId: string, plot: PlotInfo) => void;
  removePlot: (planId: string, plotId: string) => void;
  updatePlot: (planId: string, plotId: string, data: Partial<PlotInfo>) => void;
}

export const usePlanStore = create<PlanState>((set) => ({
  plans: mockPlans,
  addPlan: (plan) => set((s) => ({ plans: [...s.plans, plan] })),
  updatePlan: (id, data) => set((s) => ({
    plans: s.plans.map(p => p.id === id ? { ...p, ...data } : p),
  })),
  deletePlan: (id) => set((s) => ({ plans: s.plans.filter(p => p.id !== id) })),
  addPlot: (planId, plot) => set((s) => ({
    plans: s.plans.map(p => p.id === planId ? { ...p, plots: [...p.plots, plot] } : p),
  })),
  removePlot: (planId, plotId) => set((s) => ({
    plans: s.plans.map(p => p.id === planId ? { ...p, plots: p.plots.filter(pl => pl.id !== plotId) } : p),
  })),
  updatePlot: (planId, plotId, data) => set((s) => ({
    plans: s.plans.map(p => p.id === planId ? { ...p, plots: p.plots.map(pl => pl.id === plotId ? { ...pl, ...data } : pl) } : p),
  })),
}));

// Progress Store - 进度记录
interface ProgressState {
  records: ProgressRecord[];
  addRecord: (record: ProgressRecord) => void;
  updateRecord: (id: string, data: Partial<ProgressRecord>) => void;
  deleteRecord: (id: string) => void;
}

export const useProgressStore = create<ProgressState>((set) => ({
  records: mockProgress,
  addRecord: (record) => set((s) => ({ records: [record, ...s.records] })),
  updateRecord: (id, data) => set((s) => ({
    records: s.records.map(r => r.id === id ? { ...r, ...data } : r),
  })),
  deleteRecord: (id) => set((s) => ({ records: s.records.filter(r => r.id !== id) })),
}));

// Disaster Store - 受灾申报
interface DisasterState {
  reports: DisasterReport[];
  addReport: (report: DisasterReport) => void;
  updateReport: (id: string, data: Partial<DisasterReport>) => void;
  deleteReport: (id: string) => void;
}

export const useDisasterStore = create<DisasterState>((set) => ({
  reports: mockDisasters,
  addReport: (report) => set((s) => ({ reports: [report, ...s.reports] })),
  updateReport: (id, data) => set((s) => ({
    reports: s.reports.map(r => r.id === id ? { ...r, ...data } : r),
  })),
  deleteReport: (id) => set((s) => ({ reports: s.reports.filter(r => r.id !== id) })),
}));

// Sync Store - 同步记录
interface SyncState {
  records: SyncRecord[];
  addRecord: (record: SyncRecord) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  records: mockSyncRecords,
  addRecord: (record) => set((s) => ({ records: [record, ...s.records] })),
}));

// Map Store - 地图图层
interface MapState {
  layers: LayerConfig[];
  toggleLayer: (id: string) => void;
  setLayerSubOption: (id: string, value: string) => void;
}

export const useMapStore = create<MapState>((set) => ({
  layers: mockLayers,
  toggleLayer: (id) => set((s) => ({
    layers: s.layers.map(l => l.id === id ? { ...l, visible: !l.visible } : l),
  })),
  setLayerSubOption: (id, value) => set((s) => ({
    layers: s.layers.map(l => l.id === id ? {
      ...l,
      subOptions: l.subOptions?.map(o => ({ ...o, selected: o.value === value })),
    } : l),
  })),
}));

// 全局所有地块
interface PlotState {
  plots: PlotInfo[];
  addPlot: (plot: PlotInfo) => void;
  removePlot: (id: string) => void;
  updatePlot: (id: string, data: Partial<PlotInfo>) => void;
}

export const usePlotStore = create<PlotState>((set) => ({
  plots: mockPlots,
  addPlot: (plot) => set((s) => ({ plots: [...s.plots, plot] })),
  removePlot: (id) => set((s) => ({ plots: s.plots.filter(p => p.id !== id) })),
  updatePlot: (id, data) => set((s) => ({
    plots: s.plots.map(p => p.id === id ? { ...p, ...data } : p),
  })),
}));
