
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Building2, TestTube, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Synechron Health care</h1>
          <div className="flex gap-2 items-center">
            <a href="#about-us" className="text-primary hover:underline font-medium px-3 py-2 rounded transition-colors">About Us</a>
            <Link to="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link to="/register">
              <Button>Register</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl font-bold mb-4">Welcome to Synechron Health care</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Your comprehensive healthcare management platform. Book appointments, manage diagnostic centers, and access healthcare services all in one place.
        </p>
        <Link to="/login">
          <Button size="lg" className="mr-4">Dive In</Button>
        </Link>
        <Link to="/centers">
          <Button variant="outline" size="lg">Browse Centers</Button>
        </Link>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">Our Services</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Calendar className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Book Appointments</CardTitle>
              <CardDescription>
                Schedule appointments with diagnostic centers easily
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/login">
                <Button variant="outline" className="w-full">Get Started</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Building2 className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Diagnostic Centers</CardTitle>
              <CardDescription>
                Find and connect with certified diagnostic centers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/login">
                <Button variant="outline" className="w-full">Explore</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <TestTube className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Diagnostic Tests</CardTitle>
              <CardDescription>
                Comprehensive range of diagnostic tests available
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/login">
                <Button variant="outline" className="w-full">View Tests</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Patient Portal</CardTitle>
              <CardDescription>
                Manage your health records and appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/login">
                <Button variant="outline" className="w-full">Access Portal</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about-us" className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">About Us</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
          {/* Individual KPI Cards for each team member */}
          {[
            { name: 'Hitesh H', img: 'https://avatars.githubusercontent.com/u/90308743?v=4' },
            { name: 'Mohith C M', img: 'https://avatars.githubusercontent.com/u/139070250?v=4' },
            { name: 'Akarsh Salimath', img: 'https://avatars.githubusercontent.com/u/188981896?v=4' },
            { name: 'Kavya M', img: 'https://avatars.githubusercontent.com/u/85388092?v=4' },
            { name: 'Gopika M', img: 'https://avatars.githubusercontent.com/u/146747174?v=4' },
          ].map((person) => (
            <Card key={person.name} className="hover:shadow-lg transition-shadow flex flex-col items-center py-6">
              <CardHeader className="flex flex-col items-center">
                <div className="group">
                  <img
                    src={person.img}
                    alt={person.name}
                    className="w-20 h-20 rounded-full border-4 border-background shadow-lg object-cover transition-transform group-hover:scale-110 group-hover:ring-4 group-hover:ring-primary/40"
                  />
                </div>
                <CardTitle className="mt-4 text-lg text-center group-hover:text-primary transition-colors">{person.name}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
        <div className="max-w-3xl mx-auto mt-12 text-center text-lg text-muted-foreground">
          <p>
            Synechron Health care is a modern platform designed to streamline healthcare management for patients and diagnostic centers. Our mission is to make healthcare accessible, efficient, and user-friendly for everyone.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2025 Synechron Health care. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
