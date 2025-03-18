import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function ChatPage() {
  return (
    <div className="min-h-screen w-full mx-auto flex flex-col">
      <div className="flex-1 overflow-y-auto relative">
        <div className="min-h-full flex items-center justify-center px-4">
          <div className="max-w-[725px] w-full text-center space-y-6">
            <h1 className="text-5xl font-semibold">
              Discovering the Power of Gemini Models with Gemish
            </h1>
            <p className="text-lg text-muted-foreground text-balance">
              Powered by Google's latest AI, Gemish brings multimodal chat, deep
              reasoning, and real-time web search into one seamless experience.
              Whether you're brainstorming, learning, or just having a
              conversation, Gemish adapts to you
            </p>

            <Button asChild className="rounded-full">
              <Link href="/login">Get Started with Gemish</Link>
            </Button>
          </div>
        </div>
      </div>
      <div>
        <Card></Card>
      </div>
    </div>
  );
}
