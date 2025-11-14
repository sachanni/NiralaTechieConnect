import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Lock, CheckCircle, AlertCircle } from "lucide-react";
import PasswordInputWithValidation from "./PasswordInputWithValidation";
import { evaluatePassword } from "@/lib/passwordValidation";

interface PasswordResetFormProps {
  phoneNumber: string;
  onPasswordReset: (password: string) => Promise<void>;
  onCancel: () => void;
}

export default function PasswordResetForm({ 
  phoneNumber, 
  onPasswordReset,
  onCancel 
}: PasswordResetFormProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Missing Fields",
        description: "Please enter and confirm your new password",
        variant: "destructive",
      });
      return;
    }

    const passwordValidation = evaluatePassword(newPassword);
    if (!passwordValidation.isValid) {
      toast({
        title: "Weak Password",
        description: "Please ensure your password meets all security requirements",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure both passwords are identical",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await onPasswordReset(newPassword);
      
      toast({
        title: "Password Updated!",
        description: "Your password has been successfully reset. You can now use email/password login.",
        duration: 5000,
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      let errorMessage = "Failed to update password. Please try again.";
      if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak. Please use a stronger password.";
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = "Session expired. Please verify your phone number again.";
      }
      
      toast({
        title: "Password Reset Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
            <CheckCircle className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Set New Password</CardTitle>
          <CardDescription>
            Phone verified: {phoneNumber}
            <br />
            Create a new password to secure your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <PasswordInputWithValidation
                value={newPassword}
                onChange={setNewPassword}
                id="new-password"
                placeholder="Create a secure password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className="h-12 pl-10"
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <p className="text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Passwords do not match
              </p>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
              <p className="flex items-center gap-2">
                <span>💡</span>
                <span>After setting your password, use email/password login for quick and easy access</span>
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              disabled={loading || !evaluatePassword(newPassword).isValid || newPassword !== confirmPassword}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Updating Password...
                </>
              ) : (
                'Set New Password'
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="w-full"
              disabled={loading}
            >
              Cancel
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
