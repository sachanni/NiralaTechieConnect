import { useState } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface NotificationPermissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAllow: () => void;
}

export function NotificationPermissionDialog({
  isOpen,
  onClose,
  onAllow,
}: NotificationPermissionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Bell className="w-6 h-6 text-primary" />
              </div>
              <DialogTitle className="text-xl">Enable Notifications</DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-left pt-4 space-y-3">
            <p className="text-base">
              Stay connected with your community! Enable notifications to:
            </p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Receive instant message alerts even when browsing other tabs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Never miss important updates from your teammates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Get notified about skill swap sessions and events</span>
              </li>
            </ul>
            <p className="text-sm text-muted-foreground pt-2">
              You can change this anytime in your browser settings.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Not Now
          </Button>
          <Button
            onClick={onAllow}
            className="w-full sm:w-auto"
          >
            Enable Notifications
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
