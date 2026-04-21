const PostCard = ({ post }) => {
  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {post.author}
          </p>
          {post.category && (
            <p className="text-xs text-blue-600 bg-blue-50 w-fit px-2 py-0.5 rounded mt-1">
              {post.category}
            </p>
          )}
        </div>
        <p className="text-xs text-gray-400">
          {post.createdAt ? new Date(post.createdAt).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
          }) : "Just now"}
        </p>
      </div>
      
      {post.title && <h4 className="text-md font-semibold text-gray-900">{post.title}</h4>}
      {post.description && <p className="text-sm text-gray-700 whitespace-pre-wrap">{post.description}</p>}
      
      {post.linkUrl && (
        <a href={post.linkUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-orange-600 hover:underline">
          🔗 View Link
        </a>
      )}

      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {post.tags.map((tag, idx) => (
            <span key={idx} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
        <button
          type="button"
          className="inline-flex items-center gap-1 text-[#F37021] hover:text-orange-500"
        >
          <span>👍</span>
          <span>{post.likes || 0} Likes</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;

