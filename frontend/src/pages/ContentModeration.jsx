import React, { useState, useEffect } from "react";
import { fetchAdminPosts, deleteAdminPost } from "../services/api";
import PostCard from "../components/PostCard";

const ContentModeration = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const adminName = user.name || "Admin";

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await fetchAdminPosts();
      setPosts(response.data?.data || []);
      setError("");
    } catch (err) {
      console.error("Error fetching admin posts:", err);
      setError("Failed to load posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleDelete = async (post) => {
    if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    try {
      setBusyId(post.id);
      await deleteAdminPost(post.id, { adminName });
      setPosts(posts.filter(p => p.id !== post.id));
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Failed to delete the post.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Content Moderation
          </h2>
          <p className="text-sm text-gray-600">
            Admin view for reviewing posts shared by alumni and removing
            inappropriate content.
          </p>
        </header>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="card-title">Alumni Posts</h3>
            <span className="text-sm text-gray-500">
              {posts.length} post{posts.length !== 1 && 's'}
            </span>
          </div>

          {loading ? (
            <p className="text-sm text-gray-500">Loading posts...</p>
          ) : posts.length === 0 ? (
            <p className="mt-2 text-sm text-gray-600">
              No posts have been published yet.
            </p>
          ) : (
            <div className="mt-4 grid gap-4 max-w-3xl mx-auto">
              {posts.map((post) => (
                <div key={post.id} className="relative">
                  {busyId === post.id && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-lg">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-red-500 border-t-transparent"></div>
                    </div>
                  )}
                  <PostCard post={post} onDelete={handleDelete} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ContentModeration;

