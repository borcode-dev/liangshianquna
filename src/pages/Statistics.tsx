import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Sprout, Wheat, Scissors, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import TopBar from '@/components/layout/TopBar';
import { mockStatistics } from '@/lib/mock-data';

export default function Statistics() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  const stats = mockStatistics;

  const personalCards = [
    { label: '种植面积', value: stats.personalArea, unit: '亩', icon: Sprout, color: 'text-[#1A5C9A]', bg: 'bg-blue-50' },
    { label: '预计产量', value: stats.personalYield, unit: '吨', icon: Wheat, color: 'text-[#2E7D32]', bg: 'bg-green-50' },
    { label: '已播种', value: stats.personalSown, unit: '亩', icon: TrendingUp, color: 'text-[#E6A23C]', bg: 'bg-yellow-50' },
    { label: '已收获', value: stats.personalHarvested, unit: '亩', icon: Scissors, color: 'text-[#67C23A]', bg: 'bg-emerald-50' },
  ];

  const regionItems = [
    { label: '种植主体', value: stats.regionEntities, unit: '户' },
    { label: '种植面积', value: stats.regionArea, unit: '万亩' },
    { label: '产量', value: stats.regionYield, unit: '万吨' },
    { label: '收储主体', value: stats.regionStorageEntities, unit: '家' },
    { label: '收储', value: stats.regionStorageWeight, unit: '万吨' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <TopBar title="统计分析" />
      <div className="pt-14 px-4 pb-4">
        {/* 我的种植概况 */}
        <div className="mt-3">
          <h3 className="text-sm font-medium text-gray-800 mb-2">我的种植概况</h3>
          <div className="grid grid-cols-2 gap-2">
            {personalCards.map(card => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="bg-white rounded-xl p-3 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                      <Icon size={16} className={card.color} />
                    </div>
                    <span className="text-xs text-gray-500">{card.label}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-gray-900">{card.value}</span>
                    <span className="text-xs text-gray-400">{card.unit}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 地区统计摘要 */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-800 mb-2">地区统计摘要</h3>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-400 mb-3">蚌埠市怀远县</p>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {regionItems.map(item => (
                <div key={item.label} className="flex items-baseline gap-1">
                  <span className="text-xs text-gray-500">{item.label}</span>
                  <span className="text-base font-bold text-gray-900">{item.value}</span>
                  <span className="text-xs text-gray-400">{item.unit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 趋势图 */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-800 mb-2">近5年种植面积趋势</h3>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="year" tick={{ fontSize: 12 }} stroke="#999" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#999" unit="万亩" />
                  <Tooltip
                    formatter={(value: number) => [`${value}万亩`, '种植面积']}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="area"
                    stroke="#1A5C9A"
                    strokeWidth={2}
                    dot={{ fill: '#1A5C9A', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 查看详细统计 */}
        <button
          onClick={() => navigate('/statistics/detail')}
          className="w-full mt-4 bg-white rounded-xl p-3 shadow-sm flex items-center justify-between"
        >
          <span className="text-sm text-[#1A5C9A] font-medium">查看详细统计</span>
          <ChevronRight size={18} className="text-gray-400" />
        </button>
      </div>
    </div>
  );
}
