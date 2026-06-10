import { useState, useEffect } from 'react';
import { RefreshCw, Wifi, WifiOff, Edit3, Trash2, Upload, CheckCircle, XCircle } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import { useAppStore, useSyncStore } from '@/stores';

interface OfflineItem {
  id: string;
  type: string;
  typeName: string;
  title: string;
  date: string;
}

export default function OfflineManage() {
  const { isOnline, lastSyncTime, offlineCount, syncStatus, triggerSync } = useAppStore();
  const { records } = useSyncStore();
  const [autoSync, setAutoSync] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const offlineItems: OfflineItem[] = [
    { id: 'ZZ-002', type: 'plan', typeName: '种植计划', title: '2026年青贮玉米种植计划（草稿）', date: '2026-06-10 14:30' },
    { id: 'PR-008', type: 'progress', typeName: '进度记录', title: '生长期记录-大圩村地块', date: '2026-06-10 09:30' },
    { id: 'BC-NEW', type: 'disaster', typeName: '受灾申报', title: '洪涝受灾申报-汪圩村', date: '2026-06-11 08:00' },
  ];

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <TopBar title="离线数据管理" />
      <div className="pt-14 px-4 pb-4">
        {/* 同步状态卡片 */}
        <div className="bg-white rounded-xl p-4 mt-3 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi size={18} className="text-green-500" />
              ) : (
                <WifiOff size={18} className="text-red-500" />
              )}
              <span className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                {isOnline ? '已联网' : '未联网'}
              </span>
            </div>
            <button
              onClick={triggerSync}
              disabled={!isOnline || syncStatus === 'syncing'}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#1A5C9A] text-white text-sm rounded-lg disabled:opacity-50"
            >
              <RefreshCw size={14} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
              {syncStatus === 'syncing' ? '同步中...' : '立即同步'}
            </button>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">最后同步：{lastSyncTime}</span>
            <span className="text-orange-500 font-medium">{offlineCount}条未同步</span>
          </div>
          {syncStatus === 'success' && (
            <p className="text-xs text-green-500 mt-2">同步成功！</p>
          )}
          {syncStatus === 'failed' && (
            <p className="text-xs text-red-500 mt-2">同步失败，请重试</p>
          )}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <span className="text-sm text-gray-600">自动同步</span>
            <button
              onClick={() => setAutoSync(!autoSync)}
              className={`relative w-11 h-6 rounded-full transition-colors ${autoSync ? 'bg-[#1A5C9A]' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${autoSync ? 'translate-x-5' : ''}`} />
            </button>
          </div>
        </div>

        {/* 未同步数据列表 */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-800 mb-2">未同步数据</h3>
          <div className="space-y-2">
            {offlineItems.map(item => (
              <div key={item.id} className="bg-white rounded-xl p-3 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-[#1A5C9A]">{item.typeName}</span>
                  <span className="text-xs text-gray-400">{item.date}</span>
                </div>
                <p className="text-sm text-gray-800 mb-2">{item.title}</p>
                <div className="flex gap-2">
                  <button className="flex items-center gap-1 text-xs text-gray-500 px-2 py-1 rounded border border-gray-200">
                    <Edit3 size={12} /> 编辑
                  </button>
                  <button className="flex items-center gap-1 text-xs text-red-500 px-2 py-1 rounded border border-red-200">
                    <Trash2 size={12} /> 删除
                  </button>
                  <button className="flex items-center gap-1 text-xs text-[#1A5C9A] px-2 py-1 rounded border border-blue-200 ml-auto">
                    <Upload size={12} /> 立即同步
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 同步历史 */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-800 mb-2">同步历史</h3>
          <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-50">
            {records.slice(0, 5).map(r => (
              <div key={r.id} className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {r.status === 'success' ? (
                    <CheckCircle size={16} className="text-green-500" />
                  ) : (
                    <XCircle size={16} className="text-red-500" />
                  )}
                  <div>
                    <p className="text-sm text-gray-800">{r.detail}</p>
                    <p className="text-xs text-gray-400">{r.syncTime} · {r.syncType === 'auto' ? '自动' : '手动'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
