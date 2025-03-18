import { useReducer, useCallback } from "react";
import { ModelState } from "./types";

// Model state reducer
type ModelAction = 
  | { type: 'SET_MODEL'; payload: ModelState }
  | { type: 'TOGGLE_SEARCH' }
  | { type: 'TOGGLE_THINK' };

function modelReducer(state: ModelState, action: ModelAction): ModelState {
  switch (action.type) {
    case 'SET_MODEL':
      return action.payload;
    case 'TOGGLE_SEARCH':
      return state === 'search' ? 'normal' : 'search';
    case 'TOGGLE_THINK':
      return state === 'think' ? 'normal' : 'think';
    default:
      return state;
  }
}

interface UseModelReducerReturn {
  modelState: ModelState;
  setModel: (model: ModelState) => void;
  toggleSearch: () => void;
  toggleThink: () => void;
  isSearchActive: boolean;
  isThinkActive: boolean;
}

/**
 * Hook for managing the model state in the chat provider
 */
export function useModelReducer(initialState: ModelState = 'normal'): UseModelReducerReturn {
  const [modelState, dispatch] = useReducer(modelReducer, initialState);
  
  const setModel = useCallback((model: ModelState) => {
    dispatch({ type: 'SET_MODEL', payload: model });
  }, []);
  
  const toggleSearch = useCallback(() => {
    dispatch({ type: 'TOGGLE_SEARCH' });
  }, []);
  
  const toggleThink = useCallback(() => {
    dispatch({ type: 'TOGGLE_THINK' });
  }, []);
  
  // Derived state
  const isSearchActive = modelState === "search";
  const isThinkActive = modelState === "think";
  
  return {
    modelState,
    setModel,
    toggleSearch,
    toggleThink,
    isSearchActive,
    isThinkActive
  };
}
