import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Menu } from 'lucide-react';

interface TopBarProps {
  title: string;
  showBack?: boolean;
  showMenu?: boolean;
  showBell?: boolean;
  rightAction?: React.ReactNode;
  onBack?: () => void;
}

export default function TopBar({ title, showBack, showMenu, showBell, rightAction, onBack }: TopBarProps) {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-[#1A5C9A] text-white z-50 safe-area-top">
      <div className="flex items-center justify-between h-full px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          {showBack && (
            <button onClick={onBack || (() => navigate(-1))} className="p-1 -ml-1">
              <ArrowLeft size={22} />
            </button>
          )}
          {showMenu && (
            <button className="p-1 -ml-1">
              <Menu size={22} />
            </button>
          )}
          <h1 className="text-base font-medium">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {showBell && (
            <button className="p-1 relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          )}
          {rightAction}
        </div>
      </div>
    </header>
  );
}
