import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserAdded: () => void;
}

interface NewUser {
  name: string;
  email: string;
  password: string;
  role: string;
}

const AddUserDialog = ({ open, onOpenChange, onUserAdded }: AddUserDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [newUser, setNewUser] = useState<NewUser>({
    name: "",
    email: "",
    password: "",
    role: "patient"
  });
  const [otp, setOtp] = useState("");
  const [passwordAlert, setPasswordAlert] = useState(false);
  const [otpAlert, setOtpAlert] = useState(false);
  const { toast } = useToast();

  const handleSendOtp = async () => {
    setOtpLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          password: newUser.password || 'dummyPassword', // backend requires password, but we will update it after OTP
          phone: '000-000-0000',
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setOtpSent(true);
        setUserId(data.userId);
        toast({
          title: "OTP Sent",
          description: "Please check the email for the verification code.",
        });
      } else {
        toast({
          title: "Failed to send OTP",
          description: data.message || "Please try again.",
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
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordAlert(false);
    setOtpAlert(false);
    if (newUser.password.length < 6) {
      setPasswordAlert(true);
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }
    if (!/^\d{6}$/.test(otp)) {
      setOtpAlert(true);
      toast({
        title: "Invalid OTP",
        description: "OTP must be exactly 6 digits.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      // Verify OTP and complete registration
      const response = await fetch('/api/auth/verify-registration-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          otp,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        toast({
          title: "Success",
          description: "User created and verified successfully.",
        });
        setNewUser({ name: "", email: "", password: "", role: "patient" });
        setOtp("");
        setOtpSent(false);
        setUserId(null);
        onUserAdded();
        onOpenChange(false);
      } else {
        toast({
          title: "OTP Verification Failed",
          description: data.message || "Invalid or expired OTP.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify OTP.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add New User
          </DialogTitle>
          <DialogDescription>
            Create a new user account with the specified role.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter user name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                required
                disabled={otpSent}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
                disabled={otpSent}
              />
            </div>
            {!otpSent && (
              <Button type="button" className="w-full" onClick={handleSendOtp} disabled={otpLoading || !newUser.email || !newUser.name}>
                {otpLoading ? "Sending OTP..." : "Send OTP"}
              </Button>
            )}
            {otpSent && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                  />
                  {newUser.password && newUser.password.length < 6 && (
                    <span className="text-sm text-destructive">Password must be at least 6 characters.</span>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="patient">Patient</SelectItem>
                      <SelectItem value="diagnostic_center_admin">Diagnostic Center Admin</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="otp">OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    maxLength={6}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    required
                  />
                  {otpAlert && (
                    <span className="text-sm text-destructive">OTP must be exactly 6 digits.</span>
                  )}
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {otpSent && (
              <Button type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Create User"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;