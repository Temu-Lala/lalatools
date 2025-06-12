'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Moon,
  Sun,
  Clipboard,
  Download,
  Upload,
  Image as ImageIcon,
  X,
  Maximize,
  Minimize
} from 'lucide-react';
import { saveAs } from 'file-saver';

export default function ImageToBase64() {
  const [base64String, setBase64String] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [decodeInput, setDecodeInput] = useState('');
  const [decodeError, setDecodeError] = useState('');
  const [imageDetails, setImageDetails] = useState<{ size: string; dimensions: string } | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [isBase64Expanded, setIsBase64Expanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load theme from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const dark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDarkMode(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  };

  // Image dimensions/size calculator
  const getImageDetails = (fileOrBase64: File | string) => {
    const img = new Image();
    img.onload = () => {
      const dimensions = `${img.width} x ${img.height}`;
      let size = '';
      if (fileOrBase64 instanceof File) {
        size = `${(fileOrBase64.size / 1024).toFixed(2)} KB`;
      } else {
        size = `${((fileOrBase64.length * 3) / 4 / 1024).toFixed(2)} KB`;
      }
      setImageDetails({ size, dimensions });
    };
    img.src = typeof fileOrBase64 === 'string'
      ? fileOrBase64
      : URL.createObjectURL(fileOrBase64);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setDecodeError('Invalid file type. Please select an image.');
      return;
    }
    setDecodeError('');
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result as string;
      setBase64String(data);
      setImagePreview(data);
      getImageDetails(file);
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDecode = () => {
    if (!decodeInput.startsWith('data:image/')) {
      setDecodeError('Must start with "data:image/".');
      return;
    }
    setDecodeError('');
    setFileName('decoded-image');
    setBase64String(decodeInput);
    setImagePreview(decodeInput);
    getImageDetails(decodeInput);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) processFile(e.dataTransfer.files[0]);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(base64String);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      setDecodeError('Copy to clipboard failed.');
    }
  };

  const downloadTxt = () => {
    const blob = new Blob([base64String], { type: 'text/plain' });
    saveAs(blob, `${fileName.split('.')[0] || 'image'}.txt`);
  };

  const downloadImg = () => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.drawImage(img, 0, 0);
      canvas.toBlob(blob => {
        if (blob) saveAs(blob, `${fileName.split('.')[0]}.${downloadFormat}`);
      }, `image/${downloadFormat}`);
    };
    img.src = base64String;
  };

  const clearAll = () => {
    setBase64String('');
    setImagePreview('');
    setFileName('');
    setDecodeInput('');
    setDecodeError('');
    setImageDetails(null);
    setIsBase64Expanded(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
   

      <main className="max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* INPUT */}
        <section className="space-y-6">
          <div className="flex gap-4">
            {(['encode', 'decode'] as const).map(type => (
              <button
                key={type}
                onClick={() => { setMode(type); clearAll(); }}
                className={`flex-1 py-2 font-semibold rounded-lg transition ${
                  mode === type
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {type === 'encode' ? 'Encode Image' : 'Decode Base64'}
              </button>
            ))}
          </div>

          {mode === 'encode' ? (
            <div
              className={`border-4 border-dashed rounded-lg p-8 text-center transition ${
                isDragging
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              aria-label="Upload or drop an image"
            >
              <Upload size={48} className="mx-auto text-gray-500 dark:text-gray-400 mb-4" />
              <p className="text-lg">Drag & drop or click to upload</p>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileUpdate}
                hidden
              />
            </div>
          ) : (
            <div className="space-y-4">
              <label className="block text-lg font-semibold">Paste Base64 string below:</label>
              <textarea
                value={decodeInput}
                onChange={e => setDecodeInput(e.target.value)}
                placeholder="data:image/png;base64,..."
                className="w-full h-40 bg-gray-200 dark:bg-gray-700 p-4 font-mono rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring"
              />
              {decodeError && <p className="text-red-500 text-sm">{decodeError}</p>}
              <button
                onClick={handleDecode}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <ImageIcon size={16} /> Decode
              </button>
            </div>
          )}

          <button
            onClick={clearAll}
            className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center gap-2"
          >
            <X size={16} /> Clear All
          </button>
        </section>

        {/* OUTPUT */}
        <section className="space-y-6">
          {imagePreview && (
            <>
              <h2 className="text-xl font-semibold">Image Preview</h2>
              <div className="relative">
                <img src={imagePreview} alt="preview" className="w-full rounded shadow" />
                {imageDetails && (
                  <div className="mt-2 text-gray-700 dark:text-gray-300 text-sm">
                    <p><strong>Name:</strong> {fileName}</p>
                    <p><strong>Size:</strong> {imageDetails.size}</p>
                    <p><strong>Dimensions:</strong> {imageDetails.dimensions}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {base64String && (
            <>
              <h2 className="text-xl font-semibold">Base64 Output</h2>
              <div className="relative">
                <textarea
                  readOnly
                  value={
                    isBase64Expanded
                      ? base64String
                      : base64String.slice(0, 120) + (base64String.length > 120 ? '...' : '')
                  }
                  className="w-full h-40 p-4 bg-gray-200 dark:bg-gray-700 font-mono text-sm rounded-lg border border-gray-300 dark:border-gray-600 resize-none"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={() => setIsBase64Expanded(x => !x)}
                    className="p-2 bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    {isBase64Expanded ? <Minimize size={16} /> : <Maximize size={16} />}
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                  >
                    <Clipboard size={16} /> {copySuccess ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-4">
                  <label className="font-medium">Download as:</label>
                  <select
                    value={downloadFormat}
                    onChange={e => setDownloadFormat(e.target.value as any)}
                    className="p-2 bg-gray-200 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600"
                  >
                    <option value="png">PNG</option>
                    <option value="jpeg">JPEG</option>
                    <option value="webp">WEBP</option>
                  </select>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={downloadTxt}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <Download size={16} /> Download Base64 (.txt)
                  </button>
                  <button
                    onClick={downloadImg}
                    className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
                  >
                    <Download size={16} /> Download Image (.{downloadFormat})
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
