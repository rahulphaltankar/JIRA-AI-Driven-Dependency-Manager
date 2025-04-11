import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { DependencyComment } from "@shared/schema";

interface CommentThreadProps {
  comments: DependencyComment[];
  dependencyId: number;
  onAddComment: (content: string) => void;
}

export default function CommentThread({ comments, dependencyId, onAddComment }: CommentThreadProps) {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onAddComment(newComment);
      setNewComment("");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get user initials for avatar fallback
  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0]?.toUpperCase() || "")
      .slice(0, 2)
      .join("");
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Discussion Thread</h3>
      
      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex space-x-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <Avatar className="h-10 w-10">
                <AvatarImage src="" alt={comment.userName || "User"} />
                <AvatarFallback>{getUserInitials(comment.userName || "User")}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">{comment.userName || "User"}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {comment.createdAt ? format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a') : 'Unknown date'}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                      <i className="material-icons text-base">edit</i>
                    </button>
                    <button className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400">
                      <i className="material-icons text-base">delete</i>
                    </button>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm">{comment.content}</p>
                </div>
                <div className="mt-2 flex space-x-4">
                  <button className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center">
                    <i className="material-icons text-sm mr-1">thumb_up</i>
                    <span>Like</span>
                  </button>
                  <button className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center">
                    <i className="material-icons text-sm mr-1">reply</i>
                    <span>Reply</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <i className="material-icons text-4xl text-gray-300 dark:text-gray-600 mb-2">comment</i>
          <p className="text-gray-500 dark:text-gray-400">No comments yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">Be the first to start the discussion</p>
        </div>
      )}
      
      <div className="mt-6">
        <div className="flex space-x-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src="" alt="Current User" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea 
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px] mb-2"
            />
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-500">
                <button className="hover:text-gray-700 dark:hover:text-gray-300 flex items-center">
                  <i className="material-icons text-base mr-1">attach_file</i>
                  <span>Attach files</span>
                </button>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setNewComment("")}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !newComment.trim()}
                >
                  {isSubmitting ? (
                    <>
                      <i className="material-icons animate-spin mr-2">refresh</i>
                      Submitting...
                    </>
                  ) : "Add Comment"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t pt-3 mt-6">
        <div className="flex justify-between text-xs text-gray-500">
          <button className="hover:text-gray-700 dark:hover:text-gray-300 flex items-center">
            <i className="material-icons text-sm mr-1">notifications</i>
            <span>Subscribe to notifications</span>
          </button>
          <button className="hover:text-gray-700 dark:hover:text-gray-300 flex items-center">
            <i className="material-icons text-sm mr-1">share</i>
            <span>Share thread</span>
          </button>
        </div>
      </div>
    </div>
  );
}