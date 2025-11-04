'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import UserSearch from '@/components/UserSearch';
import { format } from 'date-fns';
import { Pencil, Trash2, ArrowLeft, Send } from 'lucide-react';
import withAuth from '@/components/withAuth';
import StaticMessages from '@/components/StaticMessages';
import { useSearchParams } from 'next/navigation';

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  receiverId: string;
  isRead: boolean;
}

interface Conversation {
  id: string;
  firstName: string;
  lastName: string;
  photo: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

function MessagesContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showConversationList, setShowConversationList] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        setIsAuthenticated(data.isAuthenticated);
        
        if (data.isAuthenticated && data.user) {
          setCurrentUserId(data.user.id);
          fetchConversations();
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Handle userId from URL parameter
  useEffect(() => {
    if (searchParams?.get('userId')) {
      // Fetch user details and start conversation
      fetchUserAndStartConversation(searchParams.get('userId')!);
    }
  }, [searchParams]);

  const fetchUserAndStartConversation = async (userId: string) => {
    try {
      // First check if conversation already exists
      const existingConversation = conversations.find(c => c.id === userId);
      if (existingConversation) {
        setSelectedConversation(existingConversation);
        fetchMessages(userId);
        return;
      }

      // If not, fetch user details
      const response = await fetch(`/api/profiles/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user details');
      const userData = await response.json();

      // Create new conversation
      const newConversation = {
        id: userData.userId,
        firstName: userData.user.firstName,
        lastName: userData.user.lastName,
        photo: userData.user.photos?.find((p: any) => p.isProfile)?.url || null,
        lastMessage: '',
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0
      };

      setSelectedConversation(newConversation);
      setConversations(prev => [newConversation, ...prev]);
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/messages?conversationId=${conversationId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      
      // Only update if messages have actually changed to prevent unnecessary re-renders
      setMessages(prevMessages => {
        const newMessages = data.messages || [];
        
        // Check if messages are actually different
        if (JSON.stringify(prevMessages.map((m: Message) => m.id)) === JSON.stringify(newMessages.map((m: Message) => m.id))) {
          return prevMessages;
        }
        
        return newMessages;
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages/conversations');
      if (!response.ok) throw new Error('Failed to fetch conversations');
      const data = await response.json();
      setConversations(data.conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !currentUserId || sending) return;

    const messageContent = newMessage.trim();
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    
    // Set sending state and clear input immediately for better UX
    setSending(true);
    setNewMessage('');

    // Create optimistic message
    const optimisticMessage: Message = {
      id: tempId,
      content: messageContent,
      createdAt: new Date().toISOString(),
      senderId: currentUserId,
      receiverId: selectedConversation.id,
      isRead: false
    };

    // Add message optimistically with React's functional update
    setMessages(prevMessages => {
      // Prevent duplicate messages
      const messageExists = prevMessages.some(msg => 
        msg.content === messageContent && 
        msg.senderId === currentUserId && 
        Math.abs(new Date(msg.createdAt).getTime() - new Date().getTime()) < 1000
      );
      
      if (messageExists) return prevMessages;
      
      return [...prevMessages, optimisticMessage];
    });

    // Update conversation list optimistically
    const updatedConversation = {
      ...selectedConversation,
      lastMessage: messageContent,
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0
    };
    
    setConversations(prev => 
      [updatedConversation, ...prev.filter(c => c.id !== selectedConversation.id)]
    );

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: selectedConversation.id,
          content: messageContent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const { message: serverMessage } = await response.json();
      
      // Replace optimistic message with server message
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === tempId 
            ? {
                ...serverMessage,
                // Preserve the optimistic timestamp to maintain order
                createdAt: optimisticMessage.createdAt
              }
            : msg
        )
      );
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove failed message and restore input
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg.id !== tempId)
      );
      
      // Restore message in input field
      setNewMessage(messageContent);
      
      // Show user-friendly error
      alert('Failed to send message. Please check your connection and try again.');
    } finally {
      setSending(false);
    }
  };

  const handleUserSelect = (user: any) => {
    if (!user || !user.id || !user.firstName || !user.lastName) {
      console.error('Invalid user data:', user);
      return;
    }

    // Check if conversation already exists
    const existingConversation = conversations.find(c => c.id === user.id);
    if (existingConversation) {
      setSelectedConversation(existingConversation);
      return;
    }

    // Create new conversation
    const newConversation = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      photo: user.photo || null,
      lastMessage: '',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0
    };

    setSelectedConversation(newConversation);
    setConversations(prev => [newConversation, ...prev]);
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newContent }),
      });

      if (!response.ok) throw new Error('Failed to edit message');
      
      const updatedMessage = await response.json();
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? updatedMessage : msg
      ));
      setEditingMessage(null);
      setEditContent('');
    } catch (error) {
      console.error('Error editing message:', error);
      alert('Failed to edit message. Please try again.');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete message');
      
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message. Please try again.');
    }
  };

  const formatMessageTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '';
      }
      return format(date, 'h:mm a');
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  useEffect(() => {
    if (!loading && isAuthenticated) {
      fetchConversations();
      // Reduced frequency to prevent conflicts
      const interval = setInterval(fetchConversations, 30000); // 30 seconds instead of 10
      return () => clearInterval(interval);
    }
  }, [loading, isAuthenticated]);

  useEffect(() => {
    if (selectedConversation && isAuthenticated) {
      fetchMessages(selectedConversation.id);
      // Reduced frequency and added delay to prevent conflicts with sending
      const interval = setInterval(() => {
        // Only fetch if not currently sending a message
        if (!newMessage.trim()) {
          fetchMessages(selectedConversation.id);
        }
      }, 15000); // 15 seconds instead of 5
      return () => clearInterval(interval);
    }
  }, [selectedConversation, isAuthenticated]);

  useEffect(() => {
    // Small delay to ensure DOM is updated before scrolling
    const scrollTimeout = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    
    return () => clearTimeout(scrollTimeout);
  }, [messages]);

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowConversationList(false); // Hide conversation list on mobile when a chat is selected
  };

  const handleBackToList = () => {
    setShowConversationList(true);
    // Don't clear selected conversation to preserve state
  };

  // Update message rendering to be more strict about alignment
  const isOwnMessage = (message: Message) => {
    return message.senderId === currentUserId;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 backdrop-blur-md z-0" />
        <div className="relative z-10 flex flex-col items-center">
          <svg className="animate-spin h-14 w-14 text-purple-300 mb-4" viewBox="0 0 50 50">
            <circle className="opacity-20" cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="5" fill="none" />
            <circle className="opacity-70" cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="5" fill="none" strokeDasharray="31.4 94.2" />
          </svg>
          <span className="text-purple-200 text-lg font-medium animate-pulse">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <StaticMessages />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950 relative overflow-hidden flex flex-col">
      {/* Decorative floating chat bubble */}
      <div className="absolute top-4 left-8 animate-bounce text-blue-200 text-3xl z-10">💬</div>
      
      <div className="flex-1 flex flex-col h-[calc(100vh-2rem)] max-h-[calc(100vh-2rem)] overflow-hidden">
        <div className="p-4 bg-white/10 backdrop-blur-sm border-b border-white/20 shadow-sm">
          <UserSearch onUserSelect={handleUserSelect} />
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Conversation List - Hidden on mobile when chat is selected */}
          <div className={`${showConversationList ? 'flex' : 'hidden'} md:flex w-full md:w-1/3 border-r border-white/20 bg-white/5 overflow-y-auto shadow-sm flex-col`}>
            <div className="p-4 flex-1">
              <h2 className="text-lg font-semibold mb-4 text-white">Conversations</h2>
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`flex items-center p-3 cursor-pointer hover:bg-white/10 rounded-lg transition-colors ${
                      selectedConversation?.id === conversation.id ? 'bg-purple-500/20' : ''
                    }`}
                    onClick={() => handleConversationSelect(conversation)}
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden mr-3 ring-2 ring-offset-2 ring-purple-400/50 flex-shrink-0">
                      {conversation.photo ? (
                        <img
                          src={conversation.photo}
                          alt={`${conversation.firstName} ${conversation.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-lg">
                          {conversation.firstName[0]}{conversation.lastName[0]}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-white truncate">
                          {conversation.firstName} {conversation.lastName}
                        </h3>
                        <span className="text-sm text-gray-300 ml-2 flex-shrink-0">
                          {format(new Date(conversation.lastMessageTime), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 truncate">{conversation.lastMessage}</p>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <div className="ml-2 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                        {conversation.unreadCount}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Section - Shown on mobile when chat is selected */}
          <div className={`${!showConversationList ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-indigo-950/50 backdrop-blur-sm`}>
            {selectedConversation ? (
              <>
                <div className="p-4 border-b border-white/10 flex items-center bg-white/5 shadow-sm">
                  {/* Back button - Only visible on mobile */}
                  <button
                    onClick={handleBackToList}
                    className="md:hidden mr-2 text-white hover:text-purple-300 transition-colors"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden mr-3 ring-2 ring-offset-2 ring-purple-400/50 flex-shrink-0">
                    {selectedConversation?.photo ? (
                      <img
                        src={selectedConversation.photo}
                        alt={`${selectedConversation.firstName} ${selectedConversation.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white">
                        {selectedConversation?.firstName?.[0] || ''}{selectedConversation?.lastName?.[0] || ''}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-white">
                      {selectedConversation?.firstName} {selectedConversation?.lastName}
                    </h3>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex flex-col mb-4 ${
                          isOwnMessage(message) ? 'items-end' : 'items-start'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] md:max-w-[70%] rounded-lg p-3 ${
                            isOwnMessage(message)
                              ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white ml-auto'
                              : 'bg-white/10 text-white'
                          }`}
                        >
                          {editingMessage?.id === message.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="flex-1 bg-white/10 rounded px-2 py-1 text-white"
                                autoFocus
                              />
                              <button
                                onClick={() => handleEditMessage(message.id, editContent)}
                                className="text-xs text-white/80 hover:text-white"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <>
                              <p className="break-words">{message.content}</p>
                              <div className="flex items-center justify-end gap-2 mt-1">
                                <span className="text-xs text-white/60">
                                  {formatMessageTime(message.createdAt)}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-white/5">
                  <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                        placeholder="Type a message..."
                        className="flex-1 bg-purple-800 text-white placeholder-purple-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        disabled={sending}
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sending ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-white/60">
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}