import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, AlertTriangle, ChevronRight } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import { useDisasterStore } from '@/stores';

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

const statusMap: Record<string, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'bg-gray-100 text-gray-600' },
  pending: { label: '待审核', color: 'bg-yellow-100 text-yellow-700' },
  approved: { label: '已通过', color: 'bg-green-100 text-green-700' },
  rejected: { label: '已退回', color: 'bg-red-100 text-red-600' },
};

function getDeadlineInfo(deadline: string) {
  const now = new Date();
  const dl = new Date(deadline);
  const diffMs = dl.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { text: `已超期${Math.abs(diffDays)}天`, color: 'text-red-600', bg: 'bg-red-50', urgent: true };
  if (diffDays <= 1) return { text: `仅剩${diffDays}天`, color: 'text-red-600', bg: 'bg-red-50', urgent: true };
  if (diffDays <= 3) return { text: `仅剩${diffDays}天`, color: 'text-orange-600', bg: 'bg-orange-50', urgent: false };
  if (diffDays <= 7) return { text: `仅剩${diffDays}天`, color: 'text-yellow-600', bg: 'bg-yellow-50', urgent: false };
  return null;
}

export default function DisasterList() {
  const navigate = useNavigate();
  const { reports } = useDisasterStore();
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return reports;
    return reports.filter(r => r.status === filter);
  }, [reports, filter]);

  const filters: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待审核' },
    { key: 'approved', label: '已通过' },
    { key: 'rejected', label: '已退回' },
  ];

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <TopBar
        title="受灾申报"
        rightAction={
          <button
            onClick={() => navigate('/disaster/new')}
            className="flex items-center gap-1 text-sm font-medium bg-white/20 px-3 py-1 rounded-full"
          >
            <Plus size={16} /> 新增
          </button>
        }
      />
      <div className="pt-14 px-4 pb-4">
        {/* 筛选标签 */}
        <div className="flex gap-2 py-3 overflow-x-auto">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                filter === f.key ? 'bg-[#1A5C9A] text-white' : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* 列表 */}
        <div className="space-y-3">
          {filtered.map(item => {
            const deadlineInfo = getDeadlineInfo(item.deadline);
            const st = statusMap[item.status] || statusMap.draft;
            return (
              <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">{item.id}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base font-medium text-gray-900">{item.disasterType}</span>
                  {deadlineInfo && (
                    <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded ${deadlineInfo.bg} ${deadlineInfo.color}`}>
                      <AlertTriangle size={12} />
                      {deadlineInfo.text}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div><span className="text-gray-400">受灾面积：</span><span className="text-gray-700">{item.affectedArea}亩</span></div>
                  <div><span className="text-gray-400">预计可收储：</span><span className="text-gray-700">{item.estimatedYield}吨</span></div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => navigate(`/disaster/${item.id}`)}
                    className="flex items-center gap-1 text-sm text-[#1A5C9A] font-medium"
                  >
                    查看详情 <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center text-gray-400 py-10">暂无数据</div>
          )}
        </div>
      </div>
    </div>
  );
}
