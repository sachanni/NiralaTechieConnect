import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { EmailPasswordAuthService } from "@/lib/firebase";
import { Mail, Lock, ArrowLeft, Smartphone, Send } from "lucide-react";

interface EmailPasswordLoginProps {
  onLoginSuccess: (idToken: string) => void;
  onBackToLanding: () => void;
  onSwitchToPhoneLogin: () => void;
}

export default function EmailPasswordLogin({ 
  onLoginSuccess, 
  onBackToLanding,
  onSwitchToPhoneLogin
}: EmailPasswordLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [sendingReset, setSendingReset] = useState(false);
  const { toast } = useToast();
  const [emailPasswordService] = useState(() => new EmailPasswordAuthService());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing Fields",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      onLoginSuccess(data.accessToken);
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = error.message || "Invalid email or password";
      
      if (errorMessage.includes('locked')) {
        errorMessage = "Account temporarily locked due to multiple failed attempts. Please try again later.";
      } else if (errorMessage.includes('not found')) {
        errorMessage = "No account found with this email. Please check your email or register.";
      }
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailReset = async () => {
    if (!resetEmail || !resetEmail.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setSendingReset(true);
    try {
      const response = await fetch('/api/auth/send-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      toast({
        title: "Reset Email Sent! ✉️",
        description: "Check your inbox for password reset instructions. The link expires in 1 hour.",
        duration: 6000,
      });
      setShowResetDialog(false);
      setResetEmail('');
    } catch (error: any) {
      console.error('Email reset error:', error);
      
      toast({
        title: "Reset Failed",
        description: error.message || "Failed to send reset email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToLanding}
            className="w-fit -ml-2 mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <CardTitle className="text-2xl font-bold">Welcome Back!</CardTitle>
          <CardDescription>
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="h-12 pl-10"
                  required
                  autoComplete="email"
                  data-testid="input-login-email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-12 pl-10"
                  required
                  autoComplete="current-password"
                  data-testid="input-login-password"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              disabled={loading}
              data-testid="button-submit-login"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => {
                setResetEmail(email);
                setShowResetDialog(true);
              }}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Forgot password? Click here to reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Your Password</DialogTitle>
            <DialogDescription>
              Choose your preferred password reset method
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900 mb-1">Reset via Email (Recommended)</h4>
                    <p className="text-sm text-green-700 mb-3">
                      Get an instant password reset link sent to your email.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="reset-email" className="text-green-900">Email Address</Label>
                      <div className="flex gap-2">
                        <Input
                          id="reset-email"
                          type="email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          className="flex-1"
                        />
                        <Button 
                          onClick={handleEmailReset}
                          disabled={sendingReset}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {sendingReset ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Send
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Smartphone className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 mb-1">Reset via Phone OTP</h4>
                    <p className="text-sm text-blue-700 mb-3">
                      Verify your identity with a one-time code sent to your phone.
                    </p>
                    <Button 
                      onClick={() => {
                        setShowResetDialog(false);
                        onSwitchToPhoneLogin();
                      }}
                      variant="outline"
                      className="w-full border-orange-300 hover:bg-orange-100"
                    >
                      <Smartphone className="w-4 h-4 mr-2" />
                      Continue with Phone
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
