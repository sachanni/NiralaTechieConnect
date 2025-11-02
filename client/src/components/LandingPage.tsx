import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, Users, Heart, UtensilsCrossed, GraduationCap, Calendar, ShoppingCart, Sparkles } from "lucide-react";
import heroImage from "@assets/stock_images/modern_apartment_com_dff84ee3.jpg";

interface LandingPageProps {
  onGetStarted: (mode: 'login' | 'register') => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <div 
        className="relative h-[80vh] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.6)), url(${heroImage})`
        }}
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Home className="w-10 h-10 text-white" />
            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-white">
              Welcome to My Society!
            </h1>
          </div>
          <p className="text-xl lg:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            Your community's official platform for services, connections & events.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={() => onGetStarted('login')}
              variant="outline"
              className="h-12 px-8 text-base font-semibold bg-white/10 hover:bg-white/20 text-white border-white/30 hover-elevate active-elevate-2 backdrop-blur-sm w-full sm:w-auto"
              data-testid="button-login"
            >
              Login with Phone
            </Button>
            <Button 
              size="lg" 
              onClick={() => onGetStarted('register')}
              className="h-12 px-8 text-base font-semibold bg-primary hover-elevate active-elevate-2 border border-primary-border w-full sm:w-auto"
              data-testid="button-register"
            >
              Register (30 sec)
            </Button>
          </div>
          <p className="text-white/70 text-sm mt-4">
            100+ Community Members already connected
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          <Card className="p-8 text-center hover-elevate">
            <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
            <div className="text-4xl font-bold text-foreground mb-2">150+</div>
            <div className="text-sm text-muted-foreground">Residents Connected</div>
          </Card>
          <Card className="p-8 text-center hover-elevate">
            <Heart className="w-12 h-12 mx-auto mb-4 text-primary" />
            <div className="text-4xl font-bold text-foreground mb-2">50+</div>
            <div className="text-sm text-muted-foreground">Services Offered</div>
          </Card>
          <Card className="p-8 text-center hover-elevate">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-primary" />
            <div className="text-4xl font-bold text-foreground mb-2">20+</div>
            <div className="text-sm text-muted-foreground">Community Events</div>
          </Card>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl lg:text-4xl font-semibold text-center mb-12 text-foreground">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: 1, title: "Enter Phone", desc: "Quick verification via OTP" },
              { step: 2, title: "Complete Profile", desc: "Share your skills & interests" },
              { step: 3, title: "Earn Points", desc: "Get 50 points instantly" },
              { step: 4, title: "Connect", desc: "Meet your neighbors" }
            ].map((item) => (
              <Card key={item.step} className="p-6 hover-elevate">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-medium mb-2 text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl lg:text-4xl font-semibold text-center mb-12 text-foreground">
            Community Benefits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: UtensilsCrossed, title: "Food & Wellness", desc: "Homemade tiffins, yoga classes, health consultations" },
              { icon: GraduationCap, title: "Learning & Skills", desc: "Tutoring, music lessons, professional mentoring" },
              { icon: Calendar, title: "Community Events", desc: "Festivals, gatherings, and social activities" },
              { icon: ShoppingCart, title: "Marketplace", desc: "Buy, sell, rent tools and equipment with neighbors" },
              { icon: Users, title: "Local Connections", desc: "Find babysitters, carpool buddies, service providers" },
              { icon: Sparkles, title: "Give & Receive", desc: "Share skills, earn points, help your community thrive" }
            ].map((benefit) => (
              <Card key={benefit.title} className="p-6 flex gap-4 hover-elevate">
                <benefit.icon className="w-8 h-8 text-primary flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-medium mb-2 text-foreground">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Card className="p-8 lg:p-12 text-center bg-accent">
          <h2 className="text-3xl font-semibold mb-4 text-foreground">Ready to Join?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Create your profile in just 30 seconds and start connecting with your neighbors.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg"
              onClick={() => onGetStarted('login')}
              variant="outline"
              className="h-12 px-8 text-base font-semibold hover-elevate active-elevate-2 w-full sm:w-auto"
              data-testid="button-login-bottom"
            >
              Login
            </Button>
            <Button 
              size="lg"
              onClick={() => onGetStarted('register')}
              className="h-12 px-8 text-base font-semibold hover-elevate active-elevate-2 w-full sm:w-auto"
              data-testid="button-register-bottom"
            >
              Get Started Now
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
