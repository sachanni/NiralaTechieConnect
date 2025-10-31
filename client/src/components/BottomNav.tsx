import { useLocation, Link } from "wouter";
import { Home, Users, MessageSquare, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

export default function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    {
      icon: Home,
      label: "Home",
      path: "/dashboard",
      active: location === "/" || location === "/dashboard",
    },
    {
      icon: Users,
      label: "Find",
      path: "/find-teammates",
      active: location === "/find-teammates",
    },
    {
      icon: MessageCircle,
      label: "Chat",
      path: "/chat",
      active: location === "/chat",
    },
    {
      icon: MessageSquare,
      label: "Forum",
      path: "/forum",
      active: location.startsWith("/forum"),
    },
    {
      icon: User,
      label: "Profile",
      path: "/profile",
      active: location === "/profile",
    },
  ];

  const navContent = (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.path} href={item.path}>
              <a
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[64px]",
                  item.active
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <Icon className={cn("w-5 h-5", item.active && "stroke-[2.5]")} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </a>
            </Link>
          );
        })}
      </div>
    </nav>
  );

  // Render directly into document.body using a portal to avoid any parent transforms
  return createPortal(navContent, document.body);
}
