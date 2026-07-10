import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { HCPResponse } from '../../types';

interface HCPState {
  hcps: HCPResponse[];
  loading: boolean;
  error: string | null;
}

const initialState: HCPState = {
  hcps: [],
  loading: false,
  error: null,
};

export const hcpSlice = createSlice({
  name: 'hcp',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setHcps: (state, action: PayloadAction<HCPResponse[]>) => {
      state.hcps = action.payload;
      state.loading = false;
      state.error = null;
    },
    addHcp: (state, action: PayloadAction<HCPResponse>) => {
      state.hcps = [action.payload, ...state.hcps];
      state.loading = false;
      state.error = null;
    },
    updateHcpState: (state, action: PayloadAction<HCPResponse>) => {
      state.hcps = state.hcps.map(h => (h.id === action.payload.id ? action.payload : h));
      state.loading = false;
      state.error = null;
    },
    removeHcpState: (state, action: PayloadAction<number>) => {
      state.hcps = state.hcps.filter(h => h.id !== action.payload);
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setLoading, setError, setHcps, addHcp, updateHcpState, removeHcpState } = hcpSlice.actions;
export default hcpSlice.reducer;
