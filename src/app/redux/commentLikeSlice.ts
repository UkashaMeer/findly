import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface CommentLikeState {
    liked: Record<string, Boolean>
}

const initialState: CommentLikeState = {
    liked: {}
}


const commentLikeSlice = createSlice({
    name: "commmentLike",
    initialState,
    reducers: {
        toggleCommentLike: (state, action: PayloadAction<string>) => {
            const commentId = action.payload
            state.liked[commentId] = !state.liked[commentId]
        }
    }
})

export const {toggleCommentLike} = commentLikeSlice.actions
export default commentLikeSlice.reducer