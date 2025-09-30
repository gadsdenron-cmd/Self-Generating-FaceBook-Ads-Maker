import React, { useState, useCallback } from 'react';
import { AppStep, AdCampaign, OfferType, GeneratedImages } from './types';
import { generateProblems, generateAdCampaign, generateImagesFromPrompts } from './services/geminiService';
import UserInputForm from './components/UserInputForm';
import ProblemSelector from './components/ProblemSelector';
import OfferTypeSelector from './components/OfferTypeSelector';
import AdDashboard from './components/AdDashboard';
import { Spinner } from './components/ui/Spinner';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.USER_INPUT);
  const [productDescription, setProductDescription] = useState<string>('');
  const [avatarDescription, setAvatarDescription] = useState<string>('');
  const [generatedProblems, setGeneratedProblems] = useState<string[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<string>('');
  const [offerType, setOfferType] = useState<OfferType | null>(null);
  const [adCampaign, setAdCampaign] = useState<AdCampaign | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImages | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState<boolean>(false);
  const [isRedoingImage, setIsRedoingImage] = useState<string | null>(null); // Stores the prompt being redone
  const [error, setError] = useState<string | null>(null);

  const handleUserInputSubmit = useCallback(async (product: string, avatar: string) => {
    setIsLoading(true);
    setError(null);
    setProductDescription(product);
    setAvatarDescription(avatar);
    try {
      const problems = await generateProblems(product, avatar);
      setGeneratedProblems(problems);
      setStep(AppStep.PROBLEM_DISCOVERY);
    } catch (err) {
      setError('Failed to generate problems. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleProblemSelect = useCallback((problem: string) => {
    setSelectedProblem(problem);
    setStep(AppStep.OFFER_ALIGNMENT);
  }, []);

  const handleOfferTypeSelect = useCallback(async (type: OfferType) => {
    setOfferType(type);
    setStep(AppStep.GENERATING);
    setIsLoading(true);
    setError(null);
    try {
      const campaign = await generateAdCampaign(
        productDescription,
        avatarDescription,
        selectedProblem,
        type
      );
      setAdCampaign(campaign);
      setStep(AppStep.DASHBOARD);
    } catch (err) {
      setError('Failed to generate the ad campaign. Please try again.');
      setStep(AppStep.OFFER_ALIGNMENT);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [productDescription, avatarDescription, selectedProblem]);
  
  const handleGenerateAllImages = useCallback(async () => {
    if (!adCampaign) return;
    setIsGeneratingImages(true);
    setError(null);
    try {
      const images = await generateImagesFromPrompts(adCampaign.imagePrompts);
      setGeneratedImages(images);
    } catch (err) {
      setError('Failed to generate images. Please try again.');
      console.error(err);
    } finally {
      setIsGeneratingImages(false);
    }
  }, [adCampaign]);

  const handleRedoImagesForPrompt = useCallback(async (prompt: string) => {
    setIsRedoingImage(prompt);
    setError(null);
    try {
      const newImages = await generateImagesFromPrompts([prompt]);
      setGeneratedImages(prev => ({ ...prev, ...newImages }));
    } catch (err) {
      setError('Failed to regenerate images for this prompt. Please try again.');
      console.error(err);
    } finally {
      setIsRedoingImage(null);
    }
  }, []);

  const handleReset = useCallback(() => {
    setStep(AppStep.USER_INPUT);
    setProductDescription('');
    setAvatarDescription('');
    setGeneratedProblems([]);
    setSelectedProblem('');
    setOfferType(null);
    setAdCampaign(null);
    setGeneratedImages(null);
    setError(null);
    setIsLoading(false);
    setIsGeneratingImages(false);
    setIsRedoingImage(null);
  }, []);

  const renderContent = () => {
    switch (step) {
      case AppStep.USER_INPUT:
        return <UserInputForm onSubmit={handleUserInputSubmit} isLoading={isLoading} />;
      case AppStep.PROBLEM_DISCOVERY:
        return <ProblemSelector problems={generatedProblems} onSelect={handleProblemSelect} avatarDescription={avatarDescription} />;
      case AppStep.OFFER_ALIGNMENT:
        return <OfferTypeSelector onSelect={handleOfferTypeSelect} selectedProblem={selectedProblem} />;
      case AppStep.GENERATING:
        return (
          <div className="flex flex-col items-center justify-center text-center p-8">
            <Spinner />
            <h2 className="text-2xl font-bold text-sky-400 mt-6">Generating Your Campaign...</h2>
            <p className="text-slate-400 mt-2">The AI is crafting the perfect hooks, scripts, and visuals. This might take a moment.</p>
          </div>
        );
      case AppStep.DASHBOARD:
        return adCampaign ? (
          <AdDashboard 
            campaign={adCampaign} 
            onReset={handleReset}
            generatedImages={generatedImages}
            isGeneratingImages={isGeneratingImages}
            isRedoingImage={isRedoingImage}
            onGenerateAllImages={handleGenerateAllImages}
            onRedoImagesForPrompt={handleRedoImagesForPrompt}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 sm:p-6 lg:p-8">
      <main className="max-w-7xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">
            Self-Generating Ad Creator
          </h1>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
            Go from product and avatar to a complete ad campaign in minutes.
          </p>
        </header>
        
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative mb-6 max-w-3xl mx-auto" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <div className="transition-all duration-500">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
