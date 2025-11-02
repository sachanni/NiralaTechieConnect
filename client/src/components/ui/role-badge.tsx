import { RoleType } from '../../../../shared/serviceCategories';

interface RoleBadgeProps {
  roles: RoleType[];
  className?: string;
}

export function RoleBadge({ roles, className = '' }: RoleBadgeProps) {
  const hasProvider = roles.includes('provider');
  const hasSeeker = roles.includes('seeker');
  const isBoth = hasProvider && hasSeeker;

  if (isBoth) {
    return (
      <div className={`flex gap-1.5 ${className}`}>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          OFFERING
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          SEEKING
        </span>
      </div>
    );
  }

  if (hasProvider) {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 ${className}`}>
        <span className="w-2 h-2 rounded-full bg-green-500"></span>
        OFFERING
      </span>
    );
  }

  if (hasSeeker) {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 ${className}`}>
        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
        SEEKING
      </span>
    );
  }

  return null;
}
