'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Prize } from '@/lib/types';

interface ScratchCardProps {
  prize: Prize;
  onScratchStart: () => void;
  className?: string;
}

export const ScratchCard: React.FC<ScratchCardProps> = ({
  prize,
  onScratchStart,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [hasStartedScratching, setHasStartedScratching] = useState(false);
  const [scratchPercentage, setScratchPercentage] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  const REVEAL_THRESHOLD = 50;

  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    
    ctx.scale(devicePixelRatio, devicePixelRatio);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, '#C0C0C0');
    gradient.addColorStop(0.5, '#E8E8E8');
    gradient.addColorStop(1, '#A0A0A0');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);

    ctx.fillStyle = '#888';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('刮開看獎品', rect.width / 2, rect.height / 2);
  }, []);

  const calculateScratchPercentage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;

    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;
    let totalPixels = pixels.length / 4;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 128) {
        transparentPixels++;
      }
    }

    return Math.round((transparentPixels / totalPixels) * 100);
  }, []);

  const scratch = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    
    // Calculate coordinates relative to the canvas element (not the scaled canvas)
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();

    if (!hasStartedScratching) {
      setHasStartedScratching(true);
      onScratchStart();
    }

    const percentage = calculateScratchPercentage();
    setScratchPercentage(percentage);

    if (percentage >= REVEAL_THRESHOLD && !isRevealed) {
      setIsRevealed(true);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [hasStartedScratching, isRevealed, onScratchStart, calculateScratchPercentage]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsScratching(true);
    scratch(e.clientX, e.clientY);
  }, [scratch]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isScratching) {
      scratch(e.clientX, e.clientY);
    }
  }, [isScratching, scratch]);

  const handleMouseUp = useCallback(() => {
    setIsScratching(false);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    setIsScratching(true);
    scratch(touch.clientX, touch.clientY);
  }, [scratch]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (isScratching) {
      const touch = e.touches[0];
      scratch(touch.clientX, touch.clientY);
    }
  }, [isScratching, scratch]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsScratching(false);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      initializeCanvas();
    };

    initializeCanvas();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [initializeCanvas]);

  return (
    <div className={`relative ${className}`}>
      <div className="relative w-full aspect-[3/2] bg-white rounded-xl overflow-hidden shadow-2xl border-4 border-yellow-400">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
          <div className="text-center">
            {prize.image && (
              <img
                src={prize.image}
                alt={prize.text}
                className="w-24 h-24 object-cover rounded-lg mx-auto mb-4"
              />
            )}
            <h3 className="text-2xl font-bold text-gray-800 mb-2">恭喜獲得</h3>
            <p className="text-xl text-gray-700">{prize.text}</p>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-pointer touch-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      </div>

      {hasStartedScratching && !isRevealed && (
        <div className="mt-4 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 inline-block">
            <p className="text-sm text-gray-600">已刮開 {scratchPercentage}%</p>
            <div className="w-32 bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(scratchPercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};