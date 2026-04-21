import React, { useState, useEffect } from "react";
import { fetchAdminPosts, deleteAdminPost } from "../services/api";

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

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    try {
      setBusyId(postId);
      await deleteAdminPost(postId, { adminName });
      setPosts(posts.filter(p => p.id !== postId));
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
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Author
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Post Details
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {posts.map((post) => (
                    <tr key={post.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {post.author}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 font-semibold">{post.title}</div>
                        {post.category && (
                          <span className="inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5 text-blue-800 mt-1">
                            {post.category}
                          </span>
                        )}
                        <div className="text-sm text-gray-500 mt-1 line-clamp-2" title={post.description}>
                          {post.description}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString("en-IN") : "—"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <button
                          type="button"
                          disabled={busyId === post.id}
                          onClick={() => handleDelete(post.id)}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          {busyId === post.id ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ContentModeration;

