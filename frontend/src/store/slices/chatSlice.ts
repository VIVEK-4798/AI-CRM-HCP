import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface ChatMessage {
  id: number;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
}

export interface InteractionPreview {
  hcp_id: number;
  doctor_name: string;
  interaction_type: string;
  products_discussed: string;
  summary: string;
  follow_up_date: string | null;
  status: string;
  confidence?: number;
}

interface ChatState {
  messages: ChatMessage[];
  preview: InteractionPreview | null;
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  messages: [
    { 
      id: 1, 
      sender: 'assistant', 
      text: "Hello! I am your AI assistant. You can type or dictate interaction notes from your last medical representative visit, and I will extract the structured details for you.", 
      time: "11:20 AM" 
    }
  ],
  preview: null,
  loading: false,
  error: null,
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages = [...state.messages, action.payload];
    },
    setPreview: (state, action: PayloadAction<InteractionPreview | null>) => {
      state.preview = action.payload;
      state.loading = false;
      state.error = null;
    },
    updatePreviewField: (state, action: PayloadAction<Partial<InteractionPreview>>) => {
      if (state.preview) {
        state.preview = {
          ...state.preview,
          ...action.payload,
        };
      }
    },
    clearPreview: (state) => {
      state.preview = null;
    },
    resetChat: (state) => {
      state.messages = [
        { 
          id: 1, 
          sender: 'assistant', 
          text: "Hello! I am your AI assistant. You can type or dictate interaction notes from your last medical representative visit, and I will extract the structured details for you.", 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      state.preview = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { 
  setLoading, 
  setError, 
  addMessage, 
  setPreview, 
  updatePreviewField, 
  clearPreview, 
  resetChat 
} = chatSlice.actions;

export default chatSlice.reducer;
