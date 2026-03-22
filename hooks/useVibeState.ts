'use client';

import { useReducer, createContext, useContext, ReactNode, createElement } from 'react';
import type { VibeState, VibeAction, AnalyzeResponse } from '@/types/vibecheck';

const initialState: VibeState = {
  status: 'idle',
  inputText: '',
  result: null,
  error: null,
  sidebarOpen: false,
};

function vibeReducer(state: VibeState, action: VibeAction): VibeState {
  switch (action.type) {
    case 'SET_INPUT':
      return { ...state, inputText: action.text };
    case 'SUBMIT':
      return { ...state, status: 'loading', error: null };
    case 'SET_RESULT':
      return { ...state, status: 'result', result: action.result, sidebarOpen: true };
    case 'SET_ERROR':
      return { ...state, status: 'error', error: action.error };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

interface VibeContextType {
  state: VibeState;
  dispatch: React.Dispatch<VibeAction>;
}

const VibeContext = createContext<VibeContextType | null>(null);

export function VibeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(vibeReducer, initialState);
  return createElement(VibeContext.Provider, { value: { state, dispatch } }, children);
}

export function useVibeContext(): VibeContextType {
  const ctx = useContext(VibeContext);
  if (!ctx) throw new Error('useVibeContext must be used within VibeProvider');
  return ctx;
}

export { initialState };
