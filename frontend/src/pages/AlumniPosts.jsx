import React, { useState, useEffect } from 'react';
import { createPost, fetchPostsByAuthor, createEvent } from '../services/api';

const AlumniPosts = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    linkTitle: '',
    linkUrl: '',
    image: null,
    tags: [],
    visibility: 'Everyone',
    eventDate: '',
    eventTime: ''
  });
  const [tagInput, setTagInput] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [recentPosts, setRecentPosts] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  // Get current user from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const author = user.name || 'John Doe'; // fallback

  useEffect(() => {
    fetchRecentPosts();
  }, []);

  const fetchRecentPosts = async () => {
    try {
      const response = await fetchPostsByAuthor(author);
      setRecentPosts(response.data.data);
    } catch (error) {
      console.error('Error fetching recent posts:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleTagAdd = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const handleTagRemove = (tag) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handlePublish = async () => {
    try {
      const postData = {
        ...formData,
        author,
        image: imagePreview // For mock, send base64 or just filename
      };
      await createPost(postData);

      // If it's an event announcement with date and time, also create an event
      if (formData.category === 'Event Announcement' && formData.eventDate && formData.eventTime) {
        const eventData = {
          title: formData.title,
          description: formData.description,
          host: author,
          date: formData.eventDate,
          time: formData.eventTime,
          mode: 'Online', // Default mode, could be made configurable
          speaker: author
        };
        await createEvent(eventData);
      }

      setSuccessMessage('Post published successfully!');
      setFormData({
        title: '',
        description: '',
        category: '',
        linkTitle: '',
        linkUrl: '',
        image: null,
        tags: [],
        visibility: 'Everyone',
        eventDate: '',
        eventTime: ''
      });
      setImagePreview(null);
      setTagInput('');
      setShowPreview(false);
      fetchRecentPosts();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error publishing post:', error);
    }
  };

  const categories = ['Career Advice', 'Job Referral', 'Internship Opportunity', 'Tech Insight', 'Event Announcement'];

  return (
    <div className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Create Post
          </h2>
          <p className="text-sm text-gray-600">
            Share career advice, resources or opportunities with REVA students.
          </p>
        </header>
        <section className="card p-4 mb-6">
          <h3 className="card-title">New Post</h3>
          {successMessage && <p className="text-green-600 mb-4">{successMessage}</p>}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Enter post title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Write your post description"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.description.length} / 500 characters</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value="">Select a category</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            {formData.category === 'Event Announcement' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Event Date</label>
                  <input
                    type="date"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Event Time</label>
                  <input
                    type="time"
                    name="eventTime"
                    value={formData.eventTime}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Link Title</label>
                <input
                  type="text"
                  name="linkTitle"
                  value={formData.linkTitle}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="e.g., Apply here"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Link URL</label>
                <input
                  type="url"
                  name="linkUrl"
                  value={formData.linkUrl}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="https://example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Attach Image</label>
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleImageChange}
                className="mt-1 block w-full"
              />
              {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 max-w-xs" />}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tags / Skills</label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagAdd}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Type a tag and press Enter"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map(tag => (
                  <span key={tag} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center">
                    #{tag}
                    <button onClick={() => handleTagRemove(tag)} className="ml-1 text-red-500">×</button>
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Visible To</label>
              <div className="mt-2 space-y-2">
                {['Students Only', 'Alumni Only', 'Everyone'].map(option => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="visibility"
                      value={option}
                      checked={formData.visibility === option}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-4 mt-6">
            <button onClick={handlePreview} className="bg-gray-500 text-white px-4 py-2 rounded">Preview Post</button>
            <button onClick={handlePublish} className="bg-blue-600 text-white px-4 py-2 rounded">Publish Post</button>
          </div>
        </section>
        {showPreview && (
          <section className="card p-4 mb-6">
            <h3 className="card-title">Post Preview</h3>
            <div className="border p-4 rounded">
              <h4 className="font-semibold">{formData.title}</h4>
              <p className="text-sm text-gray-700 mt-2">{formData.description}</p>
              <p className="text-xs text-gray-500 mt-1">Category: {formData.category}</p>
              {formData.category === 'Event Announcement' && formData.eventDate && formData.eventTime && (
                <p className="text-xs text-gray-500 mt-1">
                  Event: {new Date(formData.eventDate).toLocaleDateString()} at {formData.eventTime}
                </p>
              )}
              {formData.linkTitle && formData.linkUrl && (
                <p className="mt-2"><a href={formData.linkUrl} className="text-blue-600">{formData.linkTitle}</a></p>
              )}
              {imagePreview && <img src={imagePreview} alt="Post" className="mt-2 max-w-xs" />}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.tags.map(tag => <span key={tag} className="text-blue-600">#{tag}</span>)}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">Visible to: {formData.visibility}</p>
            </div>
          </section>
        )}
        <section className="card p-4">
          <h3 className="card-title">My Recent Posts</h3>
          {recentPosts.length > 0 ? (
            <div className="space-y-2 mt-4">
              {recentPosts.map(post => (
                <div key={post.id} className="border p-2 rounded">
                  <h4 className="font-semibold">{post.title}</h4>
                  <p className="text-sm text-gray-600">Category: {post.category}</p>
                  <p className="text-xs text-gray-500">Posted on {new Date(post.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600 mt-2">No recent posts.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default AlumniPosts;

