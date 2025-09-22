import { useMutation, useQuery } from "convex/react"
import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { api } from "../../../../../convex/_generated/api"
import { RootState } from "@/app/redux/store"
import { toggleCommentLike } from "@/app/redux/commentLikeSlice"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { timeAgo } from "@/lib/timeAgo"
import { ChevronUp, Reply, ThumbsUp } from "lucide-react"
import { toggleShowReplyComments } from "@/app/redux/replyCommentSlice"
import ReplyComment from "./ReplyComment"
import { Comment } from "@/lib/types"

interface CommentsRecursiveProps {
    parentId?: any
    postId?: any
    depth: number
    maxDepth: number
}

export default function CommentsRecursive(
    {
        parentId,
        postId,
        depth = 0,
        maxDepth = 0
    }: CommentsRecursiveProps) {

    const dispatch = useDispatch()
    const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set())

    const comments = useQuery(api.comments.getCommentsByParent, {
        postId,
        parentId: parentId ?? undefined,
        topLevel: parentId ? false : true,
    })

    console.log(comments)
    const addCommentLike = useMutation(api.comments.likeComment);
    const replyCommentState = useSelector((state: RootState) => state.replyComment.openReplyComments);

    const handleCommentLike = async (commentId: any) => {
        try {
            await addCommentLike({ commentId });
            dispatch(toggleCommentLike(commentId));
        } catch (err) {
            console.error(err);
        }
    };

    const toggleReplies = (commentId: string) => {
        setExpandedReplies(prev => {
            const newSet = new Set(prev);
            if (newSet.has(commentId)) {
                newSet.delete(commentId);
            } else {
                newSet.add(commentId);
            }
            return newSet;
        });
    };

    if (!comments) return null;

    return (
        <div className={`space-y-4 ${depth! > 0 ? 'ml-6' : ''}`}>
            {comments.map((comment: Comment, i: number) => (
                <div key={i} className="comment-item">
                    <div className="flex items-start gap-3">
                        <Avatar className="flex-shrink-0">
                            <AvatarImage src={comment?.user?.image!} />
                            <AvatarFallback>
                                {comment?.user?.name?.split(' ').map((n: any) => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                            <div className="rounded-md p-2 border border-foreground/15">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="font-semibold text-sm">
                                        {comment?.user?.name}
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {timeAgo(comment._creationTime)}
                                    </span>
                                </div>
                                <div className="text-sm leading-relaxed mt-1 whitespace-pre-wrap">
                                    {comment.content}
                                </div>
                            </div>

                            {/* Comment Actions */}
                            <div className="flex items-center gap-4 mt-2 text-xs font-medium">
                                <button
                                    onClick={() => handleCommentLike(comment._id)}
                                    className="flex items-center gap-1 hover:text-primary transition-colors"
                                >
                                    <ThumbsUp
                                        size={14}
                                        className={comment.likedByUser ? "text-primary" : ""}
                                        fill={comment.likedByUser ? "currentColor" : "none"}
                                    />
                                    <span>{comment.likeCount || 0}</span>
                                </button>

                                <button
                                    onClick={() => dispatch(toggleShowReplyComments(comment._id))}
                                    className="flex items-center gap-1 hover:text-primary transition-colors"
                                >
                                    <Reply size={14} />
                                    <span>Reply</span>
                                </button>

                                {comment.replyCount > 0 && (
                                    <button
                                        onClick={() => toggleReplies(comment._id)}
                                        className="text-xs text-muted-foreground hover:text-foreground"
                                    >
                                        {expandedReplies.has(comment._id) ?
                                            `Hide ${comment.replyCount} replies` :
                                            `View ${comment.replyCount} replies`
                                        }
                                    </button>
                                )}
                            </div>

                            {replyCommentState[comment._id] && (
                                <div className="mt-3">
                                    <ReplyComment
                                        userImage={comment?.currentUser?.image!}
                                        parentId={comment._id}
                                        postId={postId}
                                        onSuccess={() => dispatch(toggleShowReplyComments(comment._id))}
                                    />
                                </div>
                            )}

                            {expandedReplies.has(comment._id) && (
                                <div className="mt-3 relative pl-0">
                                    <div className="absolute left-0 top-0 h-full">
                                        <div className="h-12 w-[1px] bg-foreground/50 ml-[6px]" />
                                        <div className="w-3 ml-1.5 h-[1px] bg-foreground/50" /> 
                                    </div>
                                    <CommentsRecursive
                                        parentId={comment._id}
                                        postId={postId}
                                        depth={depth! + 1}
                                        maxDepth={maxDepth}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
