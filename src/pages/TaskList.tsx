import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import { usePlanStore } from '@/stores';
import type { PlantPlan } from '@/types';

const statusLabels: Record<PlantPlan['status'], string> = {
  draft: '草稿',
  pending: '待审核',
  approved: '已通过',
  rejected: '已驳回',
};

const statusColors: Record<PlantPlan['status'], string> = {
  draft: 'bg-gray-100 text-gray-600',
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const filterTabs: { key: string; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'draft', label: '待提交' },
  { key: 'pending', label: '待审核' },
  { key: 'approved', label: '已通过' },
];

export default function TaskList() {
  const navigate = useNavigate();
  const { plans, deletePlan } = usePlanStore();
  const [activeTab, setActiveTab] = useState('all');

  const filtered = activeTab === 'all'
    ? plans
    : plans.filter((p) => p.status === activeTab);

  const handleDelete = (id: string) => {
    if (window.confirm('确定删除该种植计划？')) {
      deletePlan(id);
    }
  };

  return (
    <div className="pt-14 bg-[#F5F7FA] min-h-screen">
      <TopBar
        title="任务管理"
        rightAction={
          <button
            onClick={() => navigate('/tasks/new')}
            className="flex items-center gap-1 text-sm text-white bg-white/20 px-2.5 py-1 rounded-lg"
          >
            <Plus size={16} />
            新增
          </button>
        }
      />

      {/* 状态筛选标签 */}
      <div className="sticky top-14 z-30 bg-white border-b border-gray-100">
        <div className="flex overflow-x-auto px-4 gap-1 scrollbar-hide">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'text-[#1A5C9A] border-[#1A5C9A]'
                  : 'text-gray-500 border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 计划列表 */}
      <div className="px-4 py-3 space-y-3">
        {filtered.length === 0 && (
          <div className="text-center text-gray-400 py-10 text-sm">暂无数据</div>
        )}
        {filtered.map((plan) => (
          <div key={plan.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{plan.id}</span>
                  {plan.isOffline && (
                    <span className="text-xs text-[#F56C6C]">(离线)</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {plan.isOffline && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-600 font-medium">
                      草稿
                    </span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColors[plan.status]}`}>
                    {statusLabels[plan.status]}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                <div>品种：{plan.cropType}</div>
                <div>类型：{plan.plantType}</div>
                <div>面积：{plan.area} 亩</div>
                <div>产量：{plan.expectedYield} 吨</div>
              </div>

              <div className="text-xs text-gray-400">
                更新于 {plan.updatedAt}
              </div>
            </div>

            <div className="flex border-t border-gray-100 divide-x divide-gray-100">
              <button
                onClick={() => navigate(`/tasks/${plan.id}`)}
                className="flex-1 flex items-center justify-center gap-1 py-2.5 text-xs text-[#1A5C9A] font-medium"
              >
                <Eye size={14} />
                查看详情
              </button>
              {(plan.status === 'draft' || plan.status === 'rejected') && (
                <button
                  onClick={() => navigate(`/tasks/${plan.id}/edit`)}
                  className="flex-1 flex items-center justify-center gap-1 py-2.5 text-xs text-[#E6A23C] font-medium"
                >
                  <Pencil size={14} />
                  继续编辑
                </button>
              )}
              {(plan.status === 'draft') && (
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="flex-1 flex items-center justify-center gap-1 py-2.5 text-xs text-[#F56C6C] font-medium"
                >
                  <Trash2 size={14} />
                  删除
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
