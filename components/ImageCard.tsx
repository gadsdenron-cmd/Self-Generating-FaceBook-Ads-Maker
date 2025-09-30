import React, { useState } from 'react';

interface ImageCardProps {
  base64Image: string;
  prompt: string;
  index: number;
}

const DownloadIcon: React.FC<{className: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const ClipboardIcon: React.FC<{className: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a2.25 2.25 0 01-2.25 2.25h-1.5a2.25 2.25 0 01-2.25-2.25v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
  </svg>
);

const CheckIcon: React.FC<{className: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);


const ImageCard: React.FC<ImageCardProps> = ({ base64Image, prompt, index }) => {
  const [isCopied, setIsCopied] = useState(false);
  const imageUrl = `data:image/jpeg;base64,${base64Image}`;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    const safePrompt = prompt.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
    link.download = `ad_creative_${safePrompt}_${index + 1}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy image:', error);
      alert('Failed to copy image to clipboard.');
    }
  };

  return (
    <div className="relative group aspect-square bg-slate-800 rounded-lg overflow-hidden">
      <img src={imageUrl} alt={prompt} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
        <button
          onClick={handleDownload}
          className="p-3 rounded-full bg-slate-100/20 text-white hover:bg-slate-100/30 transition-colors"
          aria-label="Download image"
        >
          <DownloadIcon className="w-6 h-6" />
        </button>
        <button
          onClick={handleCopy}
          className="p-3 rounded-full bg-slate-100/20 text-white hover:bg-slate-100/30 transition-colors"
          aria-label="Copy image"
        >
          {isCopied ? <CheckIcon className="w-6 h-6 text-green-400" /> : <ClipboardIcon className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
};

export default ImageCard;
