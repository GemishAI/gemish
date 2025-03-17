import React, { useState } from "react";
import Image from "next/image";
import { X, Maximize2, FileTextIcon, ExternalLinkIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Attachment {
  name?: string;
  contentType?: string;
  url: string;
}

interface MessageAttachmentsProps {
  attachments: Attachment[];
  messageId: string;
}

export function MessageAttachments({
  attachments,
  messageId,
}: MessageAttachmentsProps) {
  const [activeAttachment, setActiveAttachment] = useState<Attachment | null>(
    null
  );

  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-2 max-w-md">
      {attachments
        .filter(
          (attachment) =>
            attachment?.contentType?.startsWith("image/") ||
            attachment?.contentType?.startsWith("application/pdf")
        )
        .map((attachment, index) => {
          const isImage = attachment.contentType?.startsWith("image/");
          const isPDF = attachment.contentType?.startsWith("application/pdf");
          const attachmentName = attachment.name || "Untitled"; // Fallback name

          return (
            <Dialog key={`${messageId}-${index}`}>
              <DialogTrigger asChild>
                <div
                  className="relative group cursor-pointer border rounded-md overflow-hidden bg-muted/30 hover:bg-muted/50 transition-colors"
                  onClick={() => setActiveAttachment(attachment)}
                >
                  {isImage ? (
                    <div className="relative w-24 h-24">
                      <Image
                        src={attachment.url}
                        alt={attachment.name!}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Maximize2 className="text-white h-5 w-5" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center w-24 h-24 p-2">
                      <FileTextIcon className="h-8 w-8 text-primary/70 mb-1" />
                      <p
                        className="text-xs text-center truncate w-full"
                        title={attachment.name}
                      >
                        {attachmentName.length > 10
                          ? `${attachmentName.slice(0, 8)}...`
                          : attachment.name}
                      </p>
                    </div>
                  )}
                </div>
              </DialogTrigger>

              <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle className="truncate">
                    {attachment.name}
                  </DialogTitle>
                </DialogHeader>

                <div className="flex justify-center">
                  {isImage ? (
                    <div className="relative w-full max-h-[70vh] flex items-center justify-center">
                      <Image
                        src={attachment.url}
                        alt={attachmentName}
                        fill
                        className="max-w-full max-h-[70vh] object-contain"
                      />
                    </div>
                  ) : isPDF ? (
                    <iframe
                      src={attachment.url}
                      className="w-full h-[70vh]"
                      title={attachment.name}
                    />
                  ) : null}
                </div>

                <div className="flex justify-end gap-2 mt-2">
                  <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                  </DialogClose>
                  <Button
                    variant="default"
                    onClick={() => window.open(attachment.url, "_blank")}
                  >
                    Open <ExternalLinkIcon className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          );
        })}
    </div>
  );
}
