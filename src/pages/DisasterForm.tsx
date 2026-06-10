import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ImagePlus, Trash2 } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import { useDisasterStore, usePlotStore } from '@/stores';
import { dictOptions } from '@/lib/mock-data';

export default function DisasterForm() {
  const navigate = useNavigate();
  const { addReport } = useDisasterStore();
  const { plots } = usePlotStore();

  const [disasterType, setDisasterType] = useState('');
  const [disasterDate, setDisasterDate] = useState('');
  const [selectedPlots, setSelectedPlots] = useState<string[]>([]);
  const [affectedArea, setAffectedArea] = useState('');
  const [totalLossArea, setTotalLossArea] = useState('');
  const [estimatedYield, setEstimatedYield] = useState('0');
  const [photos, setPhotos] = useState<string[]>([]);
  const [storageEntity, setStorageEntity] = useState('');
  const [storageWeight, setStorageWeight] = useState('');
  const [expectedPrice, setExpectedPrice] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');

  // 自动计算预计可收储量 = 绝收面积 × 2.0
  useEffect(() => {
    const loss = parseFloat(totalLossArea) || 0;
    setEstimatedYield((loss * 2.0).toFixed(1));
  }, [totalLossArea]);

  const togglePlot = (id: string) => {
    setSelectedPlots(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const addPhoto = () => {
    setPhotos(prev => [...prev, `photo_${Date.now()}.jpg`]);
  };

  const removePhoto = (idx: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (status: 'draft' | 'pending') => {
    const id = `BC-${Date.now().toString().slice(-6)}`;
    addReport({
      id,
      disasterType: disasterType || '其他',
      disasterDate,
      affectedArea: parseFloat(affectedArea) || 0,
      totalLossArea: parseFloat(totalLossArea) || 0,
      estimatedYield: parseFloat(estimatedYield) || 0,
      storageEntity,
      storageWeight: parseFloat(storageWeight) || 0,
      expectedPrice: parseFloat(expectedPrice) || 0,
      deadline,
      status,
      isOffline: true,
      plotIds: selectedPlots,
      photos,
      description,
      createdAt: new Date().toLocaleDateString('zh-CN'),
    });
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <TopBar title="受灾申报填报" showBack />
      <div className="pt-14 pb-20">
        {/* 灾害信息 */}
        <div className="bg-white mx-4 mt-3 rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-800 mb-3">灾害信息</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">灾害类型 *</label>
              <select value={disasterType} onChange={e => setDisasterType(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="">请选择</option>
                {dictOptions.disasterType.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">灾害发生时间 *</label>
              <input type="date" value={disasterDate} onChange={e => setDisasterDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">受灾地块（复选）</label>
              <div className="grid grid-cols-2 gap-2">
                {plots.map(p => (
                  <label key={p.id} className={`flex items-center gap-2 p-2 rounded-lg border text-sm cursor-pointer ${
                    selectedPlots.includes(p.id) ? 'border-[#1A5C9A] bg-blue-50' : 'border-gray-200'
                  }`}>
                    <input type="checkbox" checked={selectedPlots.includes(p.id)} onChange={() => togglePlot(p.id)}
                      className="accent-[#1A5C9A]" />
                    <span className="truncate">{p.plotCode}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">受灾面积（亩）*</label>
                <input type="number" value={affectedArea} onChange={e => setAffectedArea(e.target.value)}
                  placeholder="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">预计绝收面积（亩）*</label>
                <input type="number" value={totalLossArea} onChange={e => setTotalLossArea(e.target.value)}
                  placeholder="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">预计可收储量（吨）</label>
              <input type="text" value={estimatedYield} readOnly
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500" />
            </div>
          </div>
        </div>

        {/* 现场照片 */}
        <div className="bg-white mx-4 mt-3 rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-800 mb-1">现场照片 *</h3>
          <p className="text-xs text-gray-400 mb-3">至少上传1张现场照片</p>
          <div className="flex flex-wrap gap-2">
            {photos.map((p, i) => (
              <div key={i} className="relative w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                <ImagePlus size={20} className="text-gray-400" />
                <button onClick={() => removePhoto(i)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            <button onClick={addPhoto}
              className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400">
              <Camera size={20} />
              <span className="text-xs mt-1">拍照</span>
            </button>
            <button onClick={addPhoto}
              className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400">
              <ImagePlus size={20} />
              <span className="text-xs mt-1">相册</span>
            </button>
          </div>
        </div>

        {/* 收储信息 */}
        <div className="bg-white mx-4 mt-3 rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-800 mb-3">收储信息</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">申请收储主体</label>
              <select value={storageEntity} onChange={e => setStorageEntity(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="">请选择</option>
                {dictOptions.storageEntity.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">拟收储重量（吨）</label>
                <input type="number" value={storageWeight} onChange={e => setStorageWeight(e.target.value)}
                  placeholder="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">期望单价（元/吨）</label>
                <input type="number" value={expectedPrice} onChange={e => setExpectedPrice(e.target.value)}
                  placeholder="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">收储时限要求</label>
              <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
        </div>

        {/* 申请说明 */}
        <div className="bg-white mx-4 mt-3 rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-800 mb-3">申请说明</h3>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            rows={3} placeholder="请输入申请说明..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" />
        </div>
      </div>

      {/* 底部操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 flex gap-3 z-50">
        <button onClick={() => handleSubmit('draft')}
          className="flex-1 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-600">
          保存草稿
        </button>
        <button onClick={() => handleSubmit('pending')}
          className="flex-1 py-2.5 rounded-lg bg-[#1A5C9A] text-white text-sm font-medium">
          提交审核
        </button>
      </div>
    </div>
  );
}
