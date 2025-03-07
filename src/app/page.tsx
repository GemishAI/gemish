import { ChatUI } from "@/components/chat/chat-ui";

export default function Home() {

  return (
    <div className="flex items-center justify-center h-screen max-w-3xl mx-auto w-full">
      <ChatUI initialMessages={[]} />
    </div>
  );
}
