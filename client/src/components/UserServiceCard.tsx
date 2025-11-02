import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RoleBadge } from '@/components/ui/role-badge';
import { MessageCircle, Star, MapPin, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { User } from '../../../shared/schema';
import type { RoleType } from '../../../shared/serviceCategories';

interface UserServiceCardProps {
  user: User;
  categoryId: string;
  onContact: (userId: string) => void;
}

export default function UserServiceCard({ user, categoryId, onContact }: UserServiceCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const categoryRoles = (user.categoryRoles as Record<string, RoleType[]>)[categoryId] || [];
  const initials = user.fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const getRatingDisplay = () => {
    if (user.mentorRating === 0) return 'New';
    return (user.mentorRating / 10).toFixed(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className={`p-4 transition-all duration-300 ${
        isHovered ? 'shadow-lg -translate-y-1' : 'shadow'
      }`}>
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14 ring-2 ring-gray-200">
            <AvatarImage src={user.profilePhotoUrl || undefined} alt={user.fullName} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                  {user.fullName}
                </h3>
                {user.company && (
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-0.5">
                    <Building2 className="h-3 w-3" />
                    {user.company}
                  </p>
                )}
              </div>
              {user.mentorRating !== undefined && (
                <div className="flex items-center gap-1 text-sm bg-amber-50 px-2 py-1 rounded-full">
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  <span className="font-medium text-amber-700">{getRatingDisplay()}</span>
                </div>
              )}
            </div>

            <RoleBadge roles={categoryRoles} className="mb-2" />

            <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
              {user.towerName && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {user.towerName}
                </span>
              )}
              {user.yearsOfExperience !== undefined && user.yearsOfExperience > 0 && (
                <span>{user.yearsOfExperience}+ years exp</span>
              )}
              {user.totalSessionsTaught > 0 && (
                <span>{user.totalSessionsTaught} sessions</span>
              )}
            </div>

            {user.bio && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {user.bio}
              </p>
            )}

            <Button
              size="sm"
              onClick={() => onContact(user.id)}
              className="w-full sm:w-auto gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Contact</span>
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
