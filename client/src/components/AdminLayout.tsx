import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  CheckSquare, 
  Radio, 
  Download, 
  FileText, 
  LogOut,
  Menu,
  X,
  AlertCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { idToken } = useAuth();

  const { data: adminCheck, isLoading, isError } = useQuery({
    queryKey: ['admin-check'],
    queryFn: async () => {
      const response = await fetch('/api/admin/check', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) {
        return { isAdmin: false };
      }
      return response.json();
    },
    enabled: !!idToken,
    retry: false,
    meta: {
      errorHandler: 'none', // Silent check - no error toasts for non-admin users
    },
  });

  useEffect(() => {
    if (!isLoading && (isError || !adminCheck?.isAdmin)) {
      navigate('/dashboard');
    }
  }, [isLoading, isError, adminCheck, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (isError || !adminCheck?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">You do not have admin access.</p>
          <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/approvals", icon: CheckSquare, label: "Approvals" },
    { path: "/admin/broadcasts", icon: Radio, label: "Broadcasts" },
    { path: "/admin/exports", icon: Download, label: "Data Export" },
    { path: "/admin/activity-log", icon: FileText, label: "Activity Log" },
  ];

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location === path;
    }
    return location.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-900 rounded-lg shadow-lg"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`
        fixed top-0 left-0 z-40 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Admin Panel
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Nirala Techie Management
            </p>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link key={item.path} href={item.path}>
                  <a 
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                      ${active
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                    `}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </a>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <Link href="/dashboard">
              <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <LogOut size={20} />
                <span className="font-medium">Exit Admin</span>
              </a>
            </Link>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="lg:ml-64 min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
