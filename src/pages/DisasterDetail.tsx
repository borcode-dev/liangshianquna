import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertTriangle, ImagePlus } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import { useDisasterStore } from '@/stores';

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
  if (diffDays < 0) return { text: `已超期${Math.abs(diffDays)}天`, color: 'text-red-600', bg: 'bg-red-50' };
  if (diffDays <= 1) return { text: `仅剩${diffDays}天`, color: 'text-red-600', bg: 'bg-red-50' };
  if (diffDays <= 3) return { text: `仅剩${diffDays}天`, color: 'text-orange-600', bg: 'bg-orange-50' };
  if (diffDays <= 7) return { text: `仅剩${diffDays}天`, color: 'text-yellow-600', bg: 'bg-yellow-50' };
  return null;
}

export default function DisasterDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { reports } = useDisasterStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  const report = reports.find(r => r.id === id);
  if (!report) {
    return (
      <div className="min-h-screen bg-[#F5F7FA]">
        <TopBar title="申报详情" showBack />
        <div className="pt-14 flex items-center justify-center h-64 text-gray-400">未找到该申报记录</div>
      </div>
    );
  }

  const st = statusMap[report.status] || statusMap.draft;
  const deadlineInfo = getDeadlineInfo(report.deadline);

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <TopBar title="申报详情" showBack />
      <div className="pt-14 px-4 pb-4">
        {/* 头部状态 */}
        <div className="bg-white rounded-xl p-4 mt-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">{report.id}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium text-gray-900">{report.disasterType}</span>
            {deadlineInfo && (
              <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded ${deadlineInfo.bg} ${deadlineInfo.color}`}>
                <AlertTriangle size={12} /> {deadlineInfo.text}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">申报时间：{report.createdAt}</p>
        </div>

        {/* 灾害信息 */}
        <div className="bg-white rounded-xl p-4 mt-3 shadow-sm">
          <h3 className="text-sm font-medium text-gray-800 mb-3">灾害信息</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">灾害类型</span>
              <span className="text-gray-700">{report.disasterType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">灾害发生时间</span>
              <span className="text-gray-700">{report.disasterDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">受灾面积</span>
              <span className="text-gray-700">{report.affectedArea}亩</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">预计绝收面积</span>
              <span className="text-gray-700">{report.totalLossArea}亩</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">预计可收储量</span>
              <span className="text-gray-700">{report.estimatedYield}吨</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">受灾地块</span>
              <span className="text-gray-700">{report.plotIds.join('、')}</span>
            </div>
          </div>
        </div>

        {/* 收储信息 */}
        <div className="bg-white rounded-xl p-4 mt-3 shadow-sm">
          <h3 className="text-sm font-medium text-gray-800 mb-3">收储信息</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">申请收储主体</span>
              <span className="text-gray-700">{report.storageEntity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">拟收储重量</span>
              <span className="text-gray-700">{report.storageWeight}吨</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">期望单价</span>
              <span className="text-gray-700">{report.expectedPrice}元/吨</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">收储时限</span>
              <span className="text-gray-700">{report.deadline}</span>
            </div>
          </div>
        </div>

        {/* 申请说明 */}
        <div className="bg-white rounded-xl p-4 mt-3 shadow-sm">
          <h3 className="text-sm font-medium text-gray-800 mb-2">申请说明</h3>
          <p className="text-sm text-gray-600">{report.description || '无'}</p>
        </div>

        {/* 现场照片 */}
        <div className="bg-white rounded-xl p-4 mt-3 shadow-sm">
          <h3 className="text-sm font-medium text-gray-800 mb-3">现场照片</h3>
          {report.photos.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {report.photos.map((p, i) => (
                <div key={i} className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                  <ImagePlus size={20} className="text-gray-400" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">暂无照片</p>
          )}
        </div>
      </div>
    </div>
  );
}
