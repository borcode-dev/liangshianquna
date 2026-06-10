import { useState, useCallback } from 'react';
import { Search, Settings, X, ChevronRight, Phone, MapPin } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import { useMapStore } from '@/stores';
import { mockMapEntities, mockMapPlots } from '@/lib/mock-data';
import type { MapEntity, MapPlot } from '@/types';

// 经纬度转SVG坐标
const LNG_MIN = 117.095;
const LNG_MAX = 117.155;
const LAT_MIN = 33.430;
const LAT_MAX = 33.485;
const SVG_W = 400;
const SVG_H = 400;

function toSvg(lng: number, lat: number): [number, number] {
  const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * SVG_W;
  const y = SVG_H - ((lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * SVG_H;
  return [x, y];
}

export default function MapView() {
  const { layers, toggleLayer, setLayerSubOption } = useMapStore();
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<MapEntity | null>(null);
  const [selectedPlot, setSelectedPlot] = useState<MapPlot | null>(null);

  const isLayerVisible = useCallback((id: string) => layers.find(l => l.id === id)?.visible ?? false, [layers]);

  // 收储站点（模拟）
  const storageSites = [
    { id: 's1', name: '安徽青贮公司', lng: 117.130, lat: 33.465 },
    { id: 's2', name: '蚌埠收储中心', lng: 117.140, lat: 33.455 },
  ];

  const totalArea = mockMapEntities.reduce((s, e) => s + e.area, 0);
  const totalPlots = mockMapEntities.reduce((s, e) => s + e.plotCount, 0);

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <TopBar
        title="一张图"
        rightAction={
          <div className="flex items-center gap-2">
            <button className="p-1"><Search size={20} /></button>
            <button className="p-1" onClick={() => setShowLayerPanel(true)}><Settings size={20} /></button>
          </div>
        }
      />

      <div className="pt-14 relative" style={{ height: 'calc(100vh - 48px)' }}>
        {/* 地图SVG */}
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-full bg-gradient-to-b from-green-50 to-green-100">
          {/* 底图 - 水系 */}
          {isLayerVisible('road') && (
            <g>
              <line x1="0" y1="200" x2="400" y2="180" stroke="#C0C4CC" strokeWidth="3" />
              <line x1="150" y1="0" x2="170" y2="400" stroke="#C0C4CC" strokeWidth="2" />
              <line x1="280" y1="0" x2="300" y2="400" stroke="#C0C4CC" strokeWidth="2" />
              <path d="M0,300 Q100,280 200,310 T400,290" fill="none" stroke="#93C5FD" strokeWidth="4" opacity="0.5" />
            </g>
          )}

          {/* 行政区划边界 */}
          {isLayerVisible('boundary') && (
            <g>
              <rect x="30" y="30" width="340" height="340" fill="none" stroke="#909399" strokeWidth="1.5" strokeDasharray="8,4" />
              <line x1="200" y1="30" x2="200" y2="370" stroke="#909399" strokeWidth="1" strokeDasharray="6,4" />
              <line x1="30" y1="200" x2="370" y2="200" stroke="#909399" strokeWidth="1" strokeDasharray="6,4" />
            </g>
          )}

          {/* 地块多边形 */}
          {isLayerVisible('plot') && mockMapPlots.map(plot => {
            const points = plot.polygon.map(([lng, lat]) => {
              const [x, y] = toSvg(lng, lat);
              return `${x},${y}`;
            }).join(' ');
            const color = plot.cropType === '青贮高粱' ? '#8B5CF6' : '#2E7D32';
            return (
              <g key={plot.id} onClick={() => setSelectedPlot(plot)} className="cursor-pointer">
                <polygon points={points} fill={color} fillOpacity="0.25" stroke={color} strokeWidth="1.5" />
              </g>
            );
          })}

          {/* 收储站点 */}
          {isLayerVisible('storage') && storageSites.map(site => {
            const [x, y] = toSvg(site.lng, site.lat);
            return (
              <g key={site.id} className="cursor-pointer">
                <polygon points={`${x},${y - 8} ${x - 7},${y + 5} ${x + 7},${y + 5}`} fill="#E6A23C" stroke="#fff" strokeWidth="1" />
                <text x={x} y={y + 16} textAnchor="middle" fontSize="7" fill="#E6A23C" fontWeight="500">{site.name}</text>
              </g>
            );
          })}

          {/* 种植主体标记 */}
          {isLayerVisible('entity') && mockMapEntities.map(entity => {
            const [x, y] = toSvg(entity.longitude, entity.latitude);
            return (
              <g key={entity.id} onClick={() => setSelectedEntity(entity)} className="cursor-pointer">
                <circle cx={x} cy={y} r="6" fill="#1A5C9A" stroke="#fff" strokeWidth="1.5" />
                <circle cx={x} cy={y} r="3" fill="#fff" />
                <text x={x} y={y - 10} textAnchor="middle" fontSize="8" fill="#1A5C9A" fontWeight="600">{entity.name}</text>
              </g>
            );
          })}
        </svg>

        {/* 图层控制按钮 */}
        <button
          onClick={() => setShowLayerPanel(true)}
          className="absolute right-4 bottom-20 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center"
        >
          <Settings size={20} className="text-[#1A5C9A]" />
        </button>

        {/* 主体信息卡片 */}
        {selectedEntity && (
          <div className="absolute top-4 left-4 right-4 bg-white rounded-xl shadow-lg p-4 z-10">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-[#1A5C9A]">{selectedEntity.name}</h3>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><MapPin size={12} />{selectedEntity.region}</p>
              </div>
              <button onClick={() => setSelectedEntity(null)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
              <div><span className="text-gray-500">联系人：</span>{selectedEntity.name.slice(0, 2)}</div>
              <div className="flex items-center gap-1"><span className="text-gray-500">电话：</span><Phone size={12} className="text-[#1A5C9A]" />{selectedEntity.phone}</div>
              <div><span className="text-gray-500">面积：</span>{selectedEntity.area}亩</div>
              <div><span className="text-gray-500">品种：</span>{selectedEntity.cropType}</div>
              <div><span className="text-gray-500">产量：</span>{selectedEntity.expectedYield}吨</div>
              <div><span className="text-gray-500">地块：</span>{selectedEntity.plotCount}块</div>
            </div>
          </div>
        )}

        {/* 地块信息卡片 */}
        {selectedPlot && (
          <div className="absolute top-4 left-4 right-4 bg-white rounded-xl shadow-lg p-4 z-10">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-[#2E7D32]">{selectedPlot.plotCode}</h3>
              <button onClick={() => setSelectedPlot(null)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
              <div><span className="text-gray-500">位置：</span>{selectedPlot.region}</div>
              <div><span className="text-gray-500">面积：</span>{selectedPlot.area}亩</div>
              <div><span className="text-gray-500">品种：</span>{selectedPlot.cropType}</div>
              <div><span className="text-gray-500">播种：</span>{selectedPlot.sowDate}</div>
              <div><span className="text-gray-500">预计收获：</span>{selectedPlot.harvestDate}</div>
              {selectedPlot.latestRecord && (
                <div><span className="text-gray-500">长势：</span><span className="text-[#67C23A]">{selectedPlot.latestRecord.growthEval}</span></div>
              )}
            </div>
          </div>
        )}

        {/* 底部统计条 */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur px-4 py-3 flex justify-around text-center shadow-[0_-2px_8px_rgba(0,0,0,0.08)]">
          <div><div className="text-lg font-bold text-[#1A5C9A]">{mockMapEntities.length}</div><div className="text-xs text-gray-500">种植主体</div></div>
          <div><div className="text-lg font-bold text-[#2E7D32]">{totalArea}</div><div className="text-xs text-gray-500">面积(亩)</div></div>
          <div><div className="text-lg font-bold text-[#E6A23C]">{totalPlots}</div><div className="text-xs text-gray-500">地块数</div></div>
        </div>
      </div>

      {/* 图层控制面板 */}
      {showLayerPanel && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowLayerPanel(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[70vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-base">图层控制</h3>
              <button onClick={() => setShowLayerPanel(false)}><X size={20} /></button>
            </div>
            <div className="p-4 space-y-4">
              {layers.map(layer => (
                <div key={layer.id}>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={layer.visible}
                      onChange={() => toggleLayer(layer.id)}
                      className="w-4 h-4 accent-[#1A5C9A]"
                    />
                    <span className="flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: layer.color }} />
                      {layer.name}
                    </span>
                  </label>
                  {layer.subOptions && layer.visible && (
                    <div className="ml-7 mt-2 space-y-1">
                      {layer.subOptions.map(opt => (
                        <label key={opt.value} className="flex items-center gap-2 text-xs text-gray-600">
                          <input
                            type="radio"
                            name={`sub-${layer.id}`}
                            checked={opt.selected}
                            onChange={() => setLayerSubOption(layer.id, opt.value)}
                            className="accent-[#1A5C9A]"
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-3 p-4 border-t">
              <button
                onClick={() => layers.forEach(l => l.visible && toggleLayer(l.id))}
                className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600"
              >
                重置
              </button>
              <button
                onClick={() => setShowLayerPanel(false)}
                className="flex-1 py-2.5 bg-[#1A5C9A] text-white rounded-lg text-sm"
              >
                应用
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
