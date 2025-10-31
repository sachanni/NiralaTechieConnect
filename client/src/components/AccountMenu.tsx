import { useState } from "react";
import { useLocation } from "wouter";
import { User, Settings, HelpCircle, Info, LogOut, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface AccountMenuProps {
  user: {
    fullName: string;
    profilePhotoUrl?: string;
  };
  onLogout: () => void;
}

export default function AccountMenu({ user, onLogout }: AccountMenuProps) {
  const [, setLocation] = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const { toast } = useToast();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleMenuAction = (action: string) => {
    setSheetOpen(false);
    
    switch (action) {
      case 'profile':
        setLocation('/profile');
        break;
      case 'settings':
        setLocation('/settings');
        break;
      case 'help':
        toast({
          title: "Help & Support",
          description: "Contact: admin@niralat echie.com",
        });
        break;
      case 'about':
        toast({
          title: "About Nirala Techie",
          description: "Community platform for IT professionals • Version 1.0",
        });
        break;
      case 'logout':
        setLogoutDialogOpen(true);
        break;
    }
  };

  const handleLogout = () => {
    setLogoutDialogOpen(false);
    onLogout();
  };

  const menuItems = [
    { icon: User, label: "View Profile", action: "profile" },
    { icon: Settings, label: "Settings", action: "settings" },
    { icon: HelpCircle, label: "Help & Support", action: "help" },
    { icon: Info, label: "About", action: "about" },
  ];

  // Mobile view - Sheet (bottom sheet)
  const MobileMenu = (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <button className="md:hidden">
          <Avatar className="w-12 h-12 border-2 border-background cursor-pointer hover:ring-2 hover:ring-primary transition-all">
            <AvatarImage src={user.profilePhotoUrl} />
            <AvatarFallback className="text-sm bg-primary/10 text-primary">
              {getInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-auto max-h-[80vh]">
        <SheetHeader>
          <SheetTitle className="text-left">Account</SheetTitle>
        </SheetHeader>
        <div className="py-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.action}
              onClick={() => handleMenuAction(item.action)}
              className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">{item.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
          
          <div className="pt-2 border-t">
            <button
              onClick={() => handleMenuAction('logout')}
              className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-destructive/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-destructive" />
                <span className="font-medium text-destructive">Logout</span>
              </div>
              <ChevronRight className="w-5 h-5 text-destructive" />
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  // Desktop view - Dropdown Menu
  const DesktopMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="hidden md:block">
          <Avatar className="w-14 h-14 border-2 border-background cursor-pointer hover:ring-2 hover:ring-primary transition-all">
            <AvatarImage src={user.profilePhotoUrl} />
            <AvatarFallback className="text-base bg-primary/10 text-primary">
              {getInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.fullName}</p>
            <p className="text-xs leading-none text-muted-foreground">Account Settings</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {menuItems.map((item) => (
          <DropdownMenuItem key={item.action} onClick={() => handleMenuAction(item.action)}>
            <item.icon className="w-4 h-4 mr-2" />
            {item.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleMenuAction('logout')} className="text-destructive focus:text-destructive">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      {MobileMenu}
      {DesktopMenu}
      
      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You'll need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-destructive hover:bg-destructive/90">
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
