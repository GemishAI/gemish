"use client";

import React, {
  useState,
  useCallback,
  FormEvent,
  ChangeEvent,
  JSX,
} from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import {
  MessageCircleQuestion,
  Frown,
  Meh,
  Smile,
  Heart,
  LucideIcon,
} from "lucide-react";

// Define types for our component
type ReactionType = "disappointed" | "neutral" | "satisfied" | "loved" | null;

interface ReactionOption {
  icon: LucideIcon;
  label: string;
  value: Exclude<ReactionType, null>;
}

interface FeedbackData {
  reaction: ReactionType;
  feedback: string;
}

export function Feedback(): JSX.Element {
  const [selectedReaction, setSelectedReaction] = useState<ReactionType>(null);
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const reactions: ReactionOption[] = [
    { icon: Frown, label: "Disappointed", value: "disappointed" },
    { icon: Meh, label: "Neutral", value: "neutral" },
    { icon: Smile, label: "Satisfied", value: "satisfied" },
    { icon: Heart, label: "Loved it", value: "loved" },
  ];

  const handleReactionClick = useCallback(
    (value: Exclude<ReactionType, null>): void => {
      setSelectedReaction(value);
    },
    []
  );

  const handleTextChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>): void => {
      setFeedbackText(e.target.value);
    },
    []
  );

  const handleSubmit = useCallback(
    (e?: FormEvent): void => {
      if (e) e.preventDefault();

      // Here you would handle the submission logic
      const feedbackData: FeedbackData = {
        reaction: selectedReaction,
        feedback: feedbackText,
      };

      console.log(feedbackData);

      // Reset the form
      setSelectedReaction(null);
      setFeedbackText("");
      setIsOpen(false);
    },
    [selectedReaction, feedbackText]
  );

  const handleCancel = useCallback((e?: React.MouseEvent): void => {
    if (e) e.preventDefault();
    setIsOpen(false);
  }, []);

  const handleOpenChange = useCallback((open: boolean): void => {
    setIsOpen(open);
    if (!open) {
      // Reset form when dialog closes
      setSelectedReaction(null);
      setFeedbackText("");
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <SidebarMenuItem onClick={() => setIsOpen(true)}>
          <SidebarMenuButton>
            <MessageCircleQuestion />
            Share Your Thoughts
          </SidebarMenuButton>
        </SidebarMenuItem>
      </DialogTrigger>
      <DialogContent className="">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>How was your experience?</DialogTitle>
            <DialogDescription>
              Your feedback helps us create a better product for everyone. Let
              us know what you think!
            </DialogDescription>
          </DialogHeader>

          <Textarea
            placeholder="Tell us what worked well or what we could improve..."
            className="min-h-24 my-4"
            value={feedbackText}
            onChange={handleTextChange}
          />

          <DialogFooter className="flex-col sm:flex-row sm:justify-between sm:space-x-2 border-t pt-4">
            <div className="flex space-x-4 items-center justify-center mb-4 sm:mb-0">
              {reactions.map(({ icon: Icon, label, value }) => (
                <Button
                  key={value}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={`flex flex-col items-center p-2 h-auto ${
                    selectedReaction === value
                      ? "bg-slate-100 dark:bg-slate-800"
                      : ""
                  }`}
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    handleReactionClick(value);
                  }}
                  title={label}
                >
                  <Icon
                    size={24}
                    className={
                      selectedReaction === value
                        ? "text-blue-500"
                        : "text-gray-500"
                    }
                  />
                </Button>
              ))}
            </div>

            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!selectedReaction && !feedbackText.trim()}
              >
                Submit Feedback
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
