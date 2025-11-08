import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "../components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Users, Lightbulb, Briefcase, GraduationCap, TrendingUp, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const { user, idToken } = useAuth();
  const [, setLocation] = useLocation();

  const { data: isAdminData } = useQuery({
    queryKey: ['/api/admin/check'],
    queryFn: async () => {
      if (!idToken) return { isAdmin: false };
      const res = await fetch('/api/admin/check', {
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      if (!res.ok) return { isAdmin: false };
      return res.json();
    },
    enabled: !!idToken,
    retry: false,
    meta: {
      errorHandler: 'none', // Silent check - no error toasts
    },
  });

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['/api/admin/analytics'],
    queryFn: async () => {
      if (!idToken) throw new Error('Not authenticated');
      const res = await fetch('/api/admin/analytics', {
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      if (!res.ok) {
        if (res.status === 403) throw new Error('Unauthorized');
        throw new Error('Failed to fetch analytics');
      }
      return res.json();
    },
    enabled: !!idToken && isAdminData?.isAdmin,
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (isAdminData && !isAdminData.isAdmin) {
      setLocation('/dashboard');
    }
  }, [isAdminData, setLocation]);

  if (!user || !isAdminData?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">
            You need admin privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: analytics?.totalUsers || 0,
      icon: Users,
      gradient: "from-blue-500 to-cyan-500",
      description: "Registered members"
    },
    {
      title: "Total Ideas",
      value: analytics?.totalIdeas || 0,
      icon: Lightbulb,
      gradient: "from-purple-500 to-pink-500",
      description: `${analytics?.pendingIdeas || 0} pending approval`
    },
    {
      title: "Job Postings",
      value: analytics?.totalJobs || 0,
      icon: Briefcase,
      gradient: "from-green-500 to-emerald-500",
      description: "Active opportunities"
    },
    {
      title: "Skill Sessions",
      value: analytics?.totalSessions || 0,
      icon: GraduationCap,
      gradient: "from-orange-500 to-red-500",
      description: "Learning exchanges"
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {user.fullName}. Here's what's happening in your community.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-16 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-32"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.title} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <Icon size={16} className="opacity-60" />
                        {stat.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-1`}>
                        {stat.value.toLocaleString()}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {stat.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp size={20} className="text-purple-600" />
                    Idea Wall Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <span className="text-sm font-medium">Pending Approval</span>
                    <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {analytics?.pendingIdeas || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <span className="text-sm font-medium">Approved</span>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {analytics?.approvedIdeas || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                    <span className="text-sm font-medium">Rejected</span>
                    <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {analytics?.rejectedIdeas || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock size={20} className="text-blue-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <a
                    href="/admin/approvals"
                    className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border border-purple-200 dark:border-purple-800 hover:shadow-md transition-all"
                  >
                    <span className="font-medium">Review Pending Ideas</span>
                    <span className="text-sm bg-purple-600 text-white px-3 py-1 rounded-full">
                      {analytics?.pendingIdeas || 0}
                    </span>
                  </a>
                  <a
                    href="/admin/broadcasts"
                    className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 hover:shadow-md transition-all"
                  >
                    <span className="font-medium">Send Broadcast</span>
                    <span className="text-sm text-green-600 dark:text-green-400">→</span>
                  </a>
                  <a
                    href="/admin/exports"
                    className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border border-orange-200 dark:border-orange-800 hover:shadow-md transition-all"
                  >
                    <span className="font-medium">Export Data</span>
                    <span className="text-sm text-orange-600 dark:text-orange-400">→</span>
                  </a>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
