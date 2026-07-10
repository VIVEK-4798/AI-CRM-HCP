import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { InteractionResponse } from '../../types';

interface InteractionState {
  interactions: InteractionResponse[];
  loading: boolean;
  error: string | null;
}

const initialState: InteractionState = {
  interactions: [],
  loading: false,
  error: null,
};

export const interactionSlice = createSlice({
  name: 'interaction',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setInteractions: (state, action: PayloadAction<InteractionResponse[]>) => {
      state.interactions = action.payload;
      state.loading = false;
      state.error = null;
    },
    addInteraction: (state, action: PayloadAction<InteractionResponse>) => {
      state.interactions = [action.payload, ...state.interactions];
      state.loading = false;
      state.error = null;
    },
    updateInteractionState: (state, action: PayloadAction<InteractionResponse>) => {
      state.interactions = state.interactions.map(i => (i.id === action.payload.id ? action.payload : i));
      state.loading = false;
      state.error = null;
    },
    removeInteractionState: (state, action: PayloadAction<number>) => {
      state.interactions = state.interactions.filter(i => i.id !== action.payload);
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setLoading, setError, setInteractions, addInteraction, updateInteractionState, removeInteractionState } = interactionSlice.actions;
export default interactionSlice.reducer;
