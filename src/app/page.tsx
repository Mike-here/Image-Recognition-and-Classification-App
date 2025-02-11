'use client';

import { useState, useEffect } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase-config';
import ImageUpload from '../components/ImageUpload';
import ImagePreview from '../components/ImagePreview';
import { motion, AnimatePresence } from 'framer-motion';
import ImageQuery from '../components/ImageQuery';
import Link from 'next/link';

export default function WelcomePage() {
  const features = [
    { icon: "🔍", title: "Object Detection", description: "Identify multiple objects in your images" },
    { icon: "🖼️", title: "Scene Description", description: "Get detailed descriptions of the scene" },
    { icon: "⚡", title: "Real-time Processing", description: "Fast and accurate AI analysis" }
  ];

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-[#121212] to-[#18181c]">
      <div className="max-w-4xl mx-auto pt-16">
        {/* Welcome Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [-5, 5, 0],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="text-6xl mb-6"
          >
            👋
          </motion.div>
          <h1 
            className="text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#00BFFF] to-[#8A2BE2]"
            style={{ textShadow: '0px 0px 10px rgba(0, 191, 255, 0.3)' }}
          >
            Welcome to the AI-Powered Image Analyzer
          </h1>
          <p className="text-lg text-[#B3B3B3]">
            Upload your images and let AI discover what's inside
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="glass-effect p-8 rounded-xl text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.5 }}
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-[#00BFFF] text-xl font-semibold mb-2">
                {feature.title}
              </h3>
              <p className="text-[#B3B3B3]">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Link href="/upload">
            <motion.button
              className="px-8 py-4 text-lg font-medium text-white
                         bg-gradient-to-r from-[#00BFFF] to-[#8A2BE2]
                         rounded-xl shadow-lg shadow-blue-500/20
                         hover:shadow-blue-500/40 hover:scale-105
                         transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🚀 Start Analyzing Images
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </main>
  );
} 