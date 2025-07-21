
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from "react-router-dom";
import BackButton from "@/components/BackButton";

const VerifyOTP = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { userId, email, type } = location.state || {};

  useEffect(() => {
    if (!userId || !email) {
      navigate('/register');
    }
  }, [userId, email, navigate]);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const endpoint = type === 'password_reset' ? '/api/auth/reset-password' : '/api/auth/verify-registration-otp';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId, 
          otp,
          ...(type === 'password_reset' && { newPassword: location.state?.newPassword })
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: type === 'password_reset' ? "Password reset successfully" : "Registration completed successfully",
        });
        
        if (type === 'password_reset') {
          navigate('/login');
        } else {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // Route based on user role
          if (data.user.role === 'diagnostic_center_admin') {
            navigate('/diagnostic-center-admin');
          } else if (data.user.role === 'admin' || data.user.role === 'super_admin') {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }
        }
      } else {
        toast({
          title: "Verification Failed",
          description: data.message || "Invalid or expired OTP",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <BackButton to={type === 'password_reset' ? '/forgot-password' : '/register'} />
        <Card>
          <CardHeader>
            <CardTitle>Verify OTP</CardTitle>
            <CardDescription>
              We've sent a 6-digit code to {email}. Enter it below to {type === 'password_reset' ? 'reset your password' : 'complete your registration'}.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleVerifyOTP}>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Didn't receive the code? Check your spam folder or try again.
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default VerifyOTP;
