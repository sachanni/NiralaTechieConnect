import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Smartphone, ArrowLeft } from "lucide-react";
import { PhoneAuthService } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface PhoneVerificationProps {
  onVerified: (idToken: string, phoneNumber: string) => void;
  onBack?: () => void;
}

export default function PhoneVerification({ onVerified, onBack }: PhoneVerificationProps) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [phoneAuthService] = useState(() => new PhoneAuthService());
  const { toast } = useToast();

  useEffect(() => {
    phoneAuthService.setupRecaptcha('recaptcha-container');
    
    return () => {
      phoneAuthService.cleanup();
    };
  }, [phoneAuthService]);

  useEffect(() => {
    if (step === 'otp' && resendTimer > 0) {
      const timer = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [step, resendTimer]);

  const handleSendOtp = async () => {
    if (phoneNumber.length !== 10) return;
    
    setLoading(true);
    try {
      await phoneAuthService.sendOTP(phoneNumber);
      setStep('otp');
      setResendTimer(30);
      toast({
        title: "OTP Sent",
        description: `Verification code sent to +91 ${phoneNumber}`,
      });
    } catch (error: any) {
      console.error('OTP send error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) return;

    setLoading(true);
    try {
      const idToken = await phoneAuthService.verifyOTP(otpValue);
      onVerified(idToken, phoneNumber);
    } catch (error: any) {
      console.error('OTP verification error:', error);
      toast({
        title: "Verification Failed",
        description: "Invalid OTP. Please try again.",
        variant: "destructive",
      });
      setOtp(['', '', '', '', '', '']);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await phoneAuthService.sendOTP(phoneNumber);
      setResendTimer(30);
      setOtp(['', '', '', '', '', '']);
      toast({
        title: "OTP Resent",
        description: "A new verification code has been sent",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend OTP",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div id="recaptcha-container"></div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center relative">
          {onBack && step === 'phone' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="absolute left-2 top-2"
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          {step === 'otp' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setStep('phone')}
              className="absolute left-2 top-2"
              data-testid="button-back-to-phone"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Smartphone className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {step === 'phone' ? 'Enter Phone Number' : 'Verify OTP'}
          </CardTitle>
          <CardDescription>
            {step === 'phone' 
              ? 'We\'ll send you a verification code' 
              : `Code sent to +91 ${phoneNumber}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'phone' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex gap-2">
                  <div className="flex items-center justify-center px-3 h-12 bg-muted rounded-lg text-sm font-medium">
                    +91
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="9876543210"
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    className="h-12"
                    data-testid="input-phone"
                  />
                </div>
              </div>
              <Button 
                className="w-full h-12 hover-elevate active-elevate-2"
                onClick={handleSendOtp}
                disabled={phoneNumber.length !== 10 || loading}
                data-testid="button-send-otp"
              >
                {loading ? "Sending..." : "Send OTP"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Enter 6-digit code</Label>
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      className="w-12 h-12 text-center text-lg font-semibold"
                      data-testid={`input-otp-${index}`}
                    />
                  ))}
                </div>
              </div>
              <Button 
                className="w-full h-12 hover-elevate active-elevate-2"
                onClick={handleVerifyOtp}
                disabled={otp.join('').length !== 6 || loading}
                data-testid="button-verify-otp"
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </Button>
              <div className="text-center text-sm">
                {resendTimer > 0 ? (
                  <span className="text-muted-foreground">
                    Resend code in {resendTimer}s
                  </span>
                ) : (
                  <Button 
                    variant="ghost" 
                    className="text-primary hover-elevate"
                    onClick={handleResend}
                    disabled={loading}
                    data-testid="button-resend-otp"
                  >
                    Resend Code
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
