import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  ChatBubbleLeftRightIcon, 
  PaperAirplaneIcon, 
  UserCircleIcon,
  PaperClipIcon,
  DocumentIcon,
  PhotoIcon,
  XMarkIcon,
  EllipsisHorizontalIcon,
  FaceSmileIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { 
  getUserMessages, 
  getDoctorById, 
  getPatientById,
  formatDateTime,
  markMessageAsRead
} from '../../utils/mockData';
import PageHeader from '../PageHeader';
import EmptyState from '../EmptyState';

export default function Messages({ userType, userId }) {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const endOfMessagesRef = useRef(null);
  const [searchParams] = useSearchParams();
  
  // Get patient ID from URL query parameters if available
  const patientId = searchParams.get('patientId') ? parseInt(searchParams.get('patientId')) : null;
  
  useEffect(() => {
    // Fetch user's messages
    const userMessages = getUserMessages(userType, userId);
    setConversations(userMessages);
    
    // If patientId is provided, select that conversation
    if (patientId) {
      const conversation = userMessages.find(conv => 
        (userType === 'doctor' && conv.patientId === patientId) ||
        (userType === 'patient' && conv.doctorId === patientId)
      );
      if (conversation) {
        setSelectedConversation(conversation);
      }
    } else if (userMessages.length > 0 && !selectedConversation) {
      setSelectedConversation(userMessages[0]);
    }
  }, [userType, userId, patientId]);
  
  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      selectedConversation.messages.forEach(message => {
        if (!message.read && message.sender !== 'user') {
          markMessageAsRead(message.id);
        }
      });
      
      // Update conversations state to reflect read status
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.id === selectedConversation.id
            ? {
                ...conv,
                messages: conv.messages.map(msg => 
                  !msg.read && msg.sender !== 'user'
                    ? { ...msg, read: true, status: 'read' }
                    : msg
                )
              }
            : conv
        )
      );
    }
  }, [selectedConversation]);
  
  // Scroll to the bottom of the messages when new ones are added
  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation]);
  
  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Filter conversations by search term
  const filteredConversations = conversations.filter(conv => {
    const contactName = userType === 'doctor' 
      ? getPatientById(conv.patientId).name 
      : getDoctorById(conv.doctorId).name;
    
    return contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.messages.some(msg => msg.content.toLowerCase().includes(searchTerm.toLowerCase()));
  });
  
  // Get the last message from a conversation
  const getLastMessage = (conversation) => {
    return conversation.messages[conversation.messages.length - 1];
  };

  // Format time for display
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Format date for display in message groups
  const formatMessageDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {};
    
    messages.forEach(message => {
      const date = new Date(message.timestamp);
      const dateString = date.toDateString();
      
      if (!groups[dateString]) {
        groups[dateString] = [];
      }
      
      groups[dateString].push(message);
    });
    
    return Object.entries(groups).map(([date, messages]) => ({
      date,
      formattedDate: formatMessageDate(date),
      messages
    }));
  };
  
  // Handle sending a new message
  const handleSendMessage = () => {
    if (!newMessage.trim() && attachments.length === 0) return;
    
    const message = {
      id: Date.now().toString(),
      sender: userType,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      attachments: [...attachments],
      status: 'sent'
    };
    
    const updatedConversation = {
      ...selectedConversation,
      messages: [...selectedConversation.messages, message]
    };
    
    setSelectedConversation(updatedConversation);
    setConversations(prevConversations => 
      prevConversations.map(conv => 
        conv.id === updatedConversation.id ? updatedConversation : conv
      )
    );
    
    setNewMessage('');
    setAttachments([]);
    setShowAttachmentMenu(false);
  };
  
  // Handle attachment selection
  const handleAttachment = (type) => {
    // In a real app, this would open a file picker
    const mockAttachment = {
      id: Date.now().toString(),
      type: type,
      name: type === 'image' 
        ? 'attachment.jpg' 
        : type === 'document' 
          ? 'document.pdf' 
          : 'file.txt',
      size: '1.2 MB',
      url: '#'
    };
    
    setAttachments(prev => [...prev, mockAttachment]);
    setShowAttachmentMenu(false);
  };
  
  // Remove an attachment
  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(attachment => attachment.id !== id));
  };

  // Get the appropriate icon for the attachment type
  const getAttachmentIcon = (type) => {
    switch(type) {
      case 'image':
        return PhotoIcon;
      case 'document':
        return DocumentIcon;
      default:
        return PaperClipIcon;
    }
  };

  // Get the contact name based on user type
  const getContactName = (conversation) => {
    if (userType === 'doctor') {
      return getPatientById(conversation.patientId).name;
    } else {
      return getDoctorById(conversation.doctorId).name;
    }
  };
  
  // Get the contact avatar based on user type
  const getContactAvatar = (conversation) => {
    const initial = getContactName(conversation).charAt(0);
    const bgColor = conversation.id % 2 === 0 ? 'bg-blue-500' : 'bg-purple-500';
    
    return (
      <div className={`h-10 w-10 rounded-full ${bgColor} flex items-center justify-center`}>
        <span className="text-white font-medium">{initial}</span>
      </div>
    );
  };
  
  // Get the contact specialty if the contact is a doctor
  const getContactSpecialty = (conversation) => {
    if (userType === 'patient') {
      return getDoctorById(conversation.doctorId).specialty;
    }
    return null;
  };
  
  // Check if a user is online (mock function)
  const isUserOnline = (id) => {
    // For demo purposes, we'll just return true for odd ids
    return id % 2 === 1;
  };

  return (
    <div>
      <PageHeader 
        title="Messages" 
        description="Communicate with your healthcare providers"
      />
      
      <div className="flex h-[calc(100vh-15rem)] bg-medical-box-light rounded-lg overflow-hidden">
        {/* Conversations Sidebar */}
        <div className="w-80 flex-shrink-0 border-r border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <div className="relative">
              <input
                type="text"
                className="w-full px-3 py-2 pl-10 bg-medical-box-light border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
          
          <div className="overflow-y-auto h-full">
            {filteredConversations.length > 0 ? (
              <ul className="divide-y divide-gray-700">
                {filteredConversations.map(conversation => {
                  const lastMessage = getLastMessage(conversation);
                  const contactName = getContactName(conversation);
                  const specialty = getContactSpecialty(conversation);
                  const isOnline = isUserOnline(userType === 'doctor' ? conversation.patientId : conversation.doctorId);
                  
                  return (
                    <li 
                      key={conversation.id}
                      className={`px-4 py-3 hover:bg-gray-700 cursor-pointer transition-colors ${
                        selectedConversation?.id === conversation.id ? 'bg-gray-700' : ''
                      }`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="flex items-start">
                        <div className="relative flex-shrink-0 mr-3">
                          {getContactAvatar(conversation)}
                          {isOnline && (
                            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-gray-700"></span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-white truncate">
                              {contactName}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatMessageTime(lastMessage.timestamp)}
                            </p>
                          </div>
                          {specialty && (
                            <p className="text-xs text-black font-medium mb-1">
                              {specialty}
                            </p>
                          )}
                          <p className="text-sm text-black font-medium truncate">
                            {lastMessage.sender === userType ? 'You: ' : ''}
                            {lastMessage.content}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="p-4 text-center">
                <p className="text-black font-medium">No conversations found</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Conversation */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Conversation Header */}
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center">
                  {getContactAvatar(selectedConversation)}
                  <div className="ml-3">
                    <p className="text-white font-medium">{getContactName(selectedConversation)}</p>
                    {getContactSpecialty(selectedConversation) && (
                      <p className="text-xs text-black font-medium">{getContactSpecialty(selectedConversation)}</p>
                    )}
                  </div>
                </div>
                <button className="text-gray-400 hover:text-white p-1 rounded-full">
                  <EllipsisHorizontalIcon className="h-6 w-6" />
                </button>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {groupMessagesByDate(selectedConversation.messages).map(group => (
                  <div key={group.date}>
                    <div className="flex justify-center mb-4">
                      <span className="px-3 py-1 bg-gray-700 text-xs text-gray-400 rounded-full">
                        {group.formattedDate}
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      {group.messages.map(message => (
                        <div 
                          key={message.id}
                          className={`flex ${message.sender === userType ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[75%] ${message.sender === userType ? 'order-1' : 'order-2'}`}>
                            {message.sender !== userType && (
                              <div className="flex items-center mb-1 ml-1">
                                {getContactAvatar(selectedConversation)}
                                <span className="ml-2 text-sm font-medium text-white">
                                  {getContactName(selectedConversation)}
                                </span>
                              </div>
                            )}
                            <div 
                              className={`p-3 rounded-lg ${
                                message.sender === userType 
                                  ? 'bg-blue-600 text-white rounded-br-none' 
                                  : 'bg-gray-700 text-white rounded-bl-none'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              
                              {message.attachments && message.attachments.length > 0 && (
                                <div className="mt-2 space-y-2">
                                  {message.attachments.map(attachment => {
                                    const AttachmentIcon = getAttachmentIcon(attachment.type);
                                    
                                    return (
                                      <div 
                                        key={attachment.id}
                                        className={`flex items-center p-2 rounded ${
                                          message.sender === userType 
                                            ? 'bg-blue-700' 
                                            : 'bg-gray-600'
                                        }`}
                                      >
                                        <AttachmentIcon className="h-5 w-5 mr-2" />
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium truncate">{attachment.name}</p>
                                          <p className="text-xs opacity-80">{attachment.size}</p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-1 text-right">
                              {formatMessageTime(message.timestamp)}
                              {message.sender === userType && (
                                <span className="ml-1">
                                  {message.status === 'read' ? '✓✓' : '✓'}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div ref={endOfMessagesRef} />
              </div>
              
              {/* Message Input */}
              <div className="p-4 border-t border-gray-700">
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {attachments.map(attachment => {
                      const AttachmentIcon = getAttachmentIcon(attachment.type);
                      
                      return (
                        <div 
                          key={attachment.id}
                          className="flex items-center bg-gray-700 px-3 py-1 rounded-full"
                        >
                          <AttachmentIcon className="h-4 w-4 mr-1 text-blue-400" />
                          <span className="text-xs text-gray-300 mr-1">{attachment.name}</span>
                          <button 
                            className="text-gray-400 hover:text-white"
                            onClick={() => removeAttachment(attachment.id)}
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                <div className="flex items-end space-x-2">
                  <div className="relative">
                    <button 
                      className="text-gray-400 hover:text-white p-2 rounded-full"
                      onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                    >
                      <PaperClipIcon className="h-5 w-5" />
                    </button>
                    
                    {showAttachmentMenu && (
                      <div className="absolute bottom-full left-0 mb-2 bg-gray-700 rounded-lg shadow-xl overflow-hidden">
                        <ul>
                          <li>
                            <button 
                              className="flex items-center w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-600"
                              onClick={() => handleAttachment('document')}
                            >
                              <DocumentIcon className="h-4 w-4 mr-2 text-blue-400" />
                              Document
                            </button>
                          </li>
                          <li>
                            <button 
                              className="flex items-center w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-600"
                              onClick={() => handleAttachment('image')}
                            >
                              <PhotoIcon className="h-4 w-4 mr-2 text-green-400" />
                              Image
                            </button>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <button className="text-gray-400 hover:text-white p-2 rounded-full">
                    <FaceSmileIcon className="h-5 w-5" />
                  </button>
                  
                  <div className="flex-1 relative">
                    <textarea
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
                      rows="2"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                  </div>
                  
                  <button 
                    className={`p-2 rounded-full ${
                      newMessage.trim() || attachments.length > 0
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() && attachments.length === 0}
                  >
                    <PaperAirplaneIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                icon={ChatBubbleLeftRightIcon}
                title="No conversation selected"
                description="Select a conversation from the list to start messaging."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 