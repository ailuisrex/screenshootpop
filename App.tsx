
import React, { useState, useCallback } from 'react';
import { generateGameSceneImage } from './services/geminiService';

const Header: React.FC = () => (
  <header className="text-center p-4 md:p-6">
    <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-white to-yellow-400">
      Heroic Popcorn Saga
    </h1>
    <p className="text-gray-300 mt-2 text-lg">AI-Powered Scene Generator</p>
  </header>
);

const LoadingSpinner: React.FC = () => (
    <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col justify-center items-center z-20 transition-opacity duration-300">
        <svg className="animate-spin h-12 w-12 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-white text-lg font-semibold">Crafting cinematic brilliance...</p>
    </div>
);

interface ImageDisplayProps {
  imageUrl: string | null;
  isLoading: boolean;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ imageUrl, isLoading }) => (
    <div className="aspect-video w-full max-w-5xl bg-gray-800/50 rounded-lg shadow-2xl overflow-hidden relative border-2 border-yellow-500/30 flex justify-center items-center">
        {isLoading && <LoadingSpinner />}
        {!imageUrl && !isLoading && (
            <div className="text-center text-gray-400 p-8">
                <h2 className="text-2xl font-semibold">Your Scene Awaits</h2>
                <p className="mt-2">Click the button below to generate the epic moment.</p>
            </div>
        )}
        {imageUrl && (
            <img 
                src={imageUrl} 
                alt="Generated game scene of a heroic popcorn box" 
                className="object-cover w-full h-full transition-opacity duration-700 ease-in-out opacity-0"
                onLoad={(e) => (e.currentTarget.style.opacity = '1')}
            />
        )}
    </div>
);

const GenerateButton: React.FC<{ onClick: () => void; disabled: boolean }> = ({ onClick, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="
            mt-8 px-8 py-4 bg-gradient-to-r from-red-600 to-yellow-500 text-white font-bold text-xl 
            rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 
            ease-in-out focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:ring-opacity-50
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
    >
        <div className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span>Generate Scene</span>
        </div>
    </button>
);


export default function App() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateClick = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setImageUrl(null); // Clear previous image for better loading feel

    try {
      const generatedUrl = await generateGameSceneImage();
      setImageUrl(generatedUrl);
    } catch (err) {
      if (err instanceof Error) {
        setError(`An error occurred: ${err.message}`);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center justify-center p-4">
        <main className="w-full max-w-6xl flex flex-col items-center">
            <Header />

            <ImageDisplay imageUrl={imageUrl} isLoading={isLoading} />
            
            {error && (
              <div className="mt-6 p-4 bg-red-800/50 border border-red-700 text-red-200 rounded-lg text-center max-w-2xl">
                <p><strong>Generation Failed</strong></p>
                <p className="mt-1 text-sm">{error}</p>
              </div>
            )}
            
            <GenerateButton onClick={handleGenerateClick} disabled={isLoading} />
        </main>
        <footer className="text-center text-gray-500 text-sm p-4 mt-auto">
            <p>Powered by Google Gemini API. Concept Art Generator.</p>
        </footer>
    </div>
  );
}
