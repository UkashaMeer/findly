import React, { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { toast } from 'sonner';
import CommentsRecursive from './CommentsRecursive';

const PostComments = ({ postId, userImage, userName }: { postId: any, userImage: string, userName: string }) => {

  console.log(userImage)

  const addComment = useMutation(api.comments.create)
  const comments = useQuery(api.comments.getSomeComments, {
    postId
  })
  console.log(comments)

  const [isFocused, setIsFocused] = useState(false);
  const [comment, setComment] = useState('');
  const textareaRef = useRef(null);
  const containerRef = useRef(null);

  const handleSubmit = async () => {
    if (comment.trim()) {
      try {
        await addComment({
          postId,
          content: comment,
          likes: [],
        });
        toast.success("Comment Added");
        setComment('');
        setIsFocused(false);
      } catch (error) {
        toast.error("Failed to add comment");
      }
    }
  };


  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = (e: any) => {
    if (!containerRef.current?.contains(e.relatedTarget)) {
      if (!comment.trim()) {
        setIsFocused(false);
      }
    }
  };

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleContainerClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFocused) {
      setIsFocused(true);
    }
  };

  useEffect(() => {
    if (isFocused && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isFocused]);

  return (
    <div className="w-full max-w-2xl mx-auto p-4 pt-0 bg-muted/20">
      <div className="flex items-start gap-4">
        <div className="relative">
          <Avatar>
            <AvatarImage src={userImage} />
            <AvatarFallback>
              {
                userName.split(' ')
                  .map(word => word[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
              }
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1">
          <div
            ref={containerRef}
            className={`relative border transition-all duration-300 ease-out overflow-hidden ${isFocused
              ? 'rounded-md ring-3 ring-primary/50 border-1 border-primary'
              : 'rounded-md'
              }`}
            onClick={handleContainerClick}
          >

            <div
              className={`transition-all duration-300 ease-out ${isFocused ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'
                }`}
            >
              <input
                type="text"
                placeholder="Add a comment..."
                className="w-full p-2 text-sm bg-transparent rounded-full focus:outline-none placeholder:text-opacity-70"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onFocus={handleFocus}
                tabIndex={isFocused ? -1 : 0}
              />
            </div>

            <div
              className={`transition-all duration-300 ease-out ${isFocused ? 'opacity-100 h-auto' : 'opacity-0 h-0 overflow-hidden'
                }`}
            >
              <div className="p-3 flex flex-col">
                <textarea
                  ref={textareaRef}
                  placeholder="Add a comment..."
                  className="w-full min-h-[80px] resize-none focus:outline-none bg-transparent placeholder:text-opacity-70"
                  style={{
                    color: 'hsl(var(--foreground))'
                  }}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  rows={3}
                />

                <Button
                  onClick={handleSubmit}
                  disabled={!comment.trim()}
                  className={`self-end cursor-pointer ${comment.trim()
                    ? 'shadow-sm hover:shadow-md'
                    : 'cursor-not-allowed opacity-50'
                    }`}
                >
                  Comment
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <CommentsRecursive postId={postId} depth={0} maxDepth={0}  />
      </div>


    </div>
  );
};

export default PostComments;