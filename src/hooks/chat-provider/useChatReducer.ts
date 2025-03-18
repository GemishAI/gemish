import { useReducer } from "react";
import { ChatState } from "./types";
import { type Message } from "ai";

// Chat state reducer
export type ChatAction = 
  | { type: 'SET_ACTIVE_CHAT'; payload: string | null }
  | { type: 'ADD_CHAT'; payload: { chatId: string; messages: Message[] } }
  | { type: 'UPDATE_MESSAGES'; payload: { chatId: string; messages: Message[] } }
  | { type: 'ADD_PENDING_MESSAGE'; payload: { chatId: string; message: Message } }
  | { type: 'CLEAR_PENDING_MESSAGE'; payload: string }
  | { type: 'DELETE_CHAT'; payload: string };

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_ACTIVE_CHAT':
      return {
        ...state,
        activeChat: action.payload,
      };
      
    case 'ADD_CHAT':
      return {
        ...state,
        chats: {
          ...state.chats,
          [action.payload.chatId]: action.payload.messages,
        },
      };
      
    case 'UPDATE_MESSAGES':
      return {
        ...state,
        chats: {
          ...state.chats,
          [action.payload.chatId]: action.payload.messages,
        },
      };
      
    case 'ADD_PENDING_MESSAGE':
      return {
        ...state,
        pendingMessages: {
          ...state.pendingMessages,
          [action.payload.chatId]: action.payload.message,
        },
      };
      
    case 'CLEAR_PENDING_MESSAGE': {
      const { [action.payload]: _, ...restPendingMessages } = state.pendingMessages;
      return {
        ...state,
        pendingMessages: restPendingMessages,
      };
    }
    
    case 'DELETE_CHAT': {
      const { [action.payload]: _, ...restChats } = state.chats;
      return {
        ...state,
        chats: restChats,
      };
    }
    
    default:
      return state;
  }
}

const initialChatState: ChatState = {
  chats: {},
  activeChat: null,
  pendingMessages: {},
};

/**
 * Hook for managing chat state in the chat provider
 */
export function useChatReducer() {
  return useReducer(chatReducer, initialChatState);
}
