import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import OfflineBanner from './OfflineBanner';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <OfflineBanner />
      <main className="pb-14">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
