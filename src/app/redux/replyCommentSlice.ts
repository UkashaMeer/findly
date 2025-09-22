import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface replyCommentState {
    openReplyComments: Record<string, boolean>
}

const initialState: replyCommentState = {
    openReplyComments: {},
}

const commentSlice = createSlice({
    name: "comment",
    initialState,
    reducers: {
        toggleShowReplyComments: (state, action: PayloadAction<string>) => {
            const commentId = action.payload
            state.openReplyComments[commentId] = !state.openReplyComments[commentId]
        },
        closeReplyAllComments: (state) => {
            state.openReplyComments = {}
        }
    }
})

export const {toggleShowReplyComments, closeReplyAllComments} = commentSlice.actions
export default commentSlice.reducer