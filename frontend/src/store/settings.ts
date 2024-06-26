import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface TulipSettingsState {
  compressedLayout: boolean;
  hideCurrent: boolean;
  hideDiff: boolean;
}

// Funzione per caricare lo stato iniziale dal localStorage
const loadStateFromLocalStorage = (): TulipSettingsState => {
  try {
    const serializedState = localStorage.getItem("tulipSettings");
    if (serializedState === null) {
      return { compressedLayout: false, hideCurrent: false, hideDiff: false };
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error("Could not load state from localStorage", err);
    return { compressedLayout: false, hideCurrent: false, hideDiff: false };
  }
};

const initialState: TulipSettingsState = loadStateFromLocalStorage();

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    // TODO we can generalize this
    updateCompressedLayout: (state, action: PayloadAction<boolean>) => {
      state.compressedLayout = action.payload;
      localStorage.setItem("tulipSettings", JSON.stringify(state));
    },
    updateHideCurrent: (state, action: PayloadAction<boolean>) => {
      state.hideCurrent = action.payload;
      localStorage.setItem("tulipSettings", JSON.stringify(state));
    },
    updateHideDiff: (state, action: PayloadAction<boolean>) => {
      state.hideDiff = action.payload;
      localStorage.setItem("tulipSettings", JSON.stringify(state));
    },
  },
});

export const { updateCompressedLayout, updateHideDiff, updateHideCurrent } = settingsSlice.actions;

export default settingsSlice.reducer;
