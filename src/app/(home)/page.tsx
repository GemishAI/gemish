import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ArrowRight, Sparkles, Search, Zap } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="w-full mx-auto flex flex-col min-h-[calc(100vh-120px)] ">
      {/* Hero Section */}
      <div className="flex-1 relative">
        <div className="min-h-full flex items-center justify-center px-4">
          <div className="max-w-[800px] w-full text-center space-y-8 py-16">
            {/* Decorative elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            {/* Gradient heading */}
            <div className="relative">
              <h1 className="text-4xl md:text-5xl lg:text-6xl ">
                Discovering the Power of Gemini Models with Gemish
              </h1>
            </div>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powered by Google's latest AI, Gemish brings multimodal chat, deep
              reasoning, and real-time web search into one seamless experience.
              Whether you're brainstorming, learning, or just having a
              conversation, Gemish adapts to you.
            </p>

            <div className="pt-4">
              <Button size="lg" asChild className="rounded-full ">
                <Link href="/login">
                  Get Started with Gemish
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="">
        <p className="font-medium text-lg text-center text-muted-foreground mb-10">
          Features
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6  w-full px-4 pb-12">
          <FeatureCard
            icon={<Sparkles className=" text-primary" />}
            title="Multimodal Chat"
            description="Communicate with images, text, and more in one seamless conversation."
          />
          <FeatureCard
            icon={<Zap className="text-primary" />}
            title="Deep Reasoning"
            description="Tackle complex problems with advanced logical reasoning capabilities."
          />
          <FeatureCard
            icon={<Search className="text-primary" />}
            title="Real-time Search"
            description="Access the latest information without leaving your chat interface."
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <Card className=" hover:shadow-md hover:border-primary/50 transition-all duration-300 flex flex-row items-center  group py-4 px-5">
      <div className="flex flex-col">
        <h3 className="text-lg font-medium mb-2 group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm text-balance">
          {description}
        </p>
      </div>
    </Card>
  );
}
