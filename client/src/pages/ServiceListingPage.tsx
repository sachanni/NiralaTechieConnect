import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RoleToggle, type RoleFilter } from '@/components/ui/role-toggle';
import UserServiceCard from '@/components/UserServiceCard';
import { Search, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { SERVICE_CATEGORIES, TOWER_OPTIONS } from '../../../shared/serviceCategories';
import type { User } from '../../../shared/schema';
import { Button } from '@/components/ui/button';

export default function ServiceListingPage() {
  const params = useParams<{ categoryId: string }>();
  const [, setLocation] = useLocation();
  const categoryId = params.categoryId || '';
  
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [towerFilter, setTowerFilter] = useState<string>('all');
  
  const category = SERVICE_CATEGORIES.find(c => c.id === categoryId);

  const { data, isLoading, error } = useQuery({
    queryKey: ['service-users', categoryId, roleFilter],
    queryFn: async () => {
      const roleParam = roleFilter === 'all' ? '' : roleFilter === 'providers' ? 'provider' : 'seeker';
      const url = `/api/services/${categoryId}/users${roleParam ? `?role=${roleParam}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      return data.users as User[];
    },
    enabled: !!categoryId,
  });

  const filteredUsers = data?.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (user.company && user.company.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTower = towerFilter === 'all' || user.towerName === towerFilter;
    return matchesSearch && matchesTower;
  }) || [];

  const handleContact = async (userId: string) => {
    try {
      const idToken = localStorage.getItem('idToken');
      const response = await fetch('/api/conversations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ otherUserId: userId }),
      });

      if (!response.ok) throw new Error('Failed to create conversation');
      
      const { conversation } = await response.json();
      setLocation(`/chat?conversation=${conversation.id}`);
    } catch (error) {
      console.error('Contact error:', error);
    }
  };

  if (!category) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Category Not Found</h2>
          <p className="text-gray-600 mb-4">The requested service category does not exist.</p>
          <Button onClick={() => setLocation('/services')}>
            Back to Services
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/services')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{category.icon}</span>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
                <p className="text-sm text-gray-600">{category.description}</p>
              </div>
            </div>
          </div>

          {/* Role Toggle */}
          <div className="mb-4">
            <RoleToggle activeFilter={roleFilter} onChange={setRoleFilter} />
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={towerFilter} onValueChange={setTowerFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Towers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Towers</SelectItem>
                {TOWER_OPTIONS.map(tower => (
                  <SelectItem key={tower} value={tower}>{tower}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading members...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-600">Failed to load members. Please try again.</p>
          </div>
        )}

        {!isLoading && !error && filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Members Found</h3>
            <p className="text-gray-600">
              {searchQuery || towerFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Be the first to offer or seek services in this category!'}
            </p>
          </div>
        )}

        {!isLoading && !error && filteredUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <p className="text-sm text-gray-600 mb-4">
              {filteredUsers.length} {filteredUsers.length === 1 ? 'member' : 'members'} found
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <UserServiceCard
                    user={user}
                    categoryId={categoryId}
                    onContact={handleContact}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
