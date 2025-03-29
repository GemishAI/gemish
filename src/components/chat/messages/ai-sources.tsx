"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import React, { useState } from "react";
import useSWR from "swr";

// Define types inside the same file
interface Source {
  sourceType: string;
  id: string;
  url: string;
}

interface Metadata {
  title?: string;
  description?: string;
  favicon?: string;
  finalUrl?: string;
}

interface EnrichedSource extends Source {
  metadata: Metadata | null;
  isLoading: boolean;
}

interface AISourcesListProps {
  sources: Source[];
}

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch metadata");
  }
  return res.json();
};

function useSourceMetadata(url: string) {
  const { data, error, isLoading } = useSWR(
    `/api/metadata?url=${encodeURIComponent(url)}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    metadata: data as Metadata,
    isError: error,
    isLoading,
  };
}
// Source detail component for the sheet view
const SourceDetail = ({
  source,
  index,
}: {
  source: EnrichedSource;
  index: number;
}) => {
  const { metadata, isLoading } = useSourceMetadata(source.url);

  return (
    <Link
      href={metadata?.finalUrl || source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start bg-secondary/50 border border-muted rounded-md p-3 hover:bg-muted transition-colors w-full"
    >
      <div className="flex flex-col gap-3 w-full">
        <h1 className="text-base font-medium text-foreground">
          {index + 1}.{" "}
          {isLoading ? (
            <Skeleton className="h-6 w-64 inline-block" />
          ) : (
            metadata?.title || metadata?.finalUrl
          )}
        </h1>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          metadata?.description && (
            <p className="text-sm text-foreground line-clamp-3">
              {truncate(metadata.description, 150)}
            </p>
          )
        )}

        <div className="flex gap-2">
          <div className="size-4 flex-shrink-0 bg-white rounded overflow-hidden shadow-sm mt-0.5">
            {isLoading ? (
              <Skeleton className="w-8 h-8" />
            ) : (
              <img
                src={metadata?.favicon}
                alt=""
                width={32}
                height={32}
                className="w-8 h-8"
              />
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            {isLoading ? (
              <Skeleton className="h-4 w-48" />
            ) : metadata?.finalUrl ? (
              new URL(metadata.finalUrl).hostname
            ) : null}
          </p>
        </div>
      </div>
    </Link>
  );
};

// Truncate helper function
const truncate = (text: string | undefined, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text || "";
  return `${text.substring(0, maxLength)}...`;
};

const FaviconItem = ({
  source,
  index,
}: {
  source: EnrichedSource;
  index: number;
}) => {
  const { metadata } = useSourceMetadata(source.url);

  return (
    <div
      key={source.id}
      className="w-6 h-6 rounded-sm bg-white shadow-sm border border-border overflow-hidden"
      style={{
        position: "relative",
        marginLeft: index === 0 ? "0" : "-8px",
        zIndex: 4 - index,
      }}
    >
      {metadata?.favicon && (
        <img
          src={metadata.favicon}
          alt=""
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
};

export const AISourcesList: React.FC<AISourcesListProps> = ({ sources }) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Process sources to add domain and favicon
  const processedSources: EnrichedSource[] = sources.map((source) => {
    return {
      ...source,
      metadata: null,
      isLoading: true,
    };
  });

  return (
    <div className="flex flex-col gap-3 w-full">
      <div
        className="flex items-center cursor-pointer bg-secondary/50 border border-muted rounded-full w-fit px-3 py-2 hover:bg-muted transition-colors"
        onClick={() => setIsSheetOpen(true)}
      >
        <div className="flex items-center relative">
          {processedSources.slice(0, 4).map((source, index) => (
            <FaviconItem key={source.id} source={source} index={index} />
          ))}
        </div>
        <span className="ml-2 text-sm text-muted-foreground">
          {processedSources.length} web pages
        </span>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-[700px] sm:w-[740px]">
          <SheetHeader className="sticky inset-x-0 top-0 bg-background">
            <SheetTitle className="text-xl">
              Sources ({processedSources.length})
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-3 px-2 mt-[12px] overflow-y-auto">
            {processedSources.map((source, index) => (
              <SourceDetail
                key={`source-detail-${source.id}`}
                source={source}
                index={index}
              />
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
