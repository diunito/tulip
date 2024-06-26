import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface TulipSettingsState {
  compressedLayout: boolean;
}

// Funzione per caricare lo stato iniziale dal localStorage
const loadStateFromLocalStorage = (): TulipSettingsState => {
  try {
    const serializedState = localStorage.getItem('tulipSettings');
    if (serializedState === null) {
      return { compressedLayout: false };
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error("Could not load state from localStorage", err);
    return { compressedLayout: false };
  }
};

const initialState: TulipSettingsState = loadStateFromLocalStorage();

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    updateCompressedLayout: (state, action: PayloadAction<boolean>) => {
      state.compressedLayout = action.payload;
      // Salva lo stato aggiornato nel localStorage
      localStorage.setItem('tulipSettings', JSON.stringify(state));
    },
  },
});

export const { updateCompressedLayout } = settingsSlice.actions;

export default settingsSlice.reducer;
