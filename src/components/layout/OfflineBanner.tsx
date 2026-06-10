import { Wifi, WifiOff, CheckCircle, RefreshCw } from 'lucide-react';
import { useAppStore } from '@/stores';

export default function OfflineBanner() {
  const { isOnline, syncStatus, offlineCount } = useAppStore();

  if (isOnline && syncStatus === 'idle') return null;

  if (!isOnline) {
    return (
      <div className="fixed top-14 left-0 right-0 z-40 bg-red-500 text-white text-xs py-1.5 px-4 text-center flex items-center justify-center gap-1.5">
        <WifiOff size={14} />
        <span>离线模式 - 数据将保存在本地</span>
      </div>
    );
  }

  if (syncStatus === 'syncing') {
    return (
      <div className="fixed top-14 left-0 right-0 z-40 bg-green-500 text-white text-xs py-1.5 px-4 text-center flex items-center justify-center gap-1.5">
        <RefreshCw size={14} className="animate-spin" />
        <span>正在同步数据...</span>
      </div>
    );
  }

  if (syncStatus === 'success') {
    return (
      <div className="fixed top-14 left-0 right-0 z-40 bg-green-500 text-white text-xs py-1.5 px-4 text-center flex items-center justify-center gap-1.5">
        <CheckCircle size={14} />
        <span>同步完成 - 已上传 {offlineCount} 条数据</span>
      </div>
    );
  }

  return null;
}

export function NetworkToggle() {
  const { isOnline, toggleOnline } = useAppStore();
  return (
    <button
      onClick={toggleOnline}
      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
        isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}
    >
      {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
      {isOnline ? '在线' : '离线'}
    </button>
  );
}
