'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import * as bodyPix from '@tensorflow-models/body-pix';
import '@tensorflow/tfjs';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Upload, X, Settings, ZoomIn, Brush, Download, Image as ImageIcon, Sparkles } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface SelectionPoint {
  x: number;
  y: number;
}

interface ProcessedImage {
  file: File;
  url: string;
  result: string | null;
}

export default function RemoveBgPage() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('high');
  const [zoom, setZoom] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionPoints, setSelectionPoints] = useState<SelectionPoint[]>([]);
  const [bgOption, setBgOption] = useState<'transparent' | 'white' | 'black' | 'custom'>('transparent');
  const [customBg, setCustomBg] = useState<File | null>(null);
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [currentImage, setCurrentImage] = useState<ProcessedImage | null>(null);
  const [doodleOverlay, setDoodleOverlay] = useState<'none' | 'stars' | 'hearts' | 'scribbles'>('none');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const selectionCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const formatRef = useRef<'png' | 'jpg' | 'webp'>('png');
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const bgDropZoneRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingBg, setIsDraggingBg] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Initialize Web Worker for background processing
    workerRef.current = new Worker(URL.createObjectURL(new Blob([`
      self.onmessage = async function(e) {
        importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js');
        importScripts('https://cdn.jsdelivr.net/npm/@tensorflow-models/body-pix@latest/dist/body-pix.min.js');
        const { imgData, width, height, quality } = e.data;
        try {
          const net = await bodyPix.load({
            architecture: 'ResNet50',
            outputStride: 16,
            quantBytes: 4,
          });
          const img = new ImageData(imgData, width, height);
          const segmentations = [];
          for (let i = 0; i < (quality === 'high' ? 4 : quality === 'medium' ? 3 : 2); i++) {
            const seg = await net.segmentPerson(img, {
              internalResolution: quality === 'high' ? 'full' : quality === 'medium' ? 'high' : 'medium',
              segmentationThreshold: quality === 'high' ? 0.98 - i * 0.02 : quality === 'medium' ? 0.92 - i * 0.02 : 0.85 - i * 0.02,
              maxDetections: 1,
              scoreThreshold: quality === 'high' ? 0.98 - i * 0.02 : quality === 'medium' ? 0.92 - i * 0.02 : 0.85 - i * 0.02,
            });
            segmentations.push(seg);
          }
          const combinedSegmentation = segmentations[0];
          for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
              const idx = y * width + x;
              let confidence = 0;
              for (const seg of segmentations) {
                confidence += seg.data[idx];
              }
              combinedSegmentation.data[idx] = confidence / segmentations.length > 0.65 ? 1 : 0;
            }
          }
          self.postMessage({ segmentation: combinedSegmentation });
        } catch (err) {
          self.postMessage({ error: err.message });
        }
      };
    `], { type: 'application/javascript' })));

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const advancedRefineMask = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    quality: string,
    selectionPoints: SelectionPoint[]
  ) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    const threshold = quality === 'high' ? 20 : quality === 'medium' ? 40 : 60;
    const featherRange = quality === 'high' ? 8 : 12;

    // Create selection mask
    let selectionMask: boolean[] | null = null;
    if (selectionPoints.length > 0) {
      selectionMask = new Array(width * height).fill(false);
      const tempCtx = document.createElement('canvas').getContext('2d');
      if (tempCtx) {
        tempCtx.canvas.width = width;
        tempCtx.canvas.height = height;
        tempCtx.beginPath();
        tempCtx.moveTo(selectionPoints[0].x, selectionPoints[0].y);
        for (let i = 1; i < selectionPoints.length; i++) {
          tempCtx.lineTo(selectionPoints[i].x, selectionPoints[i].y);
        }
        tempCtx.closePath();
        tempCtx.fill();
        const selectionData = tempCtx.getImageData(0, 0, width, height).data;
        for (let i = 0; i < selectionData.length; i += 4) {
          selectionMask[i / 4] = selectionData[i + 3] > 0;
        }
      }
    }

    // Color clustering for background detection
    const backgroundColors = new Set<number>();
    const sampleSize = 10;
    for (let y = 0; y < height; y += sampleSize) {
      for (let x = 0; x < width; x += sampleSize) {
        const i = (y * width + x) * 4;
        if (data[i + 3] < threshold) {
          const color = (data[i] << 16) | (data[i + 1] << 8) | data[i + 2];
          backgroundColors.add(color);
        }
      }
    }

    // Morphological operation for edge enhancement
    const tempData = new Uint8ClampedArray(data);
    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      const isSelected = selectionMask ? selectionMask[i / 4] : true;

      if (!isSelected) {
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = 0;
        continue;
      }

      const color = (data[i] << 16) | (data[i + 1] << 8) | data[i + 2];
      if (alpha < threshold || backgroundColors.has(color)) {
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = 0;
      } else if (alpha < threshold + featherRange) {
        const factor = (alpha - threshold) / featherRange;
        data[i + 3] = Math.round(factor * 255);
      } else {
        data[i + 3] = 255;
      }

      if (data[i + 3] > 0 && data[i + 3] < 255) {
        let r = 0, g = 0, b = 0, count = 0;
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const ni = i + (dy * width + dx) * 4;
            if (ni >= 0 && ni < data.length && tempData[ni + 3] > 0) {
              r += tempData[ni];
              g += tempData[ni + 1];
              b += tempData[ni + 2];
              count++;
            }
          }
        }
        if (count > 0) {
          data[i] = Math.round(r / count);
          data[i + 1] = Math.round(g / count);
          data[i + 2] = Math.round(b / count);
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const applyBackground = async (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    bgOption: string,
    customBg: File | null
  ) => {
    if (bgOption !== 'transparent') {
      ctx.globalCompositeOperation = 'destination-over';
      if (bgOption === 'custom' && customBg) {
        const bgImg = new Image();
        bgImg.src = URL.createObjectURL(customBg);
        await new Promise((resolve) => {
          bgImg.onload = resolve;
        });
        ctx.drawImage(bgImg, 0, 0, width, height);
      } else {
        ctx.fillStyle = bgOption === 'white' ? '#FFFFFF' : '#000000';
        ctx.fillRect(0, 0, width, height);
      }
      ctx.globalCompositeOperation = 'source-over';
    }
  };

  const applyDoodleOverlay = (ctx: CanvasRenderingContext2D, width: number, height: number, doodle: string) => {
    if (doodle === 'none') return;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(255, 165, 0, 0.6)';
    ctx.strokeStyle = 'rgba(255, 165, 0, 0.8)';
    ctx.lineWidth = 3;

    const count = quality === 'high' ? 50 : quality === 'medium' ? 30 : 15;
    for (let i = 0; i < count; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      if (doodle === 'stars') {
        ctx.beginPath();
        for (let j = 0; j < 5; j++) {
          const angle = (Math.PI * 2 * j) / 5;
          const radius = j % 2 === 0 ? 10 : 5;
          ctx.lineTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
        }
        ctx.closePath();
        ctx.fill();
      } else if (doodle === 'hearts') {
        ctx.beginPath();
        ctx.moveTo(x, y + 5);
        ctx.bezierCurveTo(x - 5, y, x - 10, y - 5, x, y - 10);
        ctx.bezierCurveTo(x + 10, y - 5, x + 5, y, x, y + 5);
        ctx.fill();
      } else if (doodle === 'scribbles') {
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let j = 0; j < 5; j++) {
          ctx.lineTo(x + (Math.random() - 0.5) * 20, y + (Math.random() - 0.5) * 20);
        }
        ctx.stroke();
      }
    }
  };

  const processImage = useCallback(
    async (file: File) => {
      try {
        setLoading(true);
        setError(null);
        setProgress(0);

        const url = URL.createObjectURL(file);
        const newProcessedImage: ProcessedImage = { file, url, result: null };
        setCurrentImage(newProcessedImage);

        const img = new Image();
        img.src = url;
        img.crossOrigin = 'anonymous';

        await new Promise((resolve) => {
          img.onload = resolve;
        });

        // Ensure canvases are initialized
        if (!canvasRef.current || !tempCanvasRef.current || !selectionCanvasRef.current || !previewCanvasRef.current) {
          throw new Error('Canvas elements not initialized. Please refresh the page.');
        }
        const canvas = canvasRef.current;
        const tempCanvas = tempCanvasRef.current;
        const selectionCanvas = selectionCanvasRef.current;
        const previewCanvas = previewCanvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
        const previewCtx = previewCanvas.getContext('2d', { willReadFrequently: true });
        if (!ctx || !tempCtx || !previewCtx) {
          throw new Error('Canvas context not available. Please refresh the page.');
        }

        // Dynamic resolution
        const maxDimension = quality === 'high' ? 4096 : quality === 'medium' ? 2048 : 1024;
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        canvas.width = width;
        canvas.height = height;
        tempCanvas.width = width;
        tempCanvas.height = height;
        selectionCanvas.width = width;
        selectionCanvas.height = height;
        previewCanvas.width = width;
        previewCanvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);
        setProgress(15);

        // Offload segmentation to Web Worker
        const imageData = ctx.getImageData(0, 0, width, height);
        const segmentation = await new Promise((resolve, reject) => {
          if (!workerRef.current) {
            reject(new Error('Worker not initialized'));
            return;
          }
          workerRef.current.onmessage = (e) => {
            if (e.data.error) {
              reject(new Error(e.data.error));
            } else {
              resolve(e.data.segmentation);
            }
          };
          workerRef.current.postMessage({ imgData: imageData.data, width, height, quality });
        });

        setProgress(70);

        // Create high-precision mask
        const mask = bodyPix.toMask(
          segmentation,
          { r: 0, g: 0, b: 0, a: 0 },
          { r: 255, g: 255, b: 255, a: 255 }
        );

        tempCtx.clearRect(0, 0, width, height);
        tempCtx.drawImage(img, 0, 0, width, height);
        await bodyPix.drawMask(
          tempCanvas,
          img,
          mask,
          1,
          quality === 'high' ? 0.3 : 0.5,
          false
        );

        setProgress(85);

        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(tempCanvas, 0, 0);
        advancedRefineMask(ctx, width, height, quality, selectionPoints);

        await applyBackground(ctx, width, height, bgOption, customBg);
        applyDoodleOverlay(ctx, width, height, doodleOverlay);

        setProgress(95);

        const dataURL = canvas.toDataURL(`image/${formatRef.current}`, quality === 'high' ? 1.0 : 0.9);
        setProcessedImages((prev) =>
          prev.map((img) => (img.file === file ? { ...img, result: dataURL } : img)).concat(
            prev.find((img) => img.file === file) ? [] : [newProcessedImage]
          )
        );
        setCurrentImage((prev) => (prev ? { ...prev, result: dataURL } : prev));

        // Update preview
        previewCtx.clearRect(0, 0, width, height);
        previewCtx.drawImage(canvas, 0, 0);
        setPreviewUrl(previewCanvas.toDataURL(`image/${formatRef.current}`));
      } catch (err) {
        setError(`Failed to process image: ${err.message}. Try refreshing the page or using a different image.`);
        console.error(err);
      } finally {
        setLoading(false);
        setProgress(0);
      }
    },
    [quality, selectionPoints, bgOption, customBg, doodleOverlay]
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []).filter((file) => file.type.startsWith('image/'));
    if (newFiles.length) {
      setProcessedImages((prev) => [
        ...prev,
        ...newFiles.map((file) => ({ file, url: URL.createObjectURL(file), result: null })),
      ]);
      processImage(newFiles[0]);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const newFiles = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith('image/'));
      if (newFiles.length) {
        setProcessedImages((prev) => [
          ...prev,
          ...newFiles.map((file) => ({ file, url: URL.createObjectURL(file), result: null })),
        ]);
        processImage(newFiles[0]);
      } else {
        setError('Please drop valid image files');
      }
    },
    [processImage]
  );

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setCustomBg(file);
      setBgOption('custom');
    }
  };

  const handleBgDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingBg(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setCustomBg(file);
      setBgOption('custom');
    } else {
      setError('Please drop a valid background image');
    }
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleBgDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingBg(true);
  };

  const handleBgDragLeave = () => {
    setIsDraggingBg(false);
  };

  const handleReset = () => {
    setCurrentImage(null);
    setProcessedImages([]);
    setError(null);
    setZoom(false);
    setSelectionPoints([]);
    setCustomBg(null);
    setBgOption('transparent');
    setDoodleOverlay('none');
    setPreviewUrl(null);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    if (tempCanvasRef.current) {
      const ctx = tempCanvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, tempCanvasRef.current.width, tempCanvasRef.current.height);
    }
    if (selectionCanvasRef.current) {
      const ctx = selectionCanvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, selectionCanvasRef.current.width, selectionCanvasRef.current.height);
    }
    if (previewCanvasRef.current) {
      const ctx = previewCanvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, previewCanvasRef.current.width, previewCanvasRef.current.height);
    }
  };

  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    formatRef.current = e.target.value as 'png' | 'jpg' | 'webp';
    if (canvasRef.current && currentImage?.result) {
      const newUrl = canvasRef.current.toDataURL(`image/${formatRef.current}`, quality === 'high' ? 1.0 : 0.9);
      setProcessedImages((prev) =>
        prev.map((img) => (img.file === currentImage.file ? { ...img, result: newUrl } : img))
      );
      setCurrentImage((prev) => (prev ? { ...prev, result: newUrl } : prev));
      setPreviewUrl(newUrl);
    }
  };

  const handleQualityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuality(e.target.value as 'low' | 'medium' | 'high');
  };

  const handleBgOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBgOption(e.target.value as 'transparent' | 'white' | 'black' | 'custom');
    if (canvasRef.current && currentImage?.result) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(tempCanvasRef.current!, 0, 0);
        advancedRefineMask(ctx, canvasRef.current.width, canvasRef.current.height, quality, selectionPoints);
        applyBackground(ctx, canvasRef.current.width, canvasRef.current.height, e.target.value, customBg).then(() => {
          applyDoodleOverlay(ctx, canvasRef.current.width, canvasRef.current.height, doodleOverlay);
          const newUrl = canvasRef.current.toDataURL(`image/${formatRef.current}`, quality === 'high' ? 1.0 : 0.9);
          setProcessedImages((prev) =>
            prev.map((img) => (img.file === currentImage.file ? { ...img, result: newUrl } : img))
          );
          setCurrentImage((prev) => (prev ? { ...prev, result: newUrl } : prev));
          setPreviewUrl(newUrl);
        });
      }
    }
  };

  const handleDoodleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDoodleOverlay(e.target.value as 'none' | 'stars' | 'hearts' | 'scribbles');
    if (canvasRef.current && currentImage?.result) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(tempCanvasRef.current!, 0, 0);
        advancedRefineMask(ctx, canvasRef.current.width, canvasRef.current.height, quality, selectionPoints);
        applyBackground(ctx, canvasRef.current.width, canvasRef.current.height, bgOption, customBg).then(() => {
          applyDoodleOverlay(ctx, canvasRef.current.width, canvasRef.current.height, e.target.value);
          const newUrl = canvasRef.current.toDataURL(`image/${formatRef.current}`, quality === 'high' ? 1.0 : 0.9);
          setProcessedImages((prev) =>
            prev.map((img) => (img.file === currentImage.file ? { ...img, result: newUrl } : img))
          );
          setCurrentImage((prev) => (prev ? { ...prev, result: newUrl } : prev));
          setPreviewUrl(newUrl);
        });
      }
    }
  };

  const toggleZoom = () => {
    setZoom(!zoom);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSelecting || !selectionCanvasRef.current) return;
    const rect = selectionCanvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (selectionCanvasRef.current.width / rect.width);
    const y = (e.clientY - rect.top) * (selectionCanvasRef.current.height / rect.height);
    setSelectionPoints((prev) => [...prev, { x, y }]);
  };

  const drawSelection = () => {
    if (!selectionCanvasRef.current || !isSelecting) return;
    const ctx = selectionCanvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, selectionCanvasRef.current.width, selectionCanvasRef.current.height);
    if (selectionPoints.length > 0) {
      ctx.beginPath();
      ctx.moveTo(selectionPoints[0].x, selectionPoints[0].y);
      for (let i = 1; i < selectionPoints.length; i++) {
        ctx.lineTo(selectionPoints[i].x, selectionPoints[i].y);
      }
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.stroke();
      if (selectionPoints.length > 2) {
        ctx.lineTo(selectionPoints[0].x, selectionPoints[0].y);
        ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
        ctx.fill();
      }
    }
  };

  const handleApplySelection = () => {
    if (currentImage) {
      processImage(currentImage.file);
    }
    setIsSelecting(false);
  };

  const handleFileSelect = (file: File) => {
    setSelectionPoints([]);
    const selected = processedImages.find((img) => img.file === file);
    if (selected) {
      setCurrentImage(selected);
      setPreviewUrl(selected.result);
      if (!selected.result) {
        processImage(file);
      }
    }
  };

  const handleDownloadAll = async () => {
    const zip = new JSZip();
    for (const img of processedImages) {
      if (img.result) {
        const base64Data = img.result.split(',')[1];
        zip.file(`no-background-${img.file.name}.${formatRef.current}`, base64Data, { base64: true });
      }
    }
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'processed-images.zip');
  };

  useEffect(() => {
    drawSelection();
  }, [selectionPoints, isSelecting]);

  useEffect(() => {
    return () => {
      processedImages.forEach((img) => {
        URL.revokeObjectURL(img.url);
        if (img.result) URL.revokeObjectURL(img.result);
      });
      if (customBg) URL.revokeObjectURL(URL.createObjectURL(customBg));
    };
  }, [processedImages, customBg]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-10 max-w-6xl w-full overflow-hidden"
      >
        <motion.h1
          className="text-5xl font-extrabold text-blue-900 text-center mb-6"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 120 }}
        >
         Background Remover
        </motion.h1>
        <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
           Select an image and remove the background using the magic wand tool.
        </p>

        <motion.div
          className="flex flex-wrap justify-center gap-6 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-gray-600 animate-spin-slow" />
            <label htmlFor="quality" className="text-sm font-semibold text-gray-600">
              Quality:
            </label>
            <select
              id="quality"
              onChange={handleQualityChange}
              value={quality}
              className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
            >
              <option value="low">Low (Fast)</option>
              <option value="medium">Medium</option>
              <option value="high">High (Studio Quality)</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <ImageIcon className="w-6 h-6 text-gray-600" />
            <label htmlFor="bgOption" className="text-sm font-semibold text-gray-600">
              Background:
            </label>
            <select
              id="bgOption"
              onChange={handleBgOptionChange}
              value={bgOption}
              className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
            >
              <option value="transparent">Transparent</option>
              <option value="white">White</option>
              <option value="black">Black</option>
              <option value="custom">Custom Image</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-gray-600 animate-pulse" />
            <label htmlFor="doodle" className="text-sm font-semibold text-gray-600">
              Doodle:
            </label>
            <select
              id="doodle"
              onChange={handleDoodleChange}
              value={doodleOverlay}
              className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
            >
              <option value="none">None</option>
              <option value="stars">Stars</option>
              <option value="hearts">Hearts</option>
              <option value="scribbles">Scribbles</option>
            </select>
          </div>
          {bgOption === 'custom' && (
            <motion.div
              ref={bgDropZoneRef}
              onDragOver={handleBgDragOver}
              onDragLeave={handleBgDragLeave}
              onDrop={handleBgDrop}
              className={`flex items-center gap-2 border-2 border-dashed rounded-lg p-2 transition-all ${
                isDraggingBg ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleBgUpload}
                className="hidden"
                id="bg-upload"
              />
              <label
                htmlFor="bg-upload"
                className="cursor-pointer text-sm text-blue-600 hover:text-blue-700"
              >
                {customBg ? 'Change Background' : 'Upload Background'}
              </label>
              {customBg && <span className="text-sm text-gray-500">{customBg.name}</span>}
            </motion.div>
          )}
        </motion.div>

        <motion.div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-10 mb-8 transition-all duration-300 ${
            isDragging ? 'border-blue-500 bg-blue-50 scale-105' : 'border-gray-300'
          }`}
          initial={{ y: 20 }}
          animate={{ y: 0 }}
        >
          <div className="flex flex-col items-center gap-4">
            <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
              <Upload className="w-16 h-16 text-gray-400" />
            </motion.div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
            >
              Select Images
            </label>
            <p className="text-sm text-gray-500">or drag and drop multiple images (JPEG, PNG, WEBP)</p>
          </div>
        </motion.div>

        {processedImages.length > 0 && (
          <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-700">Selected Images</h3>
              <button
                onClick={handleDownloadAll}
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                disabled={processedImages.every((img) => !img.result)}
              >
                <Download className="w-4 h-4" />
                Download All
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {processedImages.map((img, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleFileSelect(img.file)}
                  className={`flex-shrink-0 p-2 border rounded-lg hover:bg-gray-100 ${
                    currentImage?.file === img.file ? 'border-blue-500' : ''
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img src={img.url} alt={img.file.name} className="w-20 h-20 object-cover rounded" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 text-center"
            >
              {error}
              <button
                onClick={() => setError(null)}
                className="ml-2 text-red-900 underline"
              >
                Dismiss
              </button>
            </motion.div>
          )}

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
              <div className="w-64 bg-gray-200 rounded-full h-3">
                <motion.div
                  className="bg-blue-600 h-3 rounded-full"
                  style={{ width: `${progress}%` }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-gray-600 font-medium">Processing image... {progress}%</p>
            </motion.div>
          )}
        </AnimatePresence>

        {currentImage && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-semibold text-gray-700">Original Image</h2>
                <motion.button
                  onClick={() => setIsSelecting(!isSelecting)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isSelecting
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  <Brush className="w-4 h-4" />
                  {isSelecting ? 'Cancel Selection' : 'Select Foreground'}
                </motion.button>
              </div>
              <div className="relative">
                <img src={currentImage.url} alt="Original" className="max-w-full h-auto rounded-lg shadow-lg" />
                {isSelecting && (
                  <canvas
                    ref={selectionCanvasRef}
                    className="absolute top-0 left-0 w-full h-full cursor-crosshair"
                    onClick={handleCanvasClick}
                  />
                )}
                {isSelecting && selectionPoints.length > 0 && (
                  <motion.button
                    onClick={handleApplySelection}
                    className="absolute bottom-2 right-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    whileHover={{ scale: 1.05 }}
                  >
                    Apply Selection
                  </motion.button>
                )}
              </div>
            </div>

            {previewUrl && (
              <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-3">Live Preview</h2>
                <motion.img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full h-auto rounded-lg shadow-lg bg-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}

            {currentImage.result && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xl font-semibold text-gray-700">Processed Image</h2>
                  <motion.button
                    onClick={toggleZoom}
                    className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                    title={zoom ? 'Zoom Out' : 'Zoom In'}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ZoomIn className="w-5 h-5" />
                  </motion.button>
                </div>
                <img
                  src={currentImage.result}
                  alt="Processed"
                  className={`max-w-full h-auto rounded-lg shadow-lg bg-transparent transition-transform duration-300 ${
                    zoom ? 'scale-150' : 'scale-100'
                  }`}
                />
                <motion.div
                  className="flex gap-4 items-center mt-4 flex-wrap"
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                >
                  <div className="flex items-center gap-2">
                    <label htmlFor="format" className="text-sm font-semibold text-gray-600">
                      Format:
                    </label>
                    <select
                      id="format"
                      onChange={handleFormatChange}
                      className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                    >
                      <option value="png">PNG (Transparent)</option>
                      <option value="jpg">JPG</option>
                      <option value="webp">WEBP</option>
                    </select>
                  </div>
                  <a
                    href={currentImage.result}
                    download={`no-background-${currentImage.file.name}.${formatRef.current}`}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Download
                  </a>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium"
                  >
                    <X className="w-4 h-4" />
                    Reset All
                  </button>
                </motion.div>
              </div>
            )}
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
        <canvas ref={tempCanvasRef} className="hidden" />
        <canvas ref={selectionCanvasRef} className="hidden" />
        <canvas ref={previewCanvasRef} className="hidden" />
      </motion.div>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
      `}</style>
    </div>
  );
}