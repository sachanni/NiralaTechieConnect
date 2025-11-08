import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { EmailPasswordAuthService } from "@/lib/firebase";
import { Lock, CheckCircle, AlertCircle, Home, LogIn } from "lucide-react";
import { useLocation } from "wouter";

export default function PasswordResetAction() {
  const [, setLocation] = useLocation();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [isValidCode, setIsValidCode] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [email, setEmail] = useState("");
  const [oobCode, setOobCode] = useState("");
  const { toast } = useToast();
  const [emailPasswordService] = useState(() => new EmailPasswordAuthService());

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const code = urlParams.get('oobCode');

    if (mode !== 'resetPassword' || !code) {
      toast({
        title: "Invalid Link",
        description: "This password reset link is invalid or has expired.",
        variant: "destructive",
      });
      setVerifying(false);
      return;
    }

    setOobCode(code);
    verifyResetCode(code);
  }, []);

  useEffect(() => {
    if (resetSuccess && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (resetSuccess && countdown === 0) {
      setLocation('/');
    }
  }, [resetSuccess, countdown, setLocation]);

  const verifyResetCode = async (code: string) => {
    try {
      const response = await fetch('/api/auth/verify-reset-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: code })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid reset token');
      }

      setEmail(data.email);
      setIsValidCode(true);
      setVerifying(false);
    } catch (error: any) {
      console.error('Verify reset code error:', error);
      setIsValidCode(false);
      setVerifying(false);
      
      toast({
        title: "Verification Failed",
        description: error.message || "This link is invalid or has expired.",
        variant: "destructive",
      });
    }
  };

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

    if (newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long",
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
      const response = await fetch('/api/auth/confirm-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: oobCode, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setResetSuccess(true);
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      toast({
        title: "Reset Failed",
        description: error.message || "Failed to reset password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Verifying password reset link...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (resetSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-green-500">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-2 animate-in zoom-in duration-300">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">Password Changed!</CardTitle>
            <CardDescription className="text-base">
              Your password has been successfully updated.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                You can now sign in with your new password
              </p>
              <p className="text-xs text-muted-foreground">
                Redirecting to login in <span className="font-bold text-primary">{countdown}</span> seconds...
              </p>
            </div>
            <Button
              onClick={() => setLocation('/')}
              className="w-full h-12 text-base font-semibold"
              size="lg"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign In Now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValidCode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Invalid Reset Link</CardTitle>
            <CardDescription>
              This password reset link is invalid, expired, or has already been used.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-center text-muted-foreground">
              Please request a new password reset link from the login page.
            </p>
            <Button
              onClick={() => setLocation('/')}
              className="w-full"
              variant="outline"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Reset Your Password</CardTitle>
          <CardDescription>
            for <span className="font-semibold text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min. 6 characters)"
                  className="h-12 pl-10"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="h-12 pl-10"
                  required
                  minLength={6}
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

            {newPassword && newPassword.length > 0 && newPassword.length < 6 && (
              <p className="text-sm text-amber-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Password must be at least 6 characters
              </p>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 6}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Resetting Password...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Reset Password
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => setLocation('/')}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
