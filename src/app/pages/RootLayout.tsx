import React from 'react';
import { Outlet, useLocation } from 'react-router';
import { BottomTabBar } from '../components/BottomTabBar';
import { motion, AnimatePresence } from 'motion/react';

export default function RootLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#0D0F14] text-white font-mono flex justify-center pb-28 relative overflow-hidden">
      {/* Background grit/pattern */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none z-0" 
        style={{ 
          backgroundImage: 'radial-gradient(circle, #4A4E58 1px, transparent 1px)', 
          backgroundSize: '16px 16px' 
        }} 
      />
      
      {/* Main Content Area with Transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.05, y: -10 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="w-full flex justify-center z-10"
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>

      <BottomTabBar />
    </div>
  );
}
