import { LucideIcon } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface HeaderNavItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  badge?: number;
  onClick?: () => void;
  isActive?: boolean;
}

export default function HeaderNavItem({ icon: Icon, label, href, badge, onClick, isActive: isActiveProp }: HeaderNavItemProps) {
  const [location] = useLocation();
  const isActive = isActiveProp !== undefined ? isActiveProp : location === href || location.startsWith(href + '/');

  if (onClick) {
    return (
      <button
        onClick={onClick}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "flex flex-col items-center justify-center px-3 py-2 gap-1 relative",
          "hover:bg-gray-100 rounded transition-colors min-w-[80px]",
          isActive && "text-primary"
        )}
      >
        <div className="relative">
          <Icon className={cn("w-6 h-6", isActive ? "text-primary" : "text-gray-600")} />
          {badge !== undefined && badge > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center p-0 px-1 text-xs bg-red-500 text-white border-2 border-white"
            >
              {badge > 99 ? '99+' : badge}
            </Badge>
          )}
        </div>
        <span className={cn(
          "text-xs font-medium",
          isActive ? "text-primary" : "text-gray-600"
        )}>
          {label}
        </span>
        {isActive && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
        )}
      </button>
    );
  }

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex flex-col items-center justify-center px-3 py-2 gap-1 relative",
        "hover:bg-gray-100 rounded transition-colors min-w-[80px] no-underline",
        isActive && "text-primary"
      )}
    >
      <div className="relative">
        <Icon className={cn("w-6 h-6", isActive ? "text-primary" : "text-gray-600")} />
        {badge !== undefined && badge > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center p-0 px-1 text-xs bg-red-500 text-white border-2 border-white"
          >
            {badge > 99 ? '99+' : badge}
          </Badge>
        )}
      </div>
      <span className={cn(
        "text-xs font-medium",
        isActive ? "text-primary" : "text-gray-600"
      )}>
        {label}
      </span>
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
      )}
    </Link>
  );
}
