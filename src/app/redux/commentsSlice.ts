import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface commentState {
    openComments: Record<string, boolean>
}

const initialState: commentState = {
    openComments: {},
}

const commentSlice = createSlice({
    name: "comment",
    initialState,
    reducers: {
        toggleShowComments: (state, action: PayloadAction<string>) => {
            const postId = action.payload
            state.openComments[postId] = !state.openComments[postId]
        },
        closeAllComments: (state) => {
            state.openComments = {}
        }
    }
})

export const {toggleShowComments, closeAllComments} = commentSlice.actions
export default commentSlice.reducer