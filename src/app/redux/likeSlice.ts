import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface LikeState {
    liked: Record<string, Boolean>
}

const initialState: LikeState = {
    liked: {}
}


const likeSlice = createSlice({
    name: "like",
    initialState,
    reducers: {
        toggleLike: (state, action: PayloadAction<string>) => {
            const postId = action.payload
            state.liked[postId] = !state.liked[postId]
        }
    }
})

export const {toggleLike} = likeSlice.actions
export default likeSlice.reducer