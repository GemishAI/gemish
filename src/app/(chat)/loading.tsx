"use client";

import { LoaderSpinner } from "@/components/loader-spinner";

export default function ChatLoading() {
  return (
    <div className="flex justify-center items-center w-full h-full">
      <LoaderSpinner />
    </div>
  );
}
