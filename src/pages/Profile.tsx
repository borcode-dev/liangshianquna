import { useState, useEffect } from 'react';
import { User, Phone, Building2, MapPin, Edit3, ChevronRight, Download, Trash2, LogOut } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import { useAppStore } from '@/stores';

export default function Profile() {
  const { user } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [pushNotify, setPushNotify] = useState(true);
  const [imageQuality, setImageQuality] = useState<'high' | 'medium' | 'low'>('medium');

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  const operationLogs = [
    { time: '2026-06-11 08:30', action: '提交了受灾申报 BC-001' },
    { time: '2026-06-10 14:30', action: '保存了种植计划草稿 ZZ-002' },
    { time: '2026-06-10 09:30', action: '填报了进度记录 PR-008' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <TopBar title="个人中心" />
      <div className="pt-14 px-4 pb-6">
        {/* 个人信息卡片 */}
        <div className="bg-white rounded-xl p-4 mt-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#1A5C9A] flex items-center justify-center flex-shrink-0">
              <User size={28} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-medium text-gray-900">{user.name}</h2>
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                <Phone size={12} /> {user.phone}
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                <Building2 size={12} /> {user.entity}
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                <MapPin size={12} /> {user.region}
              </div>
            </div>
            <button className="flex items-center gap-1 text-sm text-[#1A5C9A] flex-shrink-0">
              <Edit3 size={14} /> 编辑
            </button>
          </div>
        </div>

        {/* 设置列表 */}
        <div className="bg-white rounded-xl mt-3 shadow-sm divide-y divide-gray-50">
          <div className="flex items-center justify-between p-4">
            <span className="text-sm text-gray-700">自动同步</span>
            <button
              onClick={() => setAutoSync(!autoSync)}
              className={`relative w-11 h-6 rounded-full transition-colors ${autoSync ? 'bg-[#1A5C9A]' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${autoSync ? 'translate-x-5' : ''}`} />
            </button>
          </div>
          <div className="flex items-center justify-between p-4">
            <span className="text-sm text-gray-700">消息推送通知</span>
            <button
              onClick={() => setPushNotify(!pushNotify)}
              className={`relative w-11 h-6 rounded-full transition-colors ${pushNotify ? 'bg-[#1A5C9A]' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${pushNotify ? 'translate-x-5' : ''}`} />
            </button>
          </div>
          <div className="flex items-center justify-between p-4">
            <span className="text-sm text-gray-700">离线地图包下载</span>
            <ChevronRight size={18} className="text-gray-400" />
          </div>
          <div className="p-4">
            <span className="text-sm text-gray-700 block mb-2">图片压缩质量</span>
            <div className="flex gap-2">
              {([
                { key: 'high' as const, label: '高质量' },
                { key: 'medium' as const, label: '中质量' },
                { key: 'low' as const, label: '低质量' },
              ]).map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setImageQuality(opt.key)}
                  className={`flex-1 py-1.5 rounded-lg text-sm border transition-colors ${
                    imageQuality === opt.key
                      ? 'border-[#1A5C9A] text-[#1A5C9A] bg-blue-50'
                      : 'border-gray-200 text-gray-500'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-700">存储空间管理</span>
              <span className="text-xs text-gray-400">125MB / 875MB</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#1A5C9A] rounded-full" style={{ width: '14.3%' }} />
            </div>
            <button className="flex items-center gap-1 text-xs text-red-500 mt-2">
              <Trash2 size={12} /> 清理缓存
            </button>
          </div>
        </div>

        {/* 操作日志 */}
        <div className="bg-white rounded-xl mt-3 shadow-sm">
          <div className="p-4 pb-2">
            <h3 className="text-sm font-medium text-gray-800">操作日志</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {operationLogs.map((log, i) => (
              <div key={i} className="px-4 py-2.5">
                <p className="text-sm text-gray-700">{log.action}</p>
                <p className="text-xs text-gray-400 mt-0.5">{log.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 关于 */}
        <div className="bg-white rounded-xl mt-3 shadow-sm divide-y divide-gray-50">
          <div className="flex items-center justify-between p-4">
            <span className="text-sm text-gray-700">版本号</span>
            <span className="text-sm text-gray-400">V1.0.0</span>
          </div>
          <div className="flex items-center justify-between p-4">
            <span className="text-sm text-gray-700">检查更新</span>
            <button className="flex items-center gap-1 text-sm text-[#1A5C9A]">
              <Download size={14} /> 检查
            </button>
          </div>
        </div>

        {/* 退出登录 */}
        <button className="w-full mt-4 bg-white rounded-xl p-3 shadow-sm text-center">
          <span className="text-sm text-red-500 font-medium">退出登录</span>
        </button>
      </div>
    </div>
  );
}
