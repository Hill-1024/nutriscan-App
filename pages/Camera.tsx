import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera as CapacitorCamera } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { identifyFood } from '../services/aiService';
import { AppRoute } from '../types';

export const Camera: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const navigate = useNavigate();

    const [permissionState, setPermissionState] = useState<'loading' | 'granted' | 'denied' | 'prompt'>('loading');
    const [isStreaming, setIsStreaming] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // 1. Initial Permission Check
    useEffect(() => {
        checkAndRequestPermission();
    }, []);

    // 2. Start Camera Effect - Only runs when permission is explicitly granted
    useEffect(() => {
        if (permissionState === 'granted') {
            startCameraStream();
        }
        return () => stopCameraStream();
    }, [permissionState]);

    const checkAndRequestPermission = async () => {
        if (!Capacitor.isNativePlatform()) {
            setPermissionState('granted'); // Browser assumes prompt happens on getUserMedia
            return;
        }

        try {
            const check = await CapacitorCamera.checkPermissions();
            if (check.camera === 'granted') {
                setPermissionState('granted');
            } else {
                // If not granted, try to request immediately once
                const req = await CapacitorCamera.requestPermissions({ permissions: ['camera'] });
                setPermissionState(req.camera === 'granted' ? 'granted' : 'denied');
            }
        } catch (e) {
            console.error("Permission check failed", e);
            // Fallback: assume we can try anyway, or set denied to show manual button
            setPermissionState('denied');
        }
    };

    const manualRequestPermission = async () => {
        try {
            const req = await CapacitorCamera.requestPermissions({ permissions: ['camera'] });
            if (req.camera === 'granted') {
                setPermissionState('granted');
            } else {
                setPermissionState('denied');
                // If permanently denied, guide user to settings might be needed, but for now alert
                alert("请在系统设置中允许 NutriScan 访问相机");
            }
        } catch (e) {
            alert("请求权限出错，请尝试手动上传");
        }
    };

    const stopCameraStream = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsStreaming(false);
    };

    const startCameraStream = async () => {
        stopCameraStream(); // Ensure clean slate

        // Try different constraints: HD Environment -> Environment -> Any Video
        const constraintsOptions = [
            { video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false },
            { video: { facingMode: 'environment' }, audio: false },
            { video: true, audio: false }
        ];

        for (const constraints of constraintsOptions) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    streamRef.current = stream;

                    // Wait for metadata to load to ensure dimensions are correct
                    videoRef.current.onloadedmetadata = async () => {
                        try {
                            await videoRef.current?.play();
                            setIsStreaming(true);
                        } catch (e) {
                            console.error("Video play failed", e);
                        }
                    };
                    return; // Success
                }
            } catch (err) {
                console.warn(`Camera constraint failed: ${JSON.stringify(constraints)}`, err);
            }
        }

        console.error("All camera attempts failed.");
        // Note: We don't automatically fallback to file input here to allow user to retry or see error
    };

    const getResizedBase64 = (sourceCanvas: HTMLCanvasElement, width: number, height: number): string => {
        const MAX_DIMENSION = 1024;
        let newWidth = width;
        let newHeight = height;

        if (width > height) {
            if (width > MAX_DIMENSION) {
                newHeight = Math.round(height * (MAX_DIMENSION / width));
                newWidth = MAX_DIMENSION;
            }
        } else {
            if (height > MAX_DIMENSION) {
                newWidth = Math.round(width * (MAX_DIMENSION / height));
                newHeight = MAX_DIMENSION;
            }
        }

        if (newWidth !== width || newHeight !== height) {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = newWidth;
            tempCanvas.height = newHeight;
            const ctx = tempCanvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(sourceCanvas, 0, 0, newWidth, newHeight);
                return tempCanvas.toDataURL('image/jpeg', 0.7).split(',')[1];
            }
        }
        return sourceCanvas.toDataURL('image/jpeg', 0.7).split(',')[1];
    };

    const processImage = async (base64Data: string) => {
        setIsProcessing(true);
        try {
            const result = await identifyFood(base64Data);
            if (result) {
                navigate(AppRoute.RESULT, { state: { result } });
            } else {
                alert('无法识别食物，请重试。');
            }
        } catch (error: any) {
            console.error(error);
            alert(`分析失败: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCapture = async () => {
        if (isProcessing) return;

        if (isStreaming && videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            if (video.videoWidth === 0 || video.videoHeight === 0) {
                fileInputRef.current?.click();
                return;
            }

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const base64Data = getResizedBase64(canvas, canvas.width, canvas.height);
                await processImage(base64Data);
            }
        } else {
            // Fallback if not streaming (e.g. permission denied but user clicked shutter anyway, or browser issue)
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0);
                        const base64Data = getResizedBase64(canvas, img.width, img.height);
                        processImage(base64Data);
                    }
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="relative flex h-screen w-full flex-col bg-black overflow-hidden font-display">
            {/* Camera Feed */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`absolute inset-0 w-full h-full object-cover ${!isStreaming ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
            />
            <canvas ref={canvasRef} className="hidden" />

            <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40 pointer-events-none"></div>

            {/* Status Messages / Permission Request UI */}
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                {!isStreaming && permissionState === 'loading' && (
                    <p className="text-white/50 text-sm animate-pulse">正在启动相机...</p>
                )}
                {permissionState === 'denied' && (
                    <div className="flex flex-col items-center gap-4 bg-black/60 p-6 rounded-2xl backdrop-blur-md pointer-events-auto">
                        <p className="text-white font-bold">需要相机权限</p>
                        <p className="text-white/70 text-sm text-center max-w-[200px]">请允许访问相机以进行实时识别</p>
                        <button
                            onClick={manualRequestPermission}
                            className="px-6 py-2 bg-primary text-white rounded-full font-bold text-sm"
                        >
                            允许相机
                        </button>
                    </div>
                )}
            </div>

            {/* Top Control Bar */}
            <div className="absolute top-0 left-0 w-full z-30 pt-12 pb-4 px-6 flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="group flex items-center justify-center size-10 rounded-full bg-white/20 backdrop-blur-md transition-all active:scale-95 hover:bg-white/30">
                    <span className="material-symbols-outlined text-white text-[24px]">close</span>
                </button>
                <button className="group flex items-center justify-center size-10 rounded-full bg-white/20 backdrop-blur-md transition-all active:scale-95 hover:bg-white/30">
                    <span className="material-symbols-outlined text-white text-[24px]">flash_off</span>
                </button>
            </div>

            {/* Focus Frame Area */}
            <div className="relative flex-1 flex items-center justify-center pointer-events-none z-20">
                <div className="relative w-72 h-72 border-[1.5px] border-white/90 rounded-[2rem] shadow-[0_0_0_9999px_rgba(0,0,0,0.2)]">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white -mt-[1.5px] -ml-[1.5px] rounded-tl-[2rem]"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white -mt-[1.5px] -mr-[1.5px] rounded-tr-[2rem]"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white -mb-[1.5px] -ml-[1.5px] rounded-bl-[2rem]"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white -mb-[1.5px] -mr-[1.5px] rounded-br-[2rem]"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-2 bg-white/50 rounded-full"></div>
                </div>
            </div>

            {/* Bottom Actions Container */}
            <div className="absolute bottom-0 left-0 w-full z-30 pb-10 pt-12 px-8 flex flex-col items-center gap-6">
                {/* Helper Text */}
                <div className="bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                    <p className="text-white text-sm font-medium tracking-wide flex items-center gap-2">
                        {isProcessing ? (
                            <>
                                <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                                分析中...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-secondary text-[18px] icon-filled">center_focus_strong</span>
                                对准食物拍照
                            </>
                        )}
                    </p>
                </div>

                {/* Controls Row */}
                <div className="flex items-center justify-between w-full max-w-sm">
                    {/* Gallery Access */}
                    <button
                        onClick={() => {
                            if (fileInputRef.current) {
                                fileInputRef.current.removeAttribute('capture');
                                fileInputRef.current.click();
                            }
                        }}
                        className="group flex flex-col items-center gap-1 active:scale-95 transition-transform"
                    >
                        <div className="size-12 rounded-xl overflow-hidden border-2 border-white/30 bg-white/10 relative shadow-lg">
                            <div className="absolute inset-0 bg-cover bg-center opacity-80 group-hover:opacity-100 transition-opacity" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDgAqtucudMF4pKlP1Qh51rUThVWjhnRPEI6TFlrcbDy2y8o2b6ESGqIRweqDDwM3dJ7b3cGMewAz5IcngduTYLxhIqnyHxPhXn8UltQktMYYuCM1MY93dkyDRTG_tLNWSPiTr1BI2AbhYFXBrYCerNMHPrB4e4SMJ02LChPMN1_m2x4B9_tVFhYu5bKLYfpON-dPT6sw7xWhu3PMv2snH0lKx_glOq298LN8T0uFKz0YY2wRLDETrB1AC3mWAGbxxxOKxME4BZ-A")'}}></div>
                        </div>
                    </button>

                    {/* Shutter Button */}
                    <div className="relative group cursor-pointer" onClick={handleCapture}>
                        <div className={`absolute -inset-1 rounded-full border border-secondary/40 opacity-0 scale-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-300 ${isProcessing ? 'hidden' : ''}`}></div>
                        <button disabled={isProcessing} className="relative flex items-center justify-center size-20 rounded-full bg-primary shadow-[0_4px_20px_rgba(113,172,83,0.4)] border-[4px] border-white/20 transition-all duration-200 active:scale-90 active:border-white/40 disabled:opacity-50 disabled:scale-100">
                            <span className="sr-only">拍照</span>
                            <div className="size-16 rounded-full bg-white/10"></div>
                        </button>
                    </div>

                    {/* Manual Input Fallback */}
                    <button
                        onClick={() => {
                            if (fileInputRef.current) {
                                fileInputRef.current.setAttribute('capture', 'environment');
                                fileInputRef.current.click();
                            }
                        }}
                        className="group flex items-center justify-center size-12 rounded-full bg-white/20 backdrop-blur-md border border-white/10 text-white transition-all active:scale-95 hover:bg-white/30 shadow-lg"
                    >
                        <span className="material-symbols-outlined text-[24px]">keyboard</span>
                    </button>
                </div>
            </div>
        </div>
    );
};