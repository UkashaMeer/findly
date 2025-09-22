// redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import searchReducer from "./searchSlice";
import commentReducer from "./commentsSlice";
import commentReplyReducer from "./replyCommentSlice";
import likeReducer from "./likeSlice";
import commentLikeReducer from "./commentLikeSlice";

export const store = configureStore({
  reducer: {
    search: searchReducer,
    comment: commentReducer,
    replyComment: commentReplyReducer,
    like: likeReducer,
    commentLike: commentLikeReducer,

  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
