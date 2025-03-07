'use client'

import { StartChat } from "@/components/chat/start-chat";
import type { Message } from "ai";
import {useChat} from '@ai-sdk/react'
import {useQueryState} from 'nuqs'
import { useState, useRef } from 'react'
import {searchParams} from '@/config/search-params'

export function ChatUI({ initialMessages }: { initialMessages: Message[] }) {
    const [chat, setChat] = useQueryState('chat', searchParams.chat)
    const [files, setFiles] = useState<FileList | undefined>(undefined)
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {messages, input, handleSubmit, setInput, isLoading, stop} = useChat({
        id: chat,
        initialMessages, 
    })

  return (
    <div className="w-full">
        {messages.length === 0 && (
            <StartChat fileInputRef={fileInputRef} stop={stop} isLoading={isLoading} input={input} setInput={setInput} handleSubmit={handleSubmit} files={files} setFiles={setFiles} setChat={setChat} />
        )}
    </div>
  );
}



