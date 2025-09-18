// redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import searchReducer from "./searchSlice";
import commentReducer from "./commentsSlice";

export const store = configureStore({
  reducer: {
    search: searchReducer,
    comment: commentReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
