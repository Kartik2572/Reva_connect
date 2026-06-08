import { useState } from "react";
import { togglePostLike } from "../services/api";

const PostCard = ({ post }) => {
  const [likesCount, setLikesCount] = useState(parseInt(post.likes) || 0);
  const [isLikedByMe, setIsLikedByMe] = useState(post.isLikedByMe || false);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;
    const previousIsLiked = isLikedByMe;
    const previousCount = likesCount;

    try {
      setIsLiking(true);
      // Optimistic update
      setIsLikedByMe(!previousIsLiked);
      setLikesCount((prev) => previousIsLiked ? Math.max(0, prev - 1) : prev + 1);

      const response = await togglePostLike(post.id);
      if (!response.data?.success) {
        // Revert on failure
        setIsLikedByMe(previousIsLiked);
        setLikesCount(previousCount);
      } else {
        // Sync with server state
        setIsLikedByMe(response.data.isLikedByMe);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      // Revert on failure
      setIsLikedByMe(previousIsLiked);
      setLikesCount(previousCount);
    } finally {
      setIsLiking(false);
    }
  };

  const timeAgo = (dateString) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  return (
    <div className="card bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-sm mb-4">
      {/* Header */}
      <div className="flex items-start gap-3 p-4">
        {/* Avatar */}
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-orange-100 dark:from-blue-900 dark:to-orange-900 flex items-center justify-center text-lg font-bold text-gray-700 dark:text-gray-300">
          {post.author ? post.author.charAt(0).toUpperCase() : "U"}
        </div>
        
        {/* Author Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {post.author}
            </h3>
            {/* Options button (dummy) */}
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg>
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {post.category ? `${post.category} • ` : ""}Reva Connect Member
          </p>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            <span>{timeAgo(post.createdAt)}</span>
            <span className="mx-1">•</span>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"></path></svg>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-2">
        {post.title && <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-1">{post.title}</h4>}
        {post.description && (
          <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
            {post.description}
          </p>
        )}
        
        {post.linkUrl && (
          <div className="mt-3 bg-gray-50 dark:bg-slate-800 rounded-md border border-gray-200 dark:border-slate-700 overflow-hidden">
             <a href={post.linkUrl} target="_blank" rel="noopener noreferrer" className="block p-3 hover:bg-gray-100 dark:hover:bg-slate-750 transition-colors">
               <div className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                 View Link
               </div>
               <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{post.linkUrl}</p>
             </a>
          </div>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {post.tags.map((tag, idx) => (
              <span key={idx} className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="px-4 py-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-1">
          {likesCount > 0 ? (
            <>
              <div className="flex items-center justify-center w-4 h-4 rounded-full bg-blue-500 text-white">
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path></svg>
              </div>
              <span>{likesCount}</span>
            </>
          ) : (
            <span>0 Likes</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="px-2 py-1 flex items-center justify-between">
        <button
          type="button"
          onClick={handleLike}
          disabled={isLiking}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-colors text-sm font-medium ${
            isLikedByMe
              ? "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
              : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800"
          }`}
        >
          <svg 
            className={`w-5 h-5 ${isLikedByMe ? 'scale-110' : ''}`} 
            fill={isLikedByMe ? "currentColor" : "none"} 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path>
          </svg>
          <span>Like</span>
        </button>
        
        <button type="button" className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-colors text-sm font-medium text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
          <span>Comment</span>
        </button>

        <button type="button" className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-colors text-sm font-medium text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
          <span>Share</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;

