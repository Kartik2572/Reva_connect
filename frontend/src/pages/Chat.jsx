import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { fetchConversations, fetchMessages } from "../services/api";

const Chat = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [loadingConv, setLoadingConv] = useState(false);
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const activeConversationRef = useRef(null);

  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io("http://localhost:5000", {
      auth: { token }
    });

    socketRef.current.on("connect", () => {
      console.log("Connected to chat server");
    });

    socketRef.current.on("online_users", (users) => {
      setOnlineUsers(new Set(users));
    });

    socketRef.current.on("user_online", (userId) => {
      setOnlineUsers(prev => new Set(prev).add(userId.toString()));
    });

    socketRef.current.on("user_offline", (userId) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        next.delete(userId.toString());
        return next;
      });
    });

    socketRef.current.on("receive_message", (message) => {
      const currentActive = activeConversationRef.current;
      // Update conversations list (latest message)
      setConversations(prev => {
        const updated = prev.map(c => {
          if (c.conversation_id === message.conversation_id) {
            const shouldIncrement = message.sender_id !== currentUser.id && currentActive?.conversation_id !== message.conversation_id;
            return {
              ...c,
              last_message_at: message.created_at,
              last_message: message,
              unread_count: shouldIncrement ? parseInt(c.unread_count || 0) + 1 : parseInt(c.unread_count || 0)
            };
          }
          return c;
        });
        // Sort by last message desc
        return updated.sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at));
      });

      // If active conversation, append message
      if (currentActive && currentActive.conversation_id === message.conversation_id) {
        setMessages(prev => {
          if (prev.find(m => m.id === message.id)) return prev;
          return [...prev, message];
        });
        
        if (message.sender_id !== currentUser.id) {
          socketRef.current.emit("message_read", {
            messageId: message.id,
            conversationId: message.conversation_id
          });
        }
      }
      setTimeout(scrollToBottom, 50);
    });

    socketRef.current.on("messages_read", ({ conversationId, readerId }) => {
      if (readerId !== currentUser.id) {
        setMessages(prev => prev.map(m => 
          m.conversation_id === conversationId && !m.is_read
            ? { ...m, is_read: true, read_at: new Date().toISOString() }
            : m
        ));
      }
    });

    socketRef.current.on("typing", ({ conversationId, senderId }) => {
      setTypingUsers(prev => new Set(prev).add(senderId.toString()));
    });

    socketRef.current.on("stop_typing", ({ conversationId, senderId }) => {
      setTypingUsers(prev => {
        const next = new Set(prev);
        next.delete(senderId.toString());
        return next;
      });
    });

    socketRef.current.on("error", (err) => {
      alert(err.message);
    });

    loadConversations();

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const loadConversations = async () => {
    try {
      const res = await fetchConversations();
      if (res.data?.success) {
        setConversations(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  };

  const loadMessages = async (conversationId, pageNum = 1) => {
    try {
      if (pageNum === 1) setLoadingConv(true);
      const res = await fetchMessages(conversationId, pageNum, 50);
      if (res.data?.success) {
        const fetchedMsgs = res.data.data;
        if (fetchedMsgs.length < 50) setHasMore(false);
        else setHasMore(true);

        if (pageNum === 1) {
          setMessages(fetchedMsgs);
          setTimeout(scrollToBottom, 100);
          
          // Mark unread messages as read
          const unreadMsgs = fetchedMsgs.filter(m => !m.is_read && m.sender_id !== currentUser.id);
          unreadMsgs.forEach(m => {
            socketRef.current.emit("message_read", {
              messageId: m.id,
              conversationId: m.conversation_id
            });
          });
          
          // Update local unread count
          setConversations(prev => prev.map(c => 
            c.conversation_id === conversationId ? { ...c, unread_count: 0 } : c
          ));
        } else {
          setMessages(prev => [...fetchedMsgs, ...prev]);
        }
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      if (pageNum === 1) setLoadingConv(false);
    }
  };

  const handleSelectConversation = (conv) => {
    setActiveConversation(conv);
    setPage(1);
    setHasMore(true);
    setMessages([]);
    socketRef.current.emit("join_conversation", conv.conversation_id);
    loadMessages(conv.conversation_id, 1);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    socketRef.current.emit("send_message", {
      conversationId: activeConversation.conversation_id,
      receiverId: activeConversation.other_user_id,
      message: newMessage.trim()
    });

    setNewMessage("");
    socketRef.current.emit("stop_typing", {
      conversationId: activeConversation.conversation_id,
      receiverId: activeConversation.other_user_id
    });
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!activeConversation) return;

    socketRef.current.emit("typing", {
      conversationId: activeConversation.conversation_id,
      receiverId: activeConversation.other_user_id
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit("stop_typing", {
        conversationId: activeConversation.conversation_id,
        receiverId: activeConversation.other_user_id
      });
    }, 2000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScroll = (e) => {
    if (e.target.scrollTop === 0 && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadMessages(activeConversation.conversation_id, nextPage);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50">
      {/* Sidebar: Conversations List */}
      <div className="w-1/3 min-w-[300px] border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">Messages</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No conversations yet.<br/>Connect with someone to start chatting!
            </div>
          ) : (
            conversations.map(conv => {
              const isOnline = onlineUsers.has(conv.other_user_id.toString());
              const isActive = activeConversation?.conversation_id === conv.conversation_id;
              
              return (
                <div 
                  key={conv.conversation_id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${isActive ? 'bg-blue-50 border-blue-100' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                        {conv.other_user_name?.charAt(0).toUpperCase()}
                      </div>
                      {isOnline && (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-semibold text-gray-900 truncate pr-2">{conv.other_user_name}</h3>
                        {conv.last_message && (
                          <span className="text-xs text-gray-400 whitespace-nowrap">
                            {new Date(conv.last_message.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <p className={`text-sm truncate ${parseInt(conv.unread_count) > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                          {conv.last_message ? (
                            conv.last_message.sender_id === currentUser.id ? `You: ${conv.last_message.message}` : conv.last_message.message
                          ) : "No messages yet"}
                        </p>
                        {parseInt(conv.unread_count) > 0 && (
                          <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white shadow-sm z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  {activeConversation.other_user_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{activeConversation.other_user_name}</h3>
                  <p className="text-xs text-gray-500">
                    {onlineUsers.has(activeConversation.other_user_id.toString()) ? (
                      <span className="text-green-600 font-medium flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span> Online
                      </span>
                    ) : 'Offline'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div 
              className="flex-1 overflow-y-auto p-4 bg-gray-50"
              onScroll={handleScroll}
            >
              {loadingConv ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-4 flex flex-col justify-end min-h-full">
                  {messages.map((msg, index) => {
                    const isMe = msg.sender_id === currentUser.id;
                    const showDate = index === 0 || new Date(messages[index-1].created_at).toDateString() !== new Date(msg.created_at).toDateString();
                    
                    return (
                      <div key={msg.id}>
                        {showDate && (
                          <div className="flex justify-center my-4">
                            <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                              {new Date(msg.created_at).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        )}
                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                            isMe 
                              ? 'bg-blue-600 text-white rounded-br-none' 
                              : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none shadow-sm'
                          }`}>
                            <p className="whitespace-pre-wrap break-words text-sm">{msg.message}</p>
                          </div>
                          <div className="flex items-center gap-1 mt-1 px-1">
                            <span className="text-[10px] text-gray-400">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMe && (
                              <span className="text-blue-500">
                                {msg.is_read ? (
                                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L7 17l-5-5"></path><path d="M22 10l-11 11"></path></svg>
                                ) : (
                                  <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {typingUsers.has(activeConversation.other_user_id.toString()) && (
                    <div className="flex items-start">
                      <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm inline-flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-100 border-transparent rounded-full px-5 py-3 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
            <svg className="w-20 h-20 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            <h3 className="text-xl font-medium text-gray-500">Select a conversation</h3>
            <p className="mt-2 text-sm">Choose someone from the list to start messaging.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
