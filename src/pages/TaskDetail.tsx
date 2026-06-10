import { useNavigate, useParams } from 'react-router-dom';
import { Pencil, Send, Trash2, FileText, MapPin } from 'lucide-react';
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

export default function TaskDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { plans, updatePlan, deletePlan } = usePlanStore();
  const plan = plans.find((p) => p.id === id);

  if (!plan) {
    return (
      <div className="pt-14 bg-[#F5F7FA] min-h-screen">
        <TopBar title="计划详情" showBack />
        <div className="text-center text-gray-400 py-20 text-sm">未找到该计划</div>
      </div>
    );
  }

  const handleSubmit = () => {
    updatePlan(plan.id, { status: 'pending', isOffline: false });
    navigate('/tasks');
  };

  const handleDelete = () => {
    if (window.confirm('确定删除该种植计划？')) {
      deletePlan(plan.id);
      navigate('/tasks');
    }
  };

  return (
    <div className="pt-14 bg-[#F5F7FA] min-h-screen pb-20">
      <TopBar title="计划详情" showBack />

      <div className="px-4 py-3 space-y-3">
        {/* 状态头部 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-base font-medium text-gray-900">{plan.id}</span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[plan.status]}`}>
              {statusLabels[plan.status]}
            </span>
          </div>
          {plan.isOffline && (
            <span className="text-xs text-[#F56C6C]">（离线数据）</span>
          )}
        </div>

        {/* 基本信息 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-sm font-medium text-gray-900 mb-3">基本信息</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">申报年度</span>
              <span className="text-gray-900">{plan.year}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">作物品种</span>
              <span className="text-gray-900">{plan.cropType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">种植类型</span>
              <span className="text-gray-900">{plan.plantType}</span>
            </div>
          </div>
        </div>

        {/* 面积信息 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-sm font-medium text-gray-900 mb-3">面积信息</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold text-[#1A5C9A]">{plan.area}</div>
              <div className="text-xs text-gray-500 mt-1">种植面积（亩）</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-[#2E7D32]">{plan.expectedYield}</div>
              <div className="text-xs text-gray-500 mt-1">预计产量（吨）</div>
            </div>
          </div>
        </div>

        {/* 地块列表 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-sm font-medium text-gray-900 mb-3">地块信息</div>
          {plan.plots.length === 0 ? (
            <div className="text-center text-gray-400 text-xs py-4">暂无地块</div>
          ) : (
            <div className="space-y-2">
              {plan.plots.map((plot) => (
                <div key={plot.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                  <MapPin size={16} className="text-[#1A5C9A] mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-900">{plot.plotCode}</div>
                    <div className="text-xs text-gray-500">{plot.area}亩 · {plot.landSource} · {plot.description}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 附件 */}
        {plan.attachments.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-sm font-medium text-gray-900 mb-3">附件</div>
            <div className="space-y-2">
              {plan.attachments.map((att) => (
                <div key={att.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <FileText size={16} className="text-[#1A5C9A]" />
                  <span className="text-sm text-gray-700 flex-1">{att.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 备注 */}
        {plan.remark && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-sm font-medium text-gray-900 mb-2">备注</div>
            <div className="text-sm text-gray-600">{plan.remark}</div>
          </div>
        )}

        {/* 时间信息 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="space-y-2 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>创建时间</span>
              <span>{plan.createdAt}</span>
            </div>
            <div className="flex justify-between">
              <span>更新时间</span>
              <span>{plan.updatedAt}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 底部操作按钮 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-3 z-50">
        {(plan.status === 'draft' || plan.status === 'rejected') && (
          <>
            <button
              onClick={() => navigate(`/tasks/${plan.id}/edit`)}
              className="flex-1 flex items-center justify-center gap-1 py-2.5 border border-[#1A5C9A] text-[#1A5C9A] text-sm rounded-lg font-medium"
            >
              <Pencil size={16} />
              编辑
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-[#1A5C9A] text-white text-sm rounded-lg font-medium"
            >
              <Send size={16} />
              提交审核
            </button>
          </>
        )}
        {plan.status === 'draft' && (
          <button
            onClick={handleDelete}
            className="py-2.5 px-4 border border-[#F56C6C] text-[#F56C6C] text-sm rounded-lg font-medium"
          >
            <Trash2 size={16} />
          </button>
        )}
        {plan.status === 'pending' && (
          <div className="flex-1 text-center text-sm text-gray-400 py-2.5">
            已提交审核，请等待审核结果
          </div>
        )}
        {plan.status === 'approved' && (
          <div className="flex-1 text-center text-sm text-[#67C23A] font-medium py-2.5">
            审核已通过
          </div>
        )}
      </div>
    </div>
  );
}
