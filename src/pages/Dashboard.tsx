import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar, Building2, TestTube, User, LogOut, Edit, Trash2, CalendarIcon, Star } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Appointment {
  _id: string;
  diagnosticCenterId: {
    name: string;
    address: {
      street: string;
      city: string;
      // ...other address fields
    };
  };
  testId: {
    name: string;
    // ...other test fields
  };
  appointmentDate: string;
  status: string;
}

interface Review {
  _id: string;
  user: string;
  appointment: string;
  center: string;
  rating: number;
  comment: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [newTime, setNewTime] = useState("");
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Record<string, Review>>({});
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewingAppointment, setReviewingAppointment] = useState<Appointment | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewEditMode, setReviewEditMode] = useState(false);

  const fetchTests = async (token: string) => {
    try {
      const response = await fetch('/api/diagnostic-tests', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTests(Array.isArray(data.tests) ? data.tests : []);
      }
    } catch (error) {
      // ignore
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    console.log('Dashboard: Checking auth...', { token: !!token, userData: !!userData });
    
    if (!token || !userData) {
      console.log('Dashboard: No auth found, redirecting to login');
      navigate('/login');
      return;
    }

    const user = JSON.parse(userData);
    console.log('Dashboard: User found:', user);
    setUser(user);
    fetchAppointments(token);
    fetchTests(token);
  }, [navigate]);

  const fetchAppointments = async (token: string) => {
    try {
      const response = await fetch('/api/appointments/my-appointments', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Appointments data:', data);
        setAppointments(Array.isArray(data.appointments) ? data.appointments : []);
      } else {
        console.error('Failed to fetch appointments:', response.status);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setNewDate(appointment.appointmentDate.split('T')[0]);
    setNewStatus(appointment.status);
    setNewTime(appointment.appointmentDate.split('T')[1]?.slice(0,5) || "");
    // Find the test for this appointment
    let test = null;
    if (appointment.testId && (appointment.testId as any)._id) {
      test = tests.find(t => t._id === (appointment.testId as any)._id);
    } else if (appointment.testId && appointment.testId.name) {
      test = tests.find(t => t.name === appointment.testId.name);
    }
    if (test && Array.isArray(test.scheduledTimes) && test.scheduledTimes.length > 0) {
      setAvailableTimes(test.scheduledTimes);
    } else {
      setAvailableTimes([
        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
        "12:00", "12:30", "14:00", "14:30", "15:00", "15:30",
        "16:00", "16:30", "17:00", "17:30"
      ]);
    }
    setIsEditDialogOpen(true);
  };

  const handleUpdateAppointment = async () => {
    if (!editingAppointment) return;
    
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      console.log('Updating appointment with URL:', `/api/appointments/${editingAppointment._id}`);
      const response = await fetch(`/api/appointments/${editingAppointment._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          appointmentDate: newDate,
          appointmentTime: newTime,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Appointment updated successfully",
        });
        setIsEditDialogOpen(false);
        fetchAppointments(token);
      } else {
        throw new Error('Failed to update appointment');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAppointment = async () => {
    if (!appointmentToDelete) return;
    
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      console.log('Deleting appointment with URL:', `/api/appointments/${appointmentToDelete}`);
      const response = await fetch(`/api/appointments/${appointmentToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Appointment deleted successfully",
        });
        setDeleteConfirmOpen(false);
        setAppointmentToDelete(null);
        fetchAppointments(token);
      } else {
        throw new Error('Failed to delete appointment');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete appointment",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = (appointmentId: string) => {
    setAppointmentToDelete(appointmentId);
    setDeleteConfirmOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  // Fetch reviews for user's appointments
  const fetchUserReviews = async (token: string) => {
    try {
      const response = await fetch('/api/appointments/my-appointments', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        const appts = Array.isArray(data.appointments) ? data.appointments : [];
        // For each completed appointment, fetch review
        const reviewMap: Record<string, Review> = {};
        await Promise.all(appts.filter((a: any) => a.status === 'completed').map(async (a: any) => {
          const res = await fetch(`/api/reviews/center/${a.diagnosticCenterId._id}`);
          if (res.ok) {
            const reviewsArr = await res.json();
            // Debug: log all reviews fetched for this center
            console.log('Fetched reviews for center', a.diagnosticCenterId._id, reviewsArr);
            const userReview = reviewsArr.find(
              (r: any) => r.appointment === a._id && String(r.user?._id || r.user) === String(user?.id)
            );
            if (userReview) reviewMap[a._id] = userReview;
          }
        }));
        // Debug: log the final review map
        console.log('Review map after fetch:', reviewMap);
        setReviews(reviewMap);
      }
    } catch (e) { /* ignore */ }
  };

  // Update useEffect to fetch reviews after appointments
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) fetchUserReviews(token);
  }, [appointments]);

  const openReviewDialog = (appointment: Appointment) => {
    setReviewingAppointment(appointment);
    const existing = reviews[appointment._id];
    setReviewRating(existing ? existing.rating : 0);
    setReviewComment(existing ? existing.comment : "");
    setReviewEditMode(!!existing);
    setReviewDialogOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!reviewingAppointment) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    // Debug: log the payload and appointment
    console.log('Submitting review:', {
      appointmentId: reviewingAppointment._id,
      rating: reviewRating,
      comment: reviewComment,
      status: reviewingAppointment.status,
      user: user
    });
    try {
      const method = reviewEditMode ? 'PUT' : 'POST';
      const url = reviewEditMode
        ? `/api/reviews/${reviews[reviewingAppointment._id]._id}`
        : '/api/reviews';
      const body = reviewEditMode
        ? { rating: reviewRating, comment: reviewComment }
        : { appointmentId: reviewingAppointment._id, rating: reviewRating, comment: reviewComment };
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (response.ok) {
        toast({ title: 'Success', description: reviewEditMode ? 'Review updated' : 'Review submitted' });
        setReviewDialogOpen(false);
        fetchUserReviews(token);
        fetchAppointments(token); // <-- add this line
      } else {
        // Debug: log the error response
        const errorText = await response.text();
        console.error('Review submission failed:', errorText);
        throw new Error('Failed to submit review');
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to submit review', variant: 'destructive' });
    }
  };

  const handleDeleteReview = async () => {
    if (!reviewingAppointment) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch(`/api/reviews/${reviews[reviewingAppointment._id]._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        toast({ title: 'Success', description: 'Review deleted' });
        setReviewDialogOpen(false);
        fetchUserReviews(token);
      } else {
        throw new Error('Failed to delete review');
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to delete review', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-primary">HealthCare System</Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{user?.name}</span>
              <Badge variant="secondary">{user?.role}</Badge>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Calendar className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Book Appointment</CardTitle>
              <CardDescription>Schedule a new diagnostic appointment</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/appointments/book">
                <Button className="w-full">Book Now</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Building2 className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Find Centers</CardTitle>
              <CardDescription>Browse diagnostic centers near you</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/centers">
                <Button className="w-full" variant="outline">Browse</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <TestTube className="h-8 w-8 text-primary mb-2" />
              <CardTitle>View Tests</CardTitle>
              <CardDescription>Explore available diagnostic tests</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/tests">
                <Button className="w-full" variant="outline">View Tests</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Appointments</CardTitle>
            <CardDescription>Your latest appointment bookings</CardDescription>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No appointments found. <Link to="/appointments/book" className="text-primary hover:underline">Book your first appointment</Link>
              </p>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => {
                  console.log('Rendering appointment:', appointment);
                  return (
                    <div key={appointment._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold">{appointment.testId?.name || "Test"}</h4>
                        <p className="text-sm text-muted-foreground">{appointment.diagnosticCenterId?.name || "Center"}</p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.appointmentDate ? new Date(appointment.appointmentDate).toLocaleDateString() : ""}
                        </p>
                        {appointment.status === 'completed' && (
                          <div className="mt-2">
                            {reviews[appointment._id] ? (
                              <div className="flex items-center gap-2">
                                {[1,2,3,4,5].map((star) => (
                                  <Star key={star} className={star <= reviews[appointment._id].rating ? 'text-yellow-500' : 'text-gray-300'} />
                                ))}
                                <span className="text-sm">{reviews[appointment._id].comment}</span>
                              </div>
                            ) : (
                              <Button size="sm" onClick={() => openReviewDialog(appointment)}>Rate</Button>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleEditAppointment(appointment)}
                            disabled={appointment.status === 'completed' || appointment.status === 'cancelled'}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => confirmDelete(appointment._id)}
                            disabled={appointment.status === 'completed'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                     </div>
                   );
                 })}
               </div>
             )}
           </CardContent>
        </Card>
      </div>

      {/* Edit Appointment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
            <DialogDescription>
              Update your appointment details
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "col-span-3 justify-start text-left font-normal",
                      !newDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newDate ? format(new Date(newDate), "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={newDate ? new Date(newDate) : undefined}
                    onSelect={(date) => setNewDate(date ? format(date, "yyyy-MM-dd") : "")}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today;
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">
                Time
              </Label>
              <Select value={newTime} onValueChange={setNewTime}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {availableTimes.map((slot) => (
                    <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAppointment}>
              Update Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAppointment}>
              Delete Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{reviewEditMode ? 'Edit Review' : 'Rate Appointment'}</DialogTitle>
            <DialogDescription>
              {reviewingAppointment && (
                <span>For {reviewingAppointment.testId?.name} at {reviewingAppointment.diagnosticCenterId?.name}</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 mb-4">
            {[1,2,3,4,5].map((star) => (
              <Star
                key={star}
                className={star <= reviewRating ? 'text-yellow-500 cursor-pointer' : 'text-gray-300 cursor-pointer'}
                onClick={() => setReviewRating(star)}
              />
            ))}
          </div>
          <textarea
            className="w-full border rounded p-2 mb-4"
            rows={3}
            placeholder="Leave a comment..."
            value={reviewComment}
            onChange={e => setReviewComment(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitReview}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Footer */}
      <footer className="w-full py-4 bg-card border-t mt-8 text-center text-muted-foreground text-sm">
        Any QNA contact <a href="mailto:synechronhealth@gmail.com" className="underline text-primary">synechronhealth@gmail.com</a>
      </footer>
    </div>
  );
};

export default Dashboard;
