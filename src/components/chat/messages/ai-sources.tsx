"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";
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

// Source item component for the list view
const SourceItem = ({
  source,
  index,
}: {
  source: EnrichedSource;
  index: number;
}) => {
  const { metadata, isLoading } = useSourceMetadata(source.url);

  // Title fallback logic
  const title = metadata?.title || metadata?.finalUrl;

  return (
    <Link
      href={metadata?.finalUrl!}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center bg-secondary border border-muted rounded-md px-3 py-2 hover:bg-muted transition-colors min-w-60 max-w-60"
    >
      <div className="flex items-center w-full">
        <span className="font-mono text-xs text-muted-foreground mr-2 w-4 h-4 flex items-center justify-center rounded-full bg-muted flex-shrink-0">
          {index + 1}
        </span>
        <div className="w-5 h-5 mr-2 flex-shrink-0 bg-white rounded-sm overflow-hidden shadow-sm">
          <img
            src={metadata?.favicon}
            alt=""
            width={20}
            height={20}
            className="w-5 h-5"
          />
        </div>
        <div className="flex flex-col overflow-hidden">
          <div className="text-sm font-medium text-foreground truncate">
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              truncate(title, 40)
            )}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {metadata?.finalUrl}
          </div>
        </div>
      </div>
    </Link>
  );
};

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
      href={metadata?.finalUrl!}
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
            {isLoading ? <Skeleton className="h-4 w-48" /> : metadata?.finalUrl}
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

  const visibleSourceCount =
    processedSources.length <= 3 ? processedSources.length : 2;

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center justify-between w-full">
        <h1 className="text-sm font-medium text-muted-foreground">Sources</h1>
        {processedSources.length > 0 && (
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-xs font-medium bg-secondary text-foreground hover:bg-muted flex items-center gap-1 h-7 px-3 border border-muted rounded-md ml-4"
              >
                Show all ({processedSources.length})
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[700px] sm:w-[740px]">
              <SheetHeader>
                <SheetTitle className="text-xl">
                  Sources ({processedSources.length})
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-3 px-2 overflow-y-auto max-h-[calc(100vh-120px)]">
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
        )}
      </div>
      <ScrollArea className="w-full overflow-x-auto">
        <div className="flex gap-2 pb-2">
          {processedSources
            .slice(0, visibleSourceCount)
            .map((source, index) => (
              <SourceItem
                key={`source-${source.id}`}
                source={source}
                index={index}
              />
            ))}
          {processedSources.length > 3 && visibleSourceCount === 2 && (
            <div className="min-w-60 max-w-60 flex items-center justify-center">
              <Button
                variant="outline"
                size="sm"
                className="text-xs font-medium bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-1 h-full w-full border border-dashed border-muted rounded-md"
                onClick={() => setIsSheetOpen(true)}
              >
                +{processedSources.length - 2} more sources
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
