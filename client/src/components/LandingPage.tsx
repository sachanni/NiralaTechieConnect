import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, Users, Heart, UtensilsCrossed, GraduationCap, Calendar, ShoppingCart, Sparkles } from "lucide-react";
import heroImage from "@assets/stock_images/modern_apartment_com_dff84ee3.jpg";

interface LandingPageProps {
  onGetStarted: (mode: 'login' | 'register', loginMode?: 'email' | 'phone') => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <div 
        className="relative min-h-[100svh] sm:h-[85vh] lg:h-[80vh] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.6)), url(${heroImage})`
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-0 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-2 mb-4 sm:mb-6">
            <Home className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-white leading-tight">
              Welcome to My Society!
            </h1>
          </div>
          <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
            Your community's official platform for services, connections & events.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={() => onGetStarted('login', 'email')}
              variant="outline"
              className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-semibold bg-white/10 hover:bg-white/20 text-white border-white/30 hover-elevate active-elevate-2 backdrop-blur-sm w-full sm:w-auto"
              data-testid="button-login"
            >
              Login with Email
            </Button>
            <Button 
              size="lg" 
              onClick={() => onGetStarted('register', 'email')}
              className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-semibold bg-primary hover-elevate active-elevate-2 border border-primary-border w-full sm:w-auto"
              data-testid="button-register"
            >
              Register (30 sec)
            </Button>
          </div>
          <p className="text-white/70 text-xs sm:text-sm mt-3 sm:mt-4">
            100+ Community Members already connected
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16">
          <Card className="p-6 sm:p-8 text-center hover-elevate">
            <Users className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-primary" />
            <div className="text-3xl sm:text-4xl font-bold text-foreground mb-2">150+</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Residents Connected</div>
          </Card>
          <Card className="p-6 sm:p-8 text-center hover-elevate">
            <Heart className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-primary" />
            <div className="text-3xl sm:text-4xl font-bold text-foreground mb-2">50+</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Services Offered</div>
          </Card>
          <Card className="p-6 sm:p-8 text-center hover-elevate">
            <Calendar className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-primary" />
            <div className="text-3xl sm:text-4xl font-bold text-foreground mb-2">20+</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Community Events</div>
          </Card>
        </div>

        <div className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-center mb-6 sm:mb-8 lg:mb-12 text-foreground px-4">
            How It Works
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {[
              { step: 1, title: "Enter Phone", desc: "Quick verification via OTP" },
              { step: 2, title: "Complete Profile", desc: "Share your skills & interests" },
              { step: 3, title: "Earn Points", desc: "Get 50 points instantly" },
              { step: 4, title: "Connect", desc: "Meet your neighbors" }
            ].map((item) => (
              <Card key={item.step} className="p-4 sm:p-5 lg:p-6 hover-elevate">
                <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-base sm:text-lg lg:text-xl font-bold mb-2 sm:mb-3 lg:mb-4">
                  {item.step}
                </div>
                <h3 className="text-base sm:text-lg lg:text-xl font-medium mb-1 sm:mb-1.5 lg:mb-2 text-foreground">{item.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-snug">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-center mb-8 sm:mb-12 text-foreground px-4">
            Community Benefits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: UtensilsCrossed, title: "Food & Wellness", desc: "Homemade tiffins, yoga classes, health consultations" },
              { icon: GraduationCap, title: "Learning & Skills", desc: "Tutoring, music lessons, professional mentoring" },
              { icon: Calendar, title: "Community Events", desc: "Festivals, gatherings, and social activities" },
              { icon: ShoppingCart, title: "Marketplace", desc: "Buy, sell, rent tools and equipment with neighbors" },
              { icon: Users, title: "Local Connections", desc: "Find babysitters, carpool buddies, service providers" },
              { icon: Sparkles, title: "Give & Receive", desc: "Share skills, earn points, help your community thrive" }
            ].map((benefit) => (
              <Card key={benefit.title} className="p-5 sm:p-6 flex gap-3 sm:gap-4 hover-elevate">
                <benefit.icon className="w-7 h-7 sm:w-8 sm:h-8 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg lg:text-xl font-medium mb-1.5 sm:mb-2 text-foreground">{benefit.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{benefit.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Card className="p-6 sm:p-8 lg:p-12 text-center bg-accent">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-3 sm:mb-4 text-foreground">Ready to Join?</h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-5 sm:mb-6 max-w-2xl mx-auto px-2">
            Create your profile in just 30 seconds and start connecting with your neighbors.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Button 
              size="lg"
              onClick={() => onGetStarted('login', 'email')}
              variant="outline"
              className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-semibold hover-elevate active-elevate-2 w-full sm:w-auto"
              data-testid="button-login-bottom"
            >
              Login with Email
            </Button>
            <Button 
              size="lg"
              onClick={() => onGetStarted('register')}
              className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-semibold hover-elevate active-elevate-2 w-full sm:w-auto"
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
