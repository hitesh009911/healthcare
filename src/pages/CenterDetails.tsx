import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Phone, Mail, Clock, Star, ArrowLeft, Calendar } from "lucide-react";
import BackButton from "@/components/BackButton";

interface OperatingHours {
  open: string;
  close: string;
}

interface DiagnosticCenter {
  _id: string;
  name: string;
  description?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phone: string;
  email: string;
  operatingHours: {
    monday: OperatingHours;
    tuesday: OperatingHours;
    wednesday: OperatingHours;
    thursday: OperatingHours;
    friday: OperatingHours;
    saturday: OperatingHours;
    sunday: OperatingHours;
  };
  services?: string[];
  isActive: boolean;
  rating?: number;
  totalReviews?: number;
  adminId?: {
    name: string;
    email: string;
    phone: string;
  };
}

interface Review {
  _id: string;
  user: { name: string };
  rating: number;
  comment: string;
  createdAt: string;
}

const CenterDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [center, setCenter] = useState<DiagnosticCenter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCenterDetails(id);
    }
  }, [id]);

  useEffect(() => {
    if (center?._id) {
      fetchCenterReviews(center._id);
    }
  }, [center?._id]);

  const fetchCenterDetails = async (centerId: string) => {
    try {
      const response = await fetch(`/api/diagnostic-centers/${centerId}`);
      if (response.ok) {
        const data = await response.json();
        setCenter(data.center);
      } else {
        setError("Failed to fetch center details");
      }
    } catch (error) {
      console.error('Error fetching center details:', error);
      setError("Failed to fetch center details");
    } finally {
      setLoading(false);
    }
  };

  const fetchCenterReviews = async (centerId: string) => {
    setReviewsLoading(true);
    try {
      const response = await fetch(`/api/reviews/center/${centerId}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (e) { /* ignore */ }
    setReviewsLoading(false);
  };

  const formatOperatingHours = (day: string, hours: OperatingHours) => {
    if (!hours.open || !hours.close) return "Closed";
    return `${hours.open} - ${hours.close}`;
  };

  const getDaysArray = () => [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !center) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <BackButton />
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {error || "Center not found"}
            </p>
            <Link to="/centers">
              <Button className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Centers
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">{center.name}</h1>
            <Badge variant={center.isActive ? "default" : "secondary"}>
              {center.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          
          {center.description && (
            <p className="text-muted-foreground mb-4">{center.description}</p>
          )}
          
          {center.rating !== undefined && (
            <div className="flex items-center gap-2 mb-6">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-lg font-medium">{center.rating.toFixed(1)} / 5</span>
              <span className="text-muted-foreground">({center.totalReviews} reviews)</span>
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-500" />
            Reviews
          </h2>
          {reviewsLoading ? (
            <div className="text-muted-foreground">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="text-muted-foreground">No reviews yet.</div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    {[1,2,3,4,5].map((star) => (
                      <Star key={star} className={star <= review.rating ? 'text-yellow-500' : 'text-gray-300'} />
                    ))}
                    <span className="ml-2 font-medium">{review.user?.name || 'User'}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="text-sm">{review.comment}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-muted-foreground">
                    {center.address.street}<br />
                    {center.address.city}, {center.address.state} - {center.address.zipCode}<br />
                    {center.address.country}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-muted-foreground">{center.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-muted-foreground">{center.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operating Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Operating Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {getDaysArray().map(({ key, label }) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="font-medium">{label}</span>
                    <span className="text-muted-foreground">
                      {formatOperatingHours(key, center.operatingHours[key as keyof typeof center.operatingHours])}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          {center.services && center.services.length > 0 && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Services Offered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {center.services.map((service, index) => (
                    <Badge key={index} variant="secondary">
                      {service}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Admin Information */}
          {center.adminId && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Center Administrator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">{center.adminId.name}</p>
                    <p className="text-muted-foreground">{center.adminId.email}</p>
                    <p className="text-muted-foreground">{center.adminId.phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <Link to="/appointments/book" className="flex-1">
            <Button className="w-full">
              <Calendar className="mr-2 h-4 w-4" />
              Book Appointment
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CenterDetails;