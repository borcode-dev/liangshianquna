import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Pencil, Trash2, Camera, CloudOff, CheckCircle } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import { useProgressStore } from '@/stores';

export default function ProgressList() {
  const navigate = useNavigate();
  const { records, deleteRecord } = useProgressStore();

  const sorted = [...records].sort((a, b) => b.recordDate.localeCompare(a.recordDate));

  const evalColor = (v: string) => {
    if (v === '良好') return 'text-[#67C23A]';
    if (v === '正常') return 'text-[#1A5C9A]';
    if (v === '偏差') return 'text-[#E6A23C]';
    return 'text-[#F56C6C]';
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <TopBar
        title="进度跟踪"
        rightAction={
          <button
            onClick={() => navigate('/progress/new')}
            className="flex items-center gap-1 bg-white/20 rounded-lg px-2.5 py-1 text-sm"
          >
            <Plus size={16} /> 填报
          </button>
        }
      />

      <div className="pt-14 pb-4">
        {/* 整体进度 */}
        <div className="mx-4 mt-3 bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">整体进度</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">播种进度</span>
                <span className="font-medium text-[#1A5C9A]">80%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#1A5C9A] rounded-full" style={{ width: '80%' }} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">生长阶段</span>
              <span className="text-xs font-medium px-2 py-0.5 bg-green-50 text-[#2E7D32] rounded">生长期</span>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">收获进度</span>
                <span className="font-medium text-gray-400">0%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gray-200 rounded-full" style={{ width: '0%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* 进度记录列表 */}
        <div className="mx-4 mt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">进度记录</h3>
          <div className="space-y-3">
            {sorted.map(record => (
              <div key={record.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{record.recordDate}</span>
                      {record.isOffline && (
                        <span className="flex items-center gap-0.5 text-[10px] text-[#E6A23C] bg-orange-50 px-1.5 py-0.5 rounded">
                          <CloudOff size={10} /> 离线
                        </span>
                      )}
                      {record.verified && (
                        <span className="flex items-center gap-0.5 text-[10px] text-[#67C23A] bg-green-50 px-1.5 py-0.5 rounded">
                          <CheckCircle size={10} /> 已核实
                        </span>
                      )}
                      {record.isOffline && !record.verified && (
                        <span className="text-[10px] text-[#E6A23C] bg-orange-50 px-1.5 py-0.5 rounded">待同步</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{record.createdAt}</p>
                  </div>
                  <span className={`text-xs font-medium ${evalColor(record.growthEval)}`}>{record.growthEval}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 text-xs text-gray-600">
                  <div>
                    <span className="text-gray-400">阶段：</span>{record.growthStage}
                  </div>
                  <div>
                    <span className="text-gray-400">株高：</span>{record.avgHeight}cm
                  </div>
                  <div>
                    <span className="text-gray-400">叶片：</span>{record.leafCount}片
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Camera size={12} />
                    <span>{record.photos.length}张照片</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/progress/${record.id}`)}
                      className="p-1.5 text-[#1A5C9A] hover:bg-blue-50 rounded"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => navigate(`/progress/${record.id}/edit`)}
                      className="p-1.5 text-gray-400 hover:bg-gray-50 rounded"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => deleteRecord(record.id)}
                      className="p-1.5 text-[#F56C6C] hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
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
