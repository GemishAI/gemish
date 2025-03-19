import React, { useState, useEffect, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

// Define types inside the same file
interface Source {
  sourceType: string;
  id: string;
  url: string;
  title?: string;
}

interface EnrichedSource extends Source {
  favicon?: string;
  isHovered: boolean;
}

interface AISourcesListProps {
  sources: Source[];
}

export const AISourcesList: React.FC<AISourcesListProps> = ({ sources }) => {
  const [sourcesWithMetadata, setSourcesWithMetadata] = useState<
    EnrichedSource[]
  >([]);

  // Fetch metadata for sources
  useEffect(() => {
    const fetchMetadata = async (): Promise<void> => {
      try {
        const enrichedSources = await Promise.all(
          sources.map(async (source) => {
            const domain = new URL(source.url).hostname;
            return {
              ...source,
              favicon: `https://www.google.com/s2/favicons?domain=${domain}`,
              isHovered: false,
            };
          })
        );

        setSourcesWithMetadata(enrichedSources);
      } catch (error) {
        console.error("Error fetching metadata:", error);
      }
    };

    if (sources && sources.length > 0) {
      fetchMetadata();
    }
  }, [sources]);

  // Handle hover state
  const handleMouseEnter = useCallback((id: string) => {
    setSourcesWithMetadata((prev) =>
      prev.map((source) =>
        source.id === id ? { ...source, isHovered: true } : source
      )
    );
  }, []);

  const handleMouseLeave = useCallback((id: string) => {
    setSourcesWithMetadata((prev) =>
      prev.map((source) =>
        source.id === id ? { ...source, isHovered: false } : source
      )
    );
  }, []);

  // Text truncation function
  const truncateText = useCallback(
    (text: string, maxLength: number = 40): string => {
      if (!text || text.length <= maxLength) return text || "";
      return `${text.substring(0, maxLength)}...`;
    },
    []
  );

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-sm font-medium text-muted-foreground">Sources</h1>
      <ScrollArea className="w-full overflow-x-auto">
        <div className="flex flex-col gap-2">
          <div className="flex overflow-x-auto">
            {sourcesWithMetadata.map((source, index) => (
              <Link
                key={`source-${source.id}`}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center bg-secondary border border-muted rounded-md px-3 py-2 hover:bg-muted transition-colors mr-2 min-w-60 max-w-60"
                onMouseEnter={() => handleMouseEnter(source.id)}
                onMouseLeave={() => handleMouseLeave(source.id)}
              >
                <div className="flex items-center w-full">
                  {source.isHovered ?
                    <ExternalLink className="w-4 h-4 text-muted-foreground mr-2" />
                  : <span className="font-mono text-muted-foreground mr-2">
                      {index + 1}
                    </span>
                  }
                  {source.favicon && (
                    <img
                      src={source.favicon}
                      alt=""
                      className="w-5 h-5 mr-2 flex-shrink-0"
                    />
                  )}
                  <div className="flex flex-col overflow-hidden">
                    <div className="text-sm font-medium text-foreground truncate">
                      {source.title ?
                        truncateText(source.title)
                      : new URL(source.url).hostname}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
