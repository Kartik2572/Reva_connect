import { useEffect, useState } from "react";
import { fetchPosts } from "../services/api.js";
import PostCard from "../components/PostCard.jsx";

const NetworkingFeed = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchPosts()
      .then((res) => setPosts(res.data.data))
      .catch(() => setPosts([]));
  }, []);

  return (
    <div className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Networking Feed
          </h2>
          <p className="text-sm text-gray-600">
            Stay updated with alumni posts, opportunities and guidance.
          </p>
        </header>

        <div className="space-y-4">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
          {posts.length === 0 && (
            <p className="text-sm text-gray-500">
              No posts available yet. Ensure the backend server is running.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkingFeed;

