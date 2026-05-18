import React from 'react';
import { motion } from 'framer-motion';
import { LiquidButton } from './liquid-glass-button';
import { useNavigate } from 'react-router-dom';

export function RoleShuffleCard({ role, position, handleShuffle }) {
  const navigate = useNavigate();
  const dragRef = React.useRef(0);
  const isFront = position === "front";
  const Icon = role.icon;

  return (
    <motion.div
      style={{
        zIndex: position === "front" ? "2" : position === "middle" ? "1" : "0"
      }}
      animate={{
        rotate: position === "front" ? "-6deg" : position === "middle" ? "0deg" : "6deg",
        x: position === "front" ? "0%" : position === "middle" ? "33%" : "66%",
        scale: position === "front" ? 1 : position === "middle" ? 0.95 : 0.9,
      }}
      drag={true}
      dragElastic={0.35}
      dragListener={isFront}
      dragConstraints={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
      onDragStart={(e) => {
        // e.clientX is undefined for touch events, use e.touches if available
        dragRef.current = e.clientX || (e.touches && e.touches[0].clientX);
      }}
      onDragEnd={(e) => {
        const clientX = e.clientX || (e.changedTouches && e.changedTouches[0].clientX);
        if (Math.abs(dragRef.current - clientX) > 100) {
          handleShuffle();
        }
        dragRef.current = 0;
      }}
      transition={{ duration: 0.35 }}
      className={`absolute left-0 top-0 flex flex-col p-8 h-[420px] w-[320px] sm:w-[350px] bg-card rounded-2xl border-2 border-border shadow-2xl ${
        isFront ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
      }`}
      onClick={(e) => {
        // If not front card, clicking it shuffles to the front
        if (!isFront) {
          handleShuffle();
        }
      }}
    >
      <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary pointer-events-none">
        <Icon size={28} />
      </div>
      <h3 className="text-2xl font-bold text-foreground mb-3 pointer-events-none">{role.title}</h3>
      <p className="text-muted-foreground leading-relaxed flex-1 mb-8 pointer-events-none">
        {role.description}
      </p>
      
      <div className="mt-auto relative z-10" onPointerDownCapture={(e) => e.stopPropagation()}>
        <LiquidButton 
          className={`w-full ${!isFront ? 'opacity-50 pointer-events-none' : ''}`}
          onClick={(e) => {
            if (isFront) {
              navigate(role.href);
            }
          }}
        >
          Login as {role.title}
        </LiquidButton>
      </div>
    </motion.div>
  );
}
