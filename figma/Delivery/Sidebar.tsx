/* ====================================
   SIDEBAR COMPONENT
   ==================================== */

import { QuickActions } from './QuickActions';
import { StatsGrid } from './StatsGrid';
import { Stats } from './types';

interface SidebarProps {
  isAdmin: boolean;
  stats: Stats;
}

export function Sidebar({ isAdmin, stats }: SidebarProps) {
  return (
    <aside className="delivery-sidebar">
      <QuickActions isAdmin={isAdmin} />
      <StatsGrid stats={stats} />
    </aside>
  );
}
