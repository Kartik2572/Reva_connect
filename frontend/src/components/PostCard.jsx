const PostCard = ({ post }) => {
  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {post.author}
          </p>
          <p className="text-xs text-gray-500">{post.company}</p>
        </div>
        <p className="text-xs text-gray-400">
          {new Date(post.createdAt).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
          })}
        </p>
      </div>
      <p className="text-sm text-gray-700">{post.content}</p>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <button
          type="button"
          className="inline-flex items-center gap-1 text-[#F37021] hover:text-orange-500"
        >
          <span>👍</span>
          <span>{post.likes} Likes</span>
        </button>
        <p>{post.comments.length} Comments</p>
      </div>
      {post.comments.length > 0 && (
        <div className="mt-2 space-y-1 rounded-lg bg-gray-50 p-2">
          {post.comments.map((comment) => (
            <p key={comment.id} className="text-xs text-gray-600">
              <span className="font-medium">{comment.author}: </span>
              {comment.text}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostCard;

