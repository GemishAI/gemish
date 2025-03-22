"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  MessageCircle,
  ImageIcon,
  FileTextIcon,
} from "lucide-react";
import { usePostHog } from "posthog-js/react";

export default function ChatPage() {
  const posthog = usePostHog();
  return (
    <div className="w-full mx-auto flex flex-col h-full space-y-24">
      {/* Hero Section */}

      <div className="w-full text-center space-y-5 h0full">
        <div className="relative">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium">
            Chat Smarter with Gemish
          </h1>
        </div>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Effortlessly chat with text, images, and PDFs—all in one place.
        </p>

        <div className="pt-4">
          <Button
            size="lg"
            onClick={() => posthog.capture("try_gemish_free")}
            asChild
            className="rounded-full"
          >
            <Link href="/login" className="dark:text-white">
              Try Gemish for free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="flex flex-col items-center gap-5">
        <p className="font-medium text-lg text-center text-muted-foreground ">
          Features
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full px-4 ">
          <FeatureCard
            icon={<MessageCircle className="text-primary" />}
            title="Text Chat"
            description="Seamless, real-time conversations for all your needs."
          />
          <FeatureCard
            icon={<ImageIcon className="text-primary" />}
            title="Image Chat"
            description="Upload and discuss images with smart responses."
          />
          <FeatureCard
            icon={<FileTextIcon className="text-primary" />}
            title="PDF Chat"
            description="Interact with PDF content through natural chat."
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
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
