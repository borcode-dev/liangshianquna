import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ImagePlus, X } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import { useProgressStore, usePlotStore } from '@/stores';
import { dictOptions } from '@/lib/mock-data';

export default function ProgressForm() {
  const navigate = useNavigate();
  const { addRecord } = useProgressStore();
  const { plots } = usePlotStore();

  const [recordDate, setRecordDate] = useState('');
  const [selectedPlotIds, setSelectedPlotIds] = useState<string[]>([]);
  const [growthStage, setGrowthStage] = useState('');
  const [avgHeight, setAvgHeight] = useState('');
  const [leafCount, setLeafCount] = useState('');
  const [growthEval, setGrowthEval] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [remark, setRemark] = useState('');

  const togglePlot = (id: string) => {
    setSelectedPlotIds(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const addPhoto = () => {
    setPhotos(prev => [...prev, `photo_${Date.now()}.jpg`]);
  };

  const removePhoto = (idx: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (isDraft: boolean) => {
    const record = {
      id: `PR-${Date.now()}`,
      planId: plots.find(p => selectedPlotIds.includes(p.id))?.planId || '',
      recordDate,
      growthStage,
      avgHeight: Number(avgHeight) || 0,
      leafCount: Number(leafCount) || 0,
      growthEval,
      remark,
      isOffline: isDraft,
      photos,
      plotIds: selectedPlotIds,
      verified: false,
      createdAt: new Date().toLocaleString('zh-CN'),
    };
    addRecord(record);
    navigate('/progress');
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <TopBar
        title="进度填报"
        rightAction={
          <button onClick={() => handleSubmit(false)} className="text-sm font-medium">保存</button>
        }
        showBack
      />

      <div className="pt-14 pb-24 px-4">
        {/* 记录日期 */}
        <div className="mt-3 bg-white rounded-xl p-4 shadow-sm">
          <label className="text-sm text-gray-500 mb-2 block">记录日期</label>
          <input
            type="date"
            value={recordDate}
            onChange={e => setRecordDate(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1A5C9A]"
          />
        </div>

        {/* 关联地块 */}
        <div className="mt-3 bg-white rounded-xl p-4 shadow-sm">
          <label className="text-sm text-gray-500 mb-2 block">关联地块</label>
          <div className="space-y-2 max-h-40 overflow-auto">
            {plots.map(plot => (
              <label key={plot.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedPlotIds.includes(plot.id)}
                  onChange={() => togglePlot(plot.id)}
                  className="w-4 h-4 accent-[#1A5C9A]"
                />
                <span>{plot.plotCode}</span>
                <span className="text-gray-400 text-xs">{plot.description} ({plot.area}亩)</span>
              </label>
            ))}
          </div>
        </div>

        {/* 生长信息 */}
        <div className="mt-3 bg-white rounded-xl p-4 shadow-sm">
          <label className="text-sm text-gray-500 mb-2 block">生长信息</label>
          <div className="space-y-3">
            <div>
              <span className="text-xs text-gray-400">生长阶段</span>
              <select
                value={growthStage}
                onChange={e => setGrowthStage(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:border-[#1A5C9A]"
              >
                <option value="">请选择</option>
                {dictOptions.growthStage.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-gray-400">平均株高(cm)</span>
                <input
                  type="number"
                  value={avgHeight}
                  onChange={e => setAvgHeight(e.target.value)}
                  placeholder="0"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:border-[#1A5C9A]"
                />
              </div>
              <div>
                <span className="text-xs text-gray-400">叶片数(片)</span>
                <input
                  type="number"
                  value={leafCount}
                  onChange={e => setLeafCount(e.target.value)}
                  placeholder="0"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:border-[#1A5C9A]"
                />
              </div>
            </div>
            <div>
              <span className="text-xs text-gray-400">长势评价</span>
              <select
                value={growthEval}
                onChange={e => setGrowthEval(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:border-[#1A5C9A]"
              >
                <option value="">请选择</option>
                {dictOptions.growthEval.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 现场照片 */}
        <div className="mt-3 bg-white rounded-xl p-4 shadow-sm">
          <label className="text-sm text-gray-500 mb-2 block">现场照片</label>
          <div className="flex gap-2 mb-3">
            <button
              onClick={addPhoto}
              className="flex items-center gap-1 px-3 py-2 bg-[#1A5C9A] text-white rounded-lg text-xs"
            >
              <Camera size={14} /> 拍照
            </button>
            <button
              onClick={addPhoto}
              className="flex items-center gap-1 px-3 py-2 border border-[#1A5C9A] text-[#1A5C9A] rounded-lg text-xs"
            >
              <ImagePlus size={14} /> 相册
            </button>
          </div>
          {photos.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {photos.map((photo, idx) => (
                <div key={idx} className="relative w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Camera size={20} className="text-gray-300" />
                  <button
                    onClick={() => removePhoto(idx)}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-[#F56C6C] text-white rounded-full flex items-center justify-center"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 备注 */}
        <div className="mt-3 bg-white rounded-xl p-4 shadow-sm">
          <label className="text-sm text-gray-500 mb-2 block">备注</label>
          <textarea
            value={remark}
            onChange={e => setRemark(e.target.value)}
            rows={3}
            placeholder="请输入备注信息"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1A5C9A] resize-none"
          />
        </div>
      </div>

      {/* 底部固定操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 flex gap-3 z-40">
        <button
          onClick={() => handleSubmit(true)}
          className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600"
        >
          保存为草稿
        </button>
        <button
          onClick={() => handleSubmit(false)}
          className="flex-1 py-2.5 bg-[#1A5C9A] text-white rounded-lg text-sm"
        >
          提交审核
        </button>
      </div>
    </div>
  );
}
