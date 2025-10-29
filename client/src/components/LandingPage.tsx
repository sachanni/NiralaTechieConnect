import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket, Users, Zap, Code, Trophy, MessageSquare } from "lucide-react";
import heroImage from "@assets/generated_images/Community_tech_meetup_residential_space_65fa5b07.png";

interface LandingPageProps {
  onGetStarted: () => void;
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
            <Rocket className="w-10 h-10 text-white" />
            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-white">
              Welcome, Nirala Techie!
            </h1>
          </div>
          <p className="text-xl lg:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join our official platform to connect, collaborate & grow.
          </p>
          <Button 
            size="lg" 
            onClick={onGetStarted}
            className="h-12 px-8 text-base font-semibold bg-primary hover-elevate active-elevate-2 border border-primary-border"
            data-testid="button-get-started"
          >
            Register with Phone (30 sec)
          </Button>
          <p className="text-white/70 text-sm mt-4">
            100+ IT professionals already connected
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          <Card className="p-8 text-center hover-elevate">
            <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
            <div className="text-4xl font-bold text-foreground mb-2">150+</div>
            <div className="text-sm text-muted-foreground">Active Members</div>
          </Card>
          <Card className="p-8 text-center hover-elevate">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-primary" />
            <div className="text-4xl font-bold text-foreground mb-2">500+</div>
            <div className="text-sm text-muted-foreground">Discussions</div>
          </Card>
          <Card className="p-8 text-center hover-elevate">
            <Code className="w-12 h-12 mx-auto mb-4 text-primary" />
            <div className="text-4xl font-bold text-foreground mb-2">30+</div>
            <div className="text-sm text-muted-foreground">Tech Stacks</div>
          </Card>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl lg:text-4xl font-semibold text-center mb-12 text-foreground">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: 1, title: "Enter Phone", desc: "Quick verification via OTP" },
              { step: 2, title: "Fill Profile", desc: "Share your tech journey" },
              { step: 3, title: "Earn Points", desc: "Get 50 points instantly" },
              { step: 4, title: "Connect", desc: "Meet fellow developers" }
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: Code, title: "Tech Networking", desc: "Connect with developers across all tech stacks" },
              { icon: Zap, title: "Skill Sharing", desc: "Learn from experienced professionals in your society" },
              { icon: Trophy, title: "Gamification", desc: "Earn points and badges for active participation" },
              { icon: Users, title: "Local Community", desc: "Build meaningful connections with your neighbors" }
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
            Create your profile in just 30 seconds and start connecting with the best tech minds in Nirala.
          </p>
          <Button 
            size="lg"
            onClick={onGetStarted}
            className="h-12 px-8 text-base font-semibold hover-elevate active-elevate-2"
            data-testid="button-join-now"
          >
            Get Started Now
          </Button>
        </Card>
      </div>
    </div>
  );
}
