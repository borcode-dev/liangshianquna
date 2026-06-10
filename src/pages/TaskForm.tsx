import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, Camera, FileUp, ChevronDown, X } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import { usePlanStore } from '@/stores';
import { dictOptions } from '@/lib/mock-data';
import type { PlotInfo } from '@/types';

export default function TaskForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { plans, addPlan, updatePlan } = usePlanStore();
  const isEdit = Boolean(id);
  const existing = id ? plans.find((p) => p.id === id) : null;

  const [year, setYear] = useState(existing?.year || '2026');
  const [cropType, setCropType] = useState(existing?.cropType || '');
  const [plantType, setPlantType] = useState(existing?.plantType || '');
  const [area, setArea] = useState(existing?.area || 0);
  const [expectedYield, setExpectedYield] = useState(existing?.expectedYield || 0);
  const [plots, setPlots] = useState<PlotInfo[]>(existing?.plots || []);
  const [remark, setRemark] = useState(existing?.remark || '');
  const [showPlotForm, setShowPlotForm] = useState(false);
  const [editPlotId, setEditPlotId] = useState<string | null>(null);

  // 新地块表单
  const [plotCode, setPlotCode] = useState('');
  const [plotArea, setPlotArea] = useState(0);
  const [plotSource, setPlotSource] = useState<'自有' | '流转'>('自有');
  const [plotDesc, setPlotDesc] = useState('');

  useEffect(() => {
    setExpectedYield(Math.round(area * 3.0));
  }, [area]);

  const resetPlotForm = () => {
    setPlotCode('');
    setPlotArea(0);
    setPlotSource('自有');
    setPlotDesc('');
    setEditPlotId(null);
    setShowPlotForm(false);
  };

  const handleAddPlot = () => {
    if (!plotCode || plotArea <= 0) return;
    const newPlot: PlotInfo = {
      id: editPlotId || `DK-${Date.now()}`,
      planId: id || '',
      plotCode,
      area: plotArea,
      landSource: plotSource,
      description: plotDesc,
      longitude: 117.1,
      latitude: 33.4,
    };
    if (editPlotId) {
      setPlots(plots.map((p) => (p.id === editPlotId ? newPlot : p)));
    } else {
      setPlots([...plots, newPlot]);
    }
    resetPlotForm();
  };

  const handleEditPlot = (plot: PlotInfo) => {
    setEditPlotId(plot.id);
    setPlotCode(plot.plotCode);
    setPlotArea(plot.area);
    setPlotSource(plot.landSource);
    setPlotDesc(plot.description);
    setShowPlotForm(true);
  };

  const handleRemovePlot = (plotId: string) => {
    setPlots(plots.filter((p) => p.id !== plotId));
  };

  const handleSubmit = (status: 'draft' | 'pending') => {
    const now = new Date().toLocaleString('zh-CN');
    const plan = {
      id: id || `ZZ-${Date.now()}`,
      year,
      cropType,
      plantType,
      area,
      expectedYield,
      status,
      remark,
      isOffline: status === 'draft',
      plots,
      attachments: existing?.attachments || [],
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };
    if (isEdit && id) {
      updatePlan(id, plan);
    } else {
      addPlan(plan);
    }
    navigate('/tasks');
  };

  return (
    <div className="pt-14 bg-[#F5F7FA] min-h-screen pb-20">
      <TopBar
        title={isEdit ? '编辑种植计划' : '新增种植计划'}
        showBack
        rightAction={
          <button
            onClick={() => handleSubmit('draft')}
            className="text-sm text-white bg-white/20 px-2.5 py-1 rounded-lg"
          >
            保存草稿
          </button>
        }
      />

      <div className="px-4 py-3 space-y-3">
        {/* 基本信息 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-sm font-medium text-gray-900 mb-3">基本信息</div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">申报年度</label>
              <select value={year} onChange={(e) => setYear(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                {dictOptions.year.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">作物品种</label>
              <select value={cropType} onChange={(e) => setCropType(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="">请选择</option>
                {dictOptions.cropType.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">种植类型</label>
              <select value={plantType} onChange={(e) => setPlantType(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="">请选择</option>
                {dictOptions.plantType.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* 面积信息 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-sm font-medium text-gray-900 mb-3">面积信息</div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">种植面积（亩）</label>
              <input type="number" value={area || ''} onChange={(e) => setArea(Number(e.target.value))} placeholder="请输入种植面积" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">预计产量（吨）</label>
              <input type="number" value={expectedYield || ''} readOnly className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50" />
              <div className="text-xs text-gray-400 mt-1">自动计算：面积 × 3.0</div>
            </div>
          </div>
        </div>

        {/* 地块信息 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-900">地块信息</span>
            <button
              onClick={() => { resetPlotForm(); setShowPlotForm(!showPlotForm); }}
              className="flex items-center gap-1 text-xs text-[#1A5C9A] font-medium"
            >
              <Plus size={14} />
              新增地块
            </button>
          </div>

          {/* 内联地块表单 */}
          {showPlotForm && (
            <div className="border border-blue-200 rounded-lg p-3 mb-3 bg-blue-50/50">
              <div className="space-y-2">
                <input value={plotCode} onChange={(e) => setPlotCode(e.target.value)} placeholder="地块编号" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" />
                <input type="number" value={plotArea || ''} onChange={(e) => setPlotArea(Number(e.target.value))} placeholder="面积（亩）" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" />
                <select value={plotSource} onChange={(e) => setPlotSource(e.target.value as '自有' | '流转')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                  {dictOptions.landSource.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <input value={plotDesc} onChange={(e) => setPlotDesc(e.target.value)} placeholder="地块描述" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" />
                <div className="flex gap-2">
                  <button onClick={handleAddPlot} className="flex-1 py-2 bg-[#1A5C9A] text-white text-sm rounded-lg">
                    {editPlotId ? '保存修改' : '添加'}
                  </button>
                  <button onClick={resetPlotForm} className="flex-1 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg">
                    取消
                  </button>
                </div>
              </div>
            </div>
          )}

          {plots.length === 0 && !showPlotForm && (
            <div className="text-center text-gray-400 text-xs py-4">暂无地块，请点击新增</div>
          )}
          {plots.map((plot) => (
            <div key={plot.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-b-0">
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-900">{plot.plotCode}</div>
                <div className="text-xs text-gray-500">{plot.area}亩 · {plot.landSource} · {plot.description}</div>
              </div>
              <div className="flex items-center gap-2 ml-2">
                <button onClick={() => handleEditPlot(plot)} className="text-xs text-[#1A5C9A]">编辑</button>
                <button onClick={() => handleRemovePlot(plot.id)} className="text-xs text-[#F56C6C]">删除</button>
              </div>
            </div>
          ))}
        </div>

        {/* 附件上传 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-sm font-medium text-gray-900 mb-3">附件上传</div>
          <div className="flex gap-3">
            <button className="flex flex-col items-center gap-1 w-20 h-20 border border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-[#1A5C9A] hover:text-[#1A5C9A]">
              <Camera size={20} />
              <span className="text-xs">拍照上传</span>
            </button>
            <button className="flex flex-col items-center gap-1 w-20 h-20 border border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-[#1A5C9A] hover:text-[#1A5C9A]">
              <FileUp size={20} />
              <span className="text-xs">文件上传</span>
            </button>
          </div>
        </div>

        {/* 备注 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-sm font-medium text-gray-900 mb-3">备注</div>
          <textarea value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="请输入备注信息" rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" />
        </div>
      </div>

      {/* 底部固定操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-3 z-50">
        <button
          onClick={() => handleSubmit('draft')}
          className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm rounded-lg font-medium"
        >
          暂存草稿
        </button>
        <button
          onClick={() => handleSubmit('pending')}
          className="flex-1 py-2.5 bg-[#1A5C9A] text-white text-sm rounded-lg font-medium"
        >
          提交审核
        </button>
      </div>
    </div>
  );
}
