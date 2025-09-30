import React from 'react';
import { AdCampaign, GeneratedImages } from '../types';
import Section from './ui/Section';
import CopyButton from './ui/CopyButton';
import Button from './ui/Button';
import { Spinner } from './ui/Spinner';
import ImageCard from './ImageCard';

interface AdDashboardProps {
  campaign: AdCampaign;
  onReset: () => void;
  generatedImages: GeneratedImages | null;
  isGeneratingImages: boolean;
  isRedoingImage: string | null;
  onGenerateAllImages: () => void;
  onRedoImagesForPrompt: (prompt: string) => void;
}

const AdDashboard: React.FC<AdDashboardProps> = ({ 
  campaign, 
  onReset,
  generatedImages,
  isGeneratingImages,
  isRedoingImage,
  onGenerateAllImages,
  onRedoImagesForPrompt
}) => {
  const { hooks, scripts, ctas, imagePrompts } = campaign;

  const handleDownloadAll = () => {
    if (!generatedImages) return;
    Object.entries(generatedImages).forEach(([prompt, images]) => {
      images.forEach((base64, index) => {
        const link = document.createElement('a');
        link.href = `data:image/jpeg;base64,${base64}`;
        const safePrompt = prompt.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
        link.download = `ad_creative_${safePrompt}_${index + 1}.jpeg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-sky-400">Your Ad Campaign Kit is Ready!</h2>
        <p className="text-slate-400 mt-2">Copy, paste, and start testing your new campaign.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Section title="Hooks (Attention Grabbers)">
          <ul className="space-y-3">
            {hooks.map((hook, index) => (
              <li key={index} className="flex items-start justify-between p-3 bg-slate-800/50 rounded-md">
                <span className="text-slate-300 flex-1 pr-2">"{hook}"</span>
                <CopyButton textToCopy={hook} />
              </li>
            ))}
          </ul>
        </Section>
        
        <Section title="Calls to Action (CTAs)">
          <ul className="space-y-3">
            {ctas.map((cta, index) => (
              <li key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-md">
                <span className="text-slate-300 flex-1 pr-2">"{cta}"</span>
                <CopyButton textToCopy={cta} />
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <Section title="Ad Scripts">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Object.entries(scripts).map(([key, value]) => (
            <div key={key} className="p-4 bg-slate-800/50 rounded-lg flex flex-col">
              <div className="flex justify-between items-center mb-2">
                 <h4 className="font-bold text-sky-400 capitalize">{key.replace(/([A-Z])/g, ' $1')} Style</h4>
                 <CopyButton textToCopy={value} />
              </div>
              <p className="text-slate-300 text-sm flex-grow">{value}</p>
            </div>
          ))}
        </div>
      </Section>
      
      <Section title="Ad Creatives">
        <div className="flex flex-col items-center">
          {isGeneratingImages && (
            <div className="text-center">
              <Spinner />
              <p className="mt-4 text-slate-400">Generating image variations... This can take a minute.</p>
            </div>
          )}

          {!isGeneratingImages && !generatedImages && (
            <div className="text-center">
              <p className="text-slate-300 mb-4">Your campaign is ready. Now, let's generate visual ideas for your ads.</p>
              <Button onClick={onGenerateAllImages} size="large">Generate 1 Image Idea for Each Prompt</Button>
            </div>
          )}

          {generatedImages && !isGeneratingImages && (
            <div className="w-full flex justify-end mb-4">
              <Button onClick={handleDownloadAll} variant="secondary">
                Download All Images
              </Button>
            </div>
          )}
        </div>

        {generatedImages && (
          <ul className="space-y-6 mt-4">
            {imagePrompts.map((prompt) => (
              <li key={prompt} className="p-4 bg-slate-900/30 border border-slate-700 rounded-lg">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-3">
                  <p className="text-slate-300 flex-1 pr-4 font-medium">{prompt}</p>
                  <Button 
                    onClick={() => onRedoImagesForPrompt(prompt)} 
                    disabled={!!isRedoingImage}
                    variant="secondary"
                    className="flex-shrink-0"
                  >
                    {isRedoingImage === prompt ? 'Redoing...' : '↻ Redo'}
                  </Button>
                </div>
                
                <div className="min-h-[100px] flex items-center justify-center">
                  {isRedoingImage === prompt ? (
                      <Spinner />
                  ) : (
                    generatedImages[prompt] ? (
                      <div className="w-full sm:w-1/2 mx-auto">
                        {generatedImages[prompt].map((imgSrc, imgIndex) => (
                          <ImageCard key={`${prompt}-${imgIndex}`} base64Image={imgSrc} prompt={prompt} index={imgIndex} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500">Image generation failed for this prompt.</p>
                    )
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <div className="text-center pt-8">
        <Button onClick={onReset} size="large">
          Create Another Campaign
        </Button>
      </div>
    </div>
  );
};

export default AdDashboard;