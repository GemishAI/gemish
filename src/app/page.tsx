import { ChatUI } from "@/components/chat/chat-ui";
import { Suspense } from "react";
import { LoaderSpinner } from "@/components/loader-spinner";
import { generateId } from "ai";

export default async function Home() {
  const id = generateId();
  return (
    <div className="flex items-center justify-center h-screen max-w-3xl mx-auto w-full">
      <Suspense
        fallback={
          <div className="flex flex-col gap-3 items-center">
            <LoaderSpinner />
            Loading...
          </div>
        }
      >
        <ChatUI id={id} initialMessages={[]} />
      </Suspense>
    </div>
  );
}
