import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Home, 
  Users, 
  Heart, 
  Calendar, 
  Lightbulb,
  Briefcase,
  GraduationCap,
  Gift,
  MessageCircle,
  Trophy,
  Dumbbell,
  BookOpen
} from "lucide-react";
import heroImage from "@assets/stock_images/diverse_team_office__086c37bb.jpg";

interface LandingPageProps {
  onGetStarted: (mode: 'login' | 'register', loginMode?: 'email' | 'phone') => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const featureCategories = [
    { 
      icon: Calendar, 
      label: "Society Events", 
      color: "from-purple-400 to-pink-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/20"
    },
    { 
      icon: Lightbulb, 
      label: "Idea Sharing", 
      color: "from-yellow-400 to-orange-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/20"
    },
    { 
      icon: Heart, 
      label: "Health & Wellness", 
      color: "from-red-400 to-pink-500",
      bgColor: "bg-red-50 dark:bg-red-950/20"
    },
    { 
      icon: Gift, 
      label: "Festival Events", 
      color: "from-orange-400 to-red-500",
      bgColor: "bg-orange-50 dark:bg-orange-950/20"
    },
    { 
      icon: BookOpen, 
      label: "Learning & Classes", 
      color: "from-blue-400 to-cyan-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/20"
    },
    { 
      icon: Home, 
      label: "Smart Mobility", 
      color: "from-green-400 to-emerald-500",
      bgColor: "bg-green-50 dark:bg-green-950/20"
    },
    { 
      icon: Briefcase, 
      label: "Professional Services", 
      color: "from-blue-500 to-purple-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20"
    },
    { 
      icon: Trophy, 
      label: "Monetization", 
      color: "from-yellow-500 to-green-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/20"
    },
    { 
      icon: Dumbbell, 
      label: "Sport & Team", 
      color: "from-orange-500 to-red-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/20"
    },
    { 
      icon: MessageCircle, 
      label: "Forum", 
      color: "from-blue-500 to-purple-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/20"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 via-white to-white dark:from-gray-900 dark:via-background dark:to-background">
      {/* Hero Section */}
      <div 
        className="relative min-h-[70vh] sm:min-h-[75vh] flex items-center justify-center bg-cover bg-center bg-white dark:bg-gray-900"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.35) 100%), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center relative z-10">
          {/* Home Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6 rounded-full bg-purple-600 dark:bg-purple-900/30 border-2 border-purple-700 dark:border-purple-800 shadow-lg">
            <Home className="w-8 h-8 sm:w-10 sm:h-10 text-white dark:text-purple-400" />
          </div>
          
          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight mb-4 sm:mb-5 drop-shadow-sm">
            Welcome to My Society!
          </h1>
          
          {/* Tagline */}
          <p className="text-base sm:text-lg lg:text-xl text-gray-800 dark:text-gray-300 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-4 font-medium drop-shadow-sm">
            Your community's official platform for services, connections & events.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-4">
            <Button 
              size="lg" 
              onClick={() => onGetStarted('login', 'email')}
              variant="outline"
              className="px-8 sm:px-10 text-sm sm:text-base font-semibold border-2 border-purple-600 text-purple-700 hover:bg-purple-50 bg-white/90 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-950/30 w-full sm:w-auto"
              data-testid="button-login"
            >
              Login with Email
            </Button>
            <Button 
              size="lg" 
              onClick={() => onGetStarted('register', 'email')}
              className="px-8 sm:px-10 text-sm sm:text-base font-semibold shadow-lg shadow-purple-500/30 bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
              data-testid="button-register"
            >
              Register (30 sec)
            </Button>
          </div>
          
          {/* Social Proof */}
          <div className="inline-flex items-center gap-2 bg-purple-100/90 dark:bg-purple-900/30 backdrop-blur-sm px-4 py-2 rounded-full border-2 border-purple-600 dark:border-purple-800 shadow-md">
            <span className="text-gray-900 dark:text-gray-200 text-sm sm:text-base font-semibold">
              ✨ 100+ Community Members already connected
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
        
        {/* Community Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-16">
          <Card className="p-6 sm:p-8 text-center hover-elevate border-2">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 mb-4">
              <Users className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent mb-2">
              150+
            </div>
            <div className="text-sm sm:text-base text-muted-foreground font-medium">Residents Connected</div>
          </Card>
          
          <Card className="p-6 sm:p-8 text-center hover-elevate border-2">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-pink-100 to-red-200 dark:from-pink-900/30 dark:to-red-800/30 mb-4">
              <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-pink-600 dark:text-pink-400" />
            </div>
            <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent mb-2">
              50+
            </div>
            <div className="text-sm sm:text-base text-muted-foreground font-medium">Services Offered</div>
          </Card>
          
          <Card className="p-6 sm:p-8 text-center hover-elevate border-2">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-purple-100 to-indigo-200 dark:from-purple-900/30 dark:to-indigo-800/30 mb-4">
              <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              20+
            </div>
            <div className="text-sm sm:text-base text-muted-foreground font-medium">Community Events</div>
          </Card>
        </div>

        {/* Feature Categories Preview */}
        <div className="mb-12 sm:mb-16">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              Explore Features
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover everything our community has to offer
            </p>
          </div>
          
          <div className="grid grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
            {featureCategories.map((category, index) => (
              <Card 
                key={index} 
                className="p-3 sm:p-4 lg:p-5 text-center hover-elevate transition-all duration-300 group border-2"
                data-testid={`card-feature-${category.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br ${category.color} mb-2 sm:mb-3 shadow-lg`}>
                  <category.icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                </div>
                <p className="text-[10px] sm:text-xs lg:text-sm font-semibold text-foreground leading-tight">
                  {category.label}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <Card className="p-8 sm:p-10 lg:p-12 text-center bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-2">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
            Ready to Join?
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
            Create your profile in just 30 seconds and start connecting with your neighbors.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Button 
              size="lg"
              onClick={() => onGetStarted('register')}
              className="h-12 sm:h-14 px-8 sm:px-10 text-sm sm:text-base font-semibold bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg shadow-purple-500/30 w-full sm:w-auto hover-elevate active-elevate-2"
              data-testid="button-register-bottom"
            >
              Get Started Now
            </Button>
            <Button 
              size="lg"
              onClick={() => onGetStarted('login', 'email')}
              variant="outline"
              className="h-12 sm:h-14 px-8 sm:px-10 text-sm sm:text-base font-semibold w-full sm:w-auto hover-elevate active-elevate-2 border-2"
              data-testid="button-login-bottom"
            >
              Login with Email
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
