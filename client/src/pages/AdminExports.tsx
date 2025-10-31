import { AdminLayout } from "../components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Download, Users, Lightbulb, Briefcase } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

export default function AdminExports() {
  const { idToken } = useAuth();
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleExport = async (type: 'users' | 'ideas' | 'jobs', format: 'csv' | 'json') => {
    if (!idToken) return;
    setDownloading(`${type}-${format}`);

    try {
      const url = `/api/admin/export/${type}?format=${format}`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${idToken}` }
      });

      if (!res.ok) throw new Error('Export failed');

      if (format === 'json') {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${type}-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(downloadUrl);
      } else {
        const blob = await res.blob();
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${type}-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(downloadUrl);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const exportCards = [
    {
      title: "Export Users",
      description: "Download all registered user data including profiles, tech stack, and engagement metrics.",
      icon: Users,
      type: 'users' as const,
      gradient: "from-blue-500 to-cyan-500",
      fields: "Name, Email, Phone, Company, Tech Stack, Experience, Points, Level, Created Date"
    },
    {
      title: "Export Ideas",
      description: "Download idea wall data including founders, roles, engagement, and approval status.",
      icon: Lightbulb,
      type: 'ideas' as const,
      gradient: "from-purple-500 to-pink-500",
      fields: "Title, Founder, Status, Roles, Pay Structure, Upvotes, Comments, Interests, Created Date"
    },
    {
      title: "Export Jobs",
      description: "Download all job postings with company details, requirements, and applicant counts.",
      icon: Briefcase,
      type: 'jobs' as const,
      gradient: "from-green-500 to-emerald-500",
      fields: "Title, Company, Posted By, Tech Stack, Experience, Salary, Work Mode, Type, Status, Created Date"
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Data Export</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Export community data for reporting, sponsor presentations, or analytics.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {exportCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.type} className="relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-5`}></div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`} />
                    {card.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {card.description}
                  </p>

                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-500 mb-1">
                      Included Fields:
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {card.fields}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleExport(card.type, 'csv')}
                      disabled={downloading !== null}
                      className={`flex-1 bg-gradient-to-r ${card.gradient}`}
                      size="sm"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {downloading === `${card.type}-csv` ? 'Exporting...' : 'CSV'}
                    </Button>
                    <Button
                      onClick={() => handleExport(card.type, 'json')}
                      disabled={downloading !== null}
                      variant="outline"
                      className="flex-1"
                      size="sm"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {downloading === `${card.type}-json` ? 'Exporting...' : 'JSON'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-600" />
              Export Guidelines
            </h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span><strong>CSV Format:</strong> Best for Excel, Google Sheets, or data analysis tools. Opens directly in spreadsheet applications.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span><strong>JSON Format:</strong> Best for technical use, API integration, or custom data processing scripts.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span><strong>Data Privacy:</strong> All exports are logged in the Activity Log for audit purposes. Handle exported data responsibly.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span><strong>Refresh:</strong> Exports reflect real-time data. Re-export to get the latest information.</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
