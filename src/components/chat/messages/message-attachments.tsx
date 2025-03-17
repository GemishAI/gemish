import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, Maximize2, FileTextIcon, ExternalLinkIcon } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Set the worker source for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

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
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  if (!attachments || attachments.length === 0) return null;

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    setPageNumber(1);
  }

  function changePage(offset: number) {
    setPageNumber((prevPageNumber) =>
      Math.max(1, Math.min(numPages || 1, prevPageNumber + offset))
    );
  }

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
                    <div className="flex  items-center w-fit h-fit p-2 gap-2">
                      <FileTextIcon className="size-6 text-primary/70 " />
                      <div className="flex flex-col items-start">
                        <p
                          className="text-xs w-24 truncate "
                          title={attachment.name}
                        >
                          {attachmentName.length > 10
                            ? `${attachmentName.slice(0, 8)}...`
                            : attachment.name}
                        </p>
                        <p className="text-xs  text-muted-foreground">PDF</p>
                      </div>
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
                        width={500}
                        height={500}
                        className="w-full h-full "
                      />
                    </div>
                  ) : isPDF ? (
                    <div className="w-full h-[70vh] flex flex-col">
                      <Document
                        file={attachment.url}
                        onLoadSuccess={onDocumentLoadSuccess}
                        className="flex-1 overflow-auto"
                      >
                        <Page
                          pageNumber={pageNumber}
                          width={Math.min(window.innerWidth * 0.7, 800)}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                        />
                      </Document>

                      {numPages && numPages > 1 && (
                        <div className="flex justify-between items-center mt-4">
                          <Button
                            onClick={() => changePage(-1)}
                            disabled={pageNumber <= 1}
                            variant="outline"
                            size="sm"
                          >
                            Previous
                          </Button>
                          <p className="text-sm">
                            Page {pageNumber} of {numPages}
                          </p>
                          <Button
                            onClick={() => changePage(1)}
                            disabled={pageNumber >= (numPages || 1)}
                            variant="outline"
                            size="sm"
                          >
                            Next
                          </Button>
                        </div>
                      )}
                    </div>
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
