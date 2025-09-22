import { toggleCommentLike } from "@/app/redux/commentLikeSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { timeAgo } from "@/lib/timeAgo";
import { Comment } from "@/lib/types";
import { useMutation } from "convex/react";
import { Reply, ThumbsUp } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { api } from "../../../../convex/_generated/api";
import ReplyComment from "./ReplyComment";
import { RootState } from "@/app/redux/store";
import { toggleShowReplyComments } from "@/app/redux/replyCommentSlice";
import PostCommentReplies from "./PostCommentReplies";

export default function SomeComments({ comments, postId }: { comments: any, postId: any }) {

    console.log(comments)
    const dispatch = useDispatch()
    const replyComment = useSelector((state: RootState) => state.replyComment.openReplyComments)

    const addCommentLike = useMutation(api.comments.likeComment)

    const handleCommentLike = async (commentId: any) => {
        try {
            await addCommentLike({
                commentId
            })
            dispatch(toggleCommentLike(commentId))
        } catch (err) {
            alert(err)
        }
    }

    return (
        <div>
            {
                comments?.map((comment: Comment, i: number) => (
                    <div key={i} className="mt-8 space-y-6">
                        <div className="flex items-start gap-3">
                            <Avatar>
                                <AvatarImage src={comment.user.image} />
                                <AvatarFallback>UK</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="rounded-md p-3 border-foreground/15 border-1">
                                    <div className="flex items-center justify-between">
                                        <div
                                            className="font-semibold text-sm"
                                            style={{ color: 'hsl(var(--foreground))' }}
                                        >
                                            {comment.user.name}
                                        </div>
                                        <span className="text-xs">{timeAgo(comment._creationTime)}</span>
                                    </div>
                                    <div
                                        className="text-sm leading-relaxed"
                                        style={{ color: 'hsl(var(--foreground))' }}
                                    >
                                        {comment.content}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-3 text-xs font-medium capitalize" style={{ color: 'hsl(var(--muted-foreground))' }}>
                                    <button
                                        className="flex items-center gap-2 cursor-pointer capitalize"
                                        onClick={() => handleCommentLike(comment._id)}
                                    >
                                        <span className={`${comment.likedByUser ? "text-primary" : "text-foreground"}`}>like</span>
                                        {
                                            comment.likes?.length > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <ThumbsUp size={13} className="" fill={comment.likedByUser ? "orange" : "white"} />
                                                    {comment.likeCount}
                                                </div>
                                            )
                                        }
                                    </button>
                                    <span className="w-[1px] min-h-4 bg-foreground/75 flex relative"></span>
                                    <button
                                        className="cursor-pointer"
                                        onClick={() => dispatch(toggleShowReplyComments(comment._id))}
                                    >
                                        Reply
                                    </button>
                                </div>
                                {
                                    replyComment[comment._id] && (
                                        <>
                                            <ReplyComment userImage={comment.user.image} parentId={comment._id} postId={postId} />
                                            <PostCommentReplies parentId={comment._id} postId={postId} />
                                        </>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                ))
            }
        </div>
    )
}
