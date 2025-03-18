import { LoaderSpinner } from "@/components/loader-spinner";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <LoaderSpinner />
    </div>
  );
}
