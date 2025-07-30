'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { ScratchResult } from '@/lib/types';

interface ScratchCardProps {
    initialPrize: string;
    onScratchComplete: () => void;
    scratchedResult: ScratchResult | null;
}

export function ScratchCard({ initialPrize, onScratchComplete, scratchedResult }: ScratchCardProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const prizeDivRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [scratchedPercentage, setScratchedPercentage] = useState(0);
    const [apiCalled, setApiCalled] = useState(false);
    

    

    const checkScratchPercentage = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let transparent = 0;

        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] === 0) transparent++;
        }

        const percentage = (transparent / (pixels.length / 4)) * 100;
        setScratchedPercentage(percentage);
        

        if (percentage > 60) {
            canvas.style.transition = 'opacity 0.5s';
            canvas.style.opacity = '0';
            setTimeout(() => {
                if (canvas) canvas.style.display = 'none';
            }, 500);
        }
    }, [onScratchComplete]);

    const scratch = useCallback((x: number, y: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Call API only once on first touch
        if (!apiCalled) {
            setApiCalled(true);
            onScratchComplete();
        }

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.fill();

        checkScratchPercentage();
    }, [checkScratchPercentage, apiCalled, onScratchComplete]);

    const getCoordinates = useCallback((e: MouseEvent | TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        let x, y;

        if ('touches' in e) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        }

        // Scale coordinates to match canvas internal dimensions
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        return { 
            x: x * scaleX, 
            y: y * scaleY 
        };
    }, []);

    const initCard = useCallback(() => {
        const canvas = canvasRef.current;
        const prizeDiv = prizeDivRef.current;
        if (!canvas || !prizeDiv) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const container = canvas.parentElement;
        if (container) {
            // Set fixed dimensions to prevent growing
            const rect = container.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;
        }

        ctx.fillStyle = '#silver';
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#c0c0c0');
        gradient.addColorStop(0.5, '#e0e0e0');
        gradient.addColorStop(1, '#a0a0a0');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#666';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('SCRATCH HERE', canvas.width / 2, canvas.height / 2);

        canvas.style.display = 'block';
        canvas.style.opacity = '1';
        canvas.style.transition = 'none';
        setScratchedPercentage(0);
        setApiCalled(false);
    }, [initialPrize]);

    useEffect(() => {
        // Add a small delay to ensure container is fully rendered
        const timer = setTimeout(() => {
            initCard();
        }, 50);

        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleMouseDown = (e: MouseEvent) => {
            setIsDrawing(true);
            const { x, y } = getCoordinates(e);
            scratch(x, y);
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDrawing) return;
            const { x, y } = getCoordinates(e);
            scratch(x, y);
        };

        const handleMouseUp = () => {
            setIsDrawing(false);
        };

        const handleMouseLeave = () => {
            setIsDrawing(false);
        };

        const handleTouchStart = (e: TouchEvent) => {
            e.preventDefault();
            setIsDrawing(true);
            const { x, y } = getCoordinates(e);
            scratch(x, y);
        };

        const handleTouchMove = (e: TouchEvent) => {
            e.preventDefault();
            if (!isDrawing) return;
            const { x, y } = getCoordinates(e);
            scratch(x, y);
        };

        const handleTouchEnd = () => {
            setIsDrawing(false);
        };

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('mouseleave', handleMouseLeave);
        canvas.addEventListener('touchstart', handleTouchStart);
        canvas.addEventListener('touchmove', handleTouchMove);
        canvas.addEventListener('touchend', handleTouchEnd);

        const handleResize = () => {
            setTimeout(() => {
                initCard();
            }, 50);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            clearTimeout(timer);
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
            canvas.removeEventListener('touchstart', handleTouchStart);
            canvas.removeEventListener('touchmove', handleTouchMove);
            canvas.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('resize', handleResize);
        };
    }, [initCard, isDrawing, getCoordinates, scratch]);

    

    return (
        <div className="container">
            <div className="scratch-container">
                <div id="prize" ref={prizeDivRef}>
                    {scratchedResult ? (
                        <div className="prize-content">
                            <p className="text-2xl font-bold text-center mb-2">🎉</p>
                            <p className="text-lg font-semibold text-center mb-2">恭喜獲獎！</p>
                            <p className="text-lg text-center font-bold">{scratchedResult.prize.text}</p>
                            {scratchedResult.prize.image && (
                                <Image
                                    src={scratchedResult.prize.image}
                                    alt={scratchedResult.prize.text}
                                    width={150}
                                    height={150}
                                    className="mx-auto mt-3 rounded-lg"
                                />
                            )}
                        </div>
                    ) : (
                        <div className="prize-content">
                            <p className="text-3xl font-bold text-center mb-2">🎁</p>
                            <p className="text-lg font-semibold text-center mb-2">神秘獎品</p>
                            <p className="text-base text-center text-gray-600">刮開看看你的運氣！</p>
                        </div>
                    )}
                </div>
                <canvas id="scratch" ref={canvasRef}></canvas>
            </div>
        </div>
    );
}