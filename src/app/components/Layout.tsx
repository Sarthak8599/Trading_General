import { Outlet, Link, useLocation, Navigate, useNavigate } from 'react-router';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Target,
  Shield,
  TrendingUp,
  AlertTriangle,
  History,
  Settings,
  User,
  Calculator
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/trade-journal', label: 'Trade Journal', icon: BookOpen },
  { path: '/best-trading-days', label: 'Best Trading Days', icon: Calendar },
  { path: '/strategy-analysis', label: 'Strategy Analysis', icon: Target },
  { path: '/capital-risk', label: 'Capital & Risk', icon: Shield },
  { path: '/equity-drawdown', label: 'Equity & Drawdown', icon: TrendingUp },
  { path: '/mistake-tracker', label: 'Mistake Tracker', icon: AlertTriangle },
  { path: '/trade-history', label: 'Trade History', icon: History },
  { path: '/currency-converter', label: 'Currency Calculator', icon: Calculator }
];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1220]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-screen bg-[#0D1117] text-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#161B22] border-r border-[#30363D] flex flex-col">
        <div className="p-6 border-b border-[#30363D]">
          <h1 className="text-xl font-bold text-white">Trading Journal</h1>
          <p className="text-xs text-gray-400 mt-1">Professional Edition</p>
        </div>
        
        <nav className="flex-1 p-4 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-[#238636] text-white font-medium'
                    : 'text-gray-400 hover:bg-[#21262D] hover:text-gray-200'
                }`}
              >
                <Icon size={20} />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#30363D]">
          <Link
            to="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-[#21262D] hover:text-gray-200 transition-all"
          >
            <Settings size={20} />
            <span className="text-sm">Settings</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-[#161B22] border-b border-[#30363D] flex items-center justify-between px-8">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Professional Options Trading Journal — NIFTY & BANKNIFTY
            </h2>
          </div>
          
          <div className="flex items-center gap-6">
            <span className="text-sm text-gray-400">{currentDate}</span>
            <div className="flex items-center gap-2 px-4 py-2 bg-[#21262D] rounded-lg">
              <User size={18} className="text-gray-400" />
              <span className="text-sm text-gray-300">{user?.email || 'Trader'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-[#8B0000] hover:bg-[#a41010] text-white rounded-md text-xs"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#0D1117]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
