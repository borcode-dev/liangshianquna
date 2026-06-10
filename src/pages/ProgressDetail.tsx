import { useParams, useNavigate } from 'react-router-dom';
import { Camera, CheckCircle, CloudOff, MapPin } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import { useProgressStore, usePlotStore } from '@/stores';

export default function ProgressDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { records } = useProgressStore();
  const { plots } = usePlotStore();

  const record = records.find(r => r.id === id);

  if (!record) {
    return (
      <div className="min-h-screen bg-[#F5F7FA]">
        <TopBar title="进度详情" showBack />
        <div className="pt-14 flex items-center justify-center h-[60vh] text-gray-400 text-sm">
          记录不存在
        </div>
      </div>
    );
  }

  const relatedPlots = plots.filter(p => record.plotIds.includes(p.id));

  const evalColor = (v: string) => {
    if (v === '良好') return 'text-[#67C23A]';
    if (v === '正常') return 'text-[#1A5C9A]';
    if (v === '偏差') return 'text-[#E6A23C]';
    return 'text-[#F56C6C]';
  };

  const evalBg = (v: string) => {
    if (v === '良好') return 'bg-green-50';
    if (v === '正常') return 'bg-blue-50';
    if (v === '偏差') return 'bg-orange-50';
    return 'bg-red-50';
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <TopBar title="进度详情" showBack />

      <div className="pt-14 pb-6 px-4">
        {/* 基本信息 */}
        <div className="mt-3 bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">{record.recordDate}</h3>
            <div className="flex items-center gap-2">
              {record.isOffline && (
                <span className="flex items-center gap-0.5 text-[10px] text-[#E6A23C] bg-orange-50 px-1.5 py-0.5 rounded">
                  <CloudOff size={10} /> 离线
                </span>
              )}
              {record.verified ? (
                <span className="flex items-center gap-0.5 text-[10px] text-[#67C23A] bg-green-50 px-1.5 py-0.5 rounded">
                  <CheckCircle size={10} /> 已核实
                </span>
              ) : (
                <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">待核实</span>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1">记录时间：{record.createdAt}</p>
        </div>

        {/* 生长信息 */}
        <div className="mt-3 bg-white rounded-xl p-4 shadow-sm">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">生长信息</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-400">生长阶段</div>
              <div className="text-sm font-medium mt-1">{record.growthStage}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-400">长势评价</div>
              <div className={`text-sm font-medium mt-1 ${evalColor(record.growthEval)}`}>
                {record.growthEval}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-400">平均株高</div>
              <div className="text-sm font-medium mt-1">{record.avgHeight}<span className="text-xs text-gray-400 ml-0.5">cm</span></div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-400">叶片数</div>
              <div className="text-sm font-medium mt-1">{record.leafCount}<span className="text-xs text-gray-400 ml-0.5">片</span></div>
            </div>
          </div>
        </div>

        {/* 关联地块 */}
        <div className="mt-3 bg-white rounded-xl p-4 shadow-sm">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">关联地块</h4>
          {relatedPlots.length > 0 ? (
            <div className="space-y-2">
              {relatedPlots.map(plot => (
                <div key={plot.id} className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg p-3">
                  <MapPin size={14} className="text-[#2E7D32] flex-shrink-0" />
                  <span className="font-medium">{plot.plotCode}</span>
                  <span className="text-gray-400 text-xs">{plot.description}</span>
                  <span className="text-gray-400 text-xs ml-auto">{plot.area}亩</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">暂无关联地块</p>
          )}
        </div>

        {/* 现场照片 */}
        <div className="mt-3 bg-white rounded-xl p-4 shadow-sm">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            现场照片
            <span className="text-xs text-gray-400 font-normal ml-1">({record.photos.length}张)</span>
          </h4>
          {record.photos.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {record.photos.map((photo, idx) => (
                <div key={idx} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Camera size={24} className="text-gray-300 mx-auto" />
                    <span className="text-[10px] text-gray-300 mt-1 block">{photo}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">暂无照片</p>
          )}
        </div>

        {/* 备注 */}
        {record.remark && (
          <div className="mt-3 bg-white rounded-xl p-4 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">备注</h4>
            <p className="text-sm text-gray-600">{record.remark}</p>
          </div>
        )}

        {/* 核实状态 */}
        <div className="mt-3 bg-white rounded-xl p-4 shadow-sm">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">核实状态</h4>
          <div className={`flex items-center gap-2 text-sm p-3 rounded-lg ${evalBg(record.verified ? '良好' : '偏差')}`}>
            {record.verified ? (
              <>
                <CheckCircle size={16} className="text-[#67C23A]" />
                <span className="text-[#67C23A]">该记录已通过核实</span>
              </>
            ) : (
              <>
                <CloudOff size={16} className="text-[#E6A23C]" />
                <span className="text-[#E6A23C]">该记录待核实</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
