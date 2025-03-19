import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  Sparkles,
  Search,
  Zap,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { WarpBackground } from "@/components/warp-background";
import { Badge } from "@/components/ui/badge";

export default function ChatPage() {
  return (
    <div className="w-full mx-auto flex flex-col min-h-[calc(100vh-120px)] space-y-20">
      {/* Hero Section */}
      <WarpBackground className="mt-5 p-0 rounded-xl border">
        <div className="flex-1 relative backdrop-blur">
          <div className="min-h-full flex items-center justify-center px-4">
            <div className="max-w-[800px] w-full text-center space-y-8 py-16">
              {/* Decorative elements */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

              {/* Gradient heading */}
              <div className="relative">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium">
                  Discovering the Power of Gemini Models with Gemish
                </h1>
              </div>

              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Powered by Google's latest AI, Gemish brings multimodal chat,
                deep reasoning, and real-time web search into one seamless
                experience. Whether you're brainstorming, learning, or just
                having a conversation, Gemish adapts to you.
              </p>

              <div className="pt-4">
                <Button size="lg" asChild className="rounded-full">
                  <Link href="/login">
                    Get Started with Gemish
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </WarpBackground>

      {/* Features Section */}
      <div className="container">
        <p className="font-medium text-lg text-center text-muted-foreground mb-10">
          Features
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full px-4 pb-12">
          <FeatureCard
            icon={<Sparkles className="text-primary" />}
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

      {/* Models Section */}
      <div className="container">
        <p className="font-medium text-lg text-center text-muted-foreground mb-10">
          Supported Models
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full px-4 pb-12">
          <ModelCard
            name="2.0 Pro"
            description="Our best model yet for coding performance and complex prompts."
            status="experimental"
          />
          <ModelCard
            name="2.0 Flash"
            description="Our powerful workhorse model with low latency and enhanced performance, built to power agentic experiences."
            status="general"
          />
          <ModelCard
            name="2.0 Flash Thinking"
            description="Our enhanced reasoning model, capable of showing its thoughts to improve performance and explainability."
            status="experimental"
          />
          <ModelCard
            name="2.0 Flash-Lite"
            description="Our most cost-efficient model yet."
            status="general"
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mb-20">
        <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20 p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-medium">
                Ready to experience Gemish?
              </h2>
              <p className="text-muted-foreground max-w-lg">
                Join thousands of users already leveraging the power of Gemini
                models. Start your journey with Gemish today.
              </p>
            </div>
            <Button
              size="lg"
              asChild
              className="rounded-full px-8 whitespace-nowrap"
            >
              <Link href="/login">
                Get Started for Free
                <ChevronRight className="ml-2" />
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <Card className="hover:shadow-md hover:border-primary/50 transition-all duration-300 flex flex-row items-center group py-4 px-5">
      <div className="mr-4 text-primary bg-muted rounded-md p-2">{icon}</div>
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

function ModelCard({ name, description, status }) {
  return (
    <Card className="hover:shadow-md hover:border-primary/50 transition-all duration-300 p-5">
      <Badge
        variant={status === "experimental" ? "secondary" : "default"}
        className="mb-3"
      >
        {status === "experimental" ? "Experimental" : "General availability"}
      </Badge>

      <h3 className="text-xl font-medium mb-2">{name}</h3>

      <p className="text-muted-foreground text-sm mb-4">{description}</p>
    </Card>
  );
}
