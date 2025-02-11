'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import ChatInput from '@/components/ChatInput';
import { analyzeImage, queryImage } from '@/services/api';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  image?: string;
  imageId?: string;
}

export default function UploadPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (text: string, image?: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Add user message immediately
      const userMessageId = Date.now().toString();
      const userMessage: Message = {
        id: userMessageId,
        type: 'user',
        content: text,
        image: image ? URL.createObjectURL(image) : undefined
      };
      
      setMessages(prev => [...prev, userMessage]);

      let response;
      if (image) {
        // New image analysis
        response = await analyzeImage(image, text);
        
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'assistant',
          content: response.description,
          imageId: response.imageId
        }]);
      } else {
        // Query about previous image
        const lastImage = [...messages].reverse().find(m => m.imageId);
        if (!lastImage?.imageId) {
          throw new Error('No image to query about');
        }

        response = await queryImage(lastImage.imageId, text);
        
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'assistant',
          content: response.answer
        }]);
      }
    } catch (err) {
      setError(err.message || 'Failed to process request');
      console.error('Error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#121212] to-[#18181c]">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/">
            <button className="text-[#B3B3B3] hover:text-[#00BFFF] transition-colors">
              ⬅️ Back to Home
            </button>
          </Link>
          <h1 className="text-[#EAEAEA] font-semibold">AI Image Chat</h1>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="max-w-4xl mx-auto p-4 mb-24">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
              mb-4 p-4 rounded-xl
              ${message.type === 'user' 
                ? 'bg-[#1A1A1A] ml-auto' 
                : 'bg-[#2A2A2A] mr-auto'
              }
              max-w-[80%]
            `}
          >
            {message.image && (
              <img 
                src={message.image} 
                alt="Uploaded" 
                className="max-h-48 rounded-lg mb-2"
              />
            )}
            <p className="text-[#EAEAEA]">{message.content}</p>
          </motion.div>
        ))}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 mb-4 rounded-xl bg-red-900/30 text-red-200 border border-red-800"
          >
            {error}
          </motion.div>
        )}
      </div>

      {/* Chat Input */}
      <ChatInput 
        onSubmit={handleSubmit} 
        disabled={isProcessing}
      />
    </main>
  );
} 