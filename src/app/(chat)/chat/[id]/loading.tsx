"use client";

import { LoaderSpinner } from "@/components/loader-spinner";

export default function ChatLoading() {
  return (
    <div className="flex flex-col items-center w-full mx-auto">
      <LoaderSpinner />
    </div>
  );
}
