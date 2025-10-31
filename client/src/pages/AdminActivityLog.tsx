import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "../components/AdminLayout";
import { Card, CardContent } from "../components/ui/card";
import { FileText, User, Calendar, Tag } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

export default function AdminActivityLog() {
  const { idToken } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['/api/admin/activity-log'],
    queryFn: async () => {
      if (!idToken) throw new Error('Not authenticated');
      const res = await fetch('/api/admin/activity-log', {
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      if (!res.ok) throw new Error('Failed to fetch activity log');
      return res.json();
    },
    enabled: !!idToken,
  });

  const getActionColor = (actionType: string) => {
    if (actionType.includes('approve')) return 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300';
    if (actionType.includes('reject')) return 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-300';
    if (actionType.includes('broadcast')) return 'bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300';
    if (actionType.includes('export')) return 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300';
    return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
  };

  const formatActionType = (actionType: string) => {
    return actionType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Activity Log</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Complete audit trail of all administrative actions.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : data?.actions?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No admin actions recorded yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {data?.actions?.map((action: any) => (
              <Card key={action.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActionColor(action.actionType)}`}>
                          {formatActionType(action.actionType)}
                        </span>
                        <span className="text-sm text-gray-500">•</span>
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <User className="h-3 w-3" />
                          <span>{action.admin.fullName}</span>
                        </div>
                        <span className="text-sm text-gray-500">•</span>
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="h-3 w-3" />
                          <span>{format(new Date(action.createdAt), 'MMM d, yyyy h:mm a')}</span>
                        </div>
                      </div>

                      {action.details && (
                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                          {action.details}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                        <Tag className="h-3 w-3" />
                        <span>Target: {action.targetType}</span>
                        <span>•</span>
                        <span>ID: {action.targetId.substring(0, 8)}...</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
