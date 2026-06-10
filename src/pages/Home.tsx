import { useNavigate } from 'react-router-dom';
import {
  Bell, Menu, User, Sprout, MapPin, Camera, Map,
  RefreshCw, ChevronRight, CloudOff,
} from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import { useAppStore } from '@/stores';
import { mockTodos } from '@/lib/mock-data';

const priorityColors: Record<string, string> = {
  high: '#F56C6C',
  medium: '#E6A23C',
  low: '#67C23A',
};

const quickActions = [
  { icon: Sprout, label: '种植计划', path: '/tasks', color: '#1A5C9A' },
  { icon: MapPin, label: '地块勾绘', path: '/map', color: '#2E7D32' },
  { icon: Camera, label: '随手拍照', path: '/progress/new', color: '#E6A23C' },
  { icon: Map, label: '查看地图', path: '/map', color: '#8B5CF6' },
];

export default function Home() {
  const navigate = useNavigate();
  const { user, offlineCount, lastSyncTime, syncStatus, triggerSync } = useAppStore();

  return (
    <div className="pt-14 bg-[#F5F7FA] min-h-screen">
      <TopBar
        title="青贮饲料管理"
        showMenu
        showBell
        rightAction={
          <button onClick={() => navigate('/profile')} className="ml-1">
            <User size={22} className="text-white" />
          </button>
        }
      />

      <div className="px-4 py-3 space-y-3">
        {/* 用户信息区 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#1A5C9A] flex items-center justify-center text-white text-lg font-medium">
              {user.name[0]}
            </div>
            <div className="flex-1">
              <div className="text-base font-medium text-gray-900">{user.name}</div>
              <div className="text-sm text-gray-500">{user.entity}</div>
              <div className="text-xs text-gray-400 mt-0.5">{user.region}</div>
            </div>
          </div>
        </div>

        {/* 我的种植概况 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-[#1A5C9A]">500</div>
            <div className="text-xs text-gray-500 mt-1">种植面积（亩）</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-[#2E7D32]">1500</div>
            <div className="text-xs text-gray-500 mt-1">预计产量（吨）</div>
          </div>
        </div>

        {/* 待办事项 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">待办事项</span>
            <span className="text-xs text-gray-400">{mockTodos.length}条待办</span>
          </div>
          {mockTodos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-start px-4 py-3 border-b border-gray-50 last:border-b-0"
            >
              <div
                className="w-1 h-10 rounded-full mr-3 flex-shrink-0 mt-0.5"
                style={{ backgroundColor: priorityColors[todo.priority] }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900">{todo.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{todo.description}</div>
              </div>
              <button
                onClick={() => navigate(todo.actionPath)}
                className="text-xs text-[#1A5C9A] font-medium flex-shrink-0 ml-2 px-2 py-1 bg-blue-50 rounded"
              >
                {todo.actionLabel}
              </button>
            </div>
          ))}
        </div>

        {/* 离线数据管理 */}
        {offlineCount > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <CloudOff size={18} className="text-[#E6A23C]" />
              <span className="text-sm font-medium text-gray-900">离线数据管理</span>
            </div>
            <div className="text-xs text-gray-500 mb-3">
              未同步数据 <span className="text-[#E6A23C] font-medium">{offlineCount}</span> 条，最后同步：{lastSyncTime}
            </div>
            <div className="flex gap-2">
              <button
                onClick={triggerSync}
                disabled={syncStatus === 'syncing'}
                className="flex-1 flex items-center justify-center gap-1 py-2 bg-[#1A5C9A] text-white text-sm rounded-lg disabled:opacity-50"
              >
                <RefreshCw size={14} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
                立即同步
              </button>
              <button
                onClick={() => navigate('/offline')}
                className="flex-1 flex items-center justify-center gap-1 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg"
              >
                查看详情
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* 快捷功能 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-sm font-medium text-gray-900 mb-3">快捷功能</div>
          <div className="grid grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center gap-1.5"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${action.color}15` }}
                >
                  <action.icon size={22} style={{ color: action.color }} />
                </div>
                <span className="text-xs text-gray-600">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
