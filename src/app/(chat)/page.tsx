import { ChatUI } from "@/components/chat/chat-ui";

export default async function Home() {
  return (
    <div className="flex items-center justify-center h-screen max-w-3xl mx-auto w-full">
      <ChatUI id={""} initialMessages={[]} />
    </div>
  );
}
