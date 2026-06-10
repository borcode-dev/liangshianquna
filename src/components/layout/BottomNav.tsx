import { NavLink, useLocation } from 'react-router-dom';
import { Home, ClipboardList, Map, BarChart3, User } from 'lucide-react';

const tabs = [
  { path: '/', label: '首页', icon: Home },
  { path: '/tasks', label: '任务', icon: ClipboardList },
  { path: '/map', label: '一张图', icon: Map },
  { path: '/statistics', label: '统计', icon: BarChart3 },
  { path: '/profile', label: '我的', icon: User },
];

export default function BottomNav() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = tab.path === '/'
            ? currentPath === '/'
            : currentPath.startsWith(tab.path);
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className="flex flex-col items-center justify-center w-16 h-full"
            >
              <Icon
                size={22}
                className={isActive ? 'text-[#1A5C9A]' : 'text-gray-400'}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              <span
                className={`text-[10px] mt-0.5 ${
                  isActive ? 'text-[#1A5C9A] font-medium' : 'text-gray-400'
                }`}
              >
                {tab.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
