
import React, { useState, useCallback, useEffect } from 'react';
import { generateGameSceneImage } from './services/geminiService';

const STORAGE_KEY = 'heroic-popcorn-saga-gallery';
const MAX_GALLERY_ITEMS = 6;

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
                alt="Generated game scene of a heroic character" 
                className="object-cover w-full h-full transition-opacity duration-700 ease-in-out opacity-0"
                onLoad={(e) => (e.currentTarget.style.opacity = '1')}
            />
        )}
    </div>
);

const characterOptions = [
    { id: 'popcorn', name: 'Popcorn Box', emoji: '🍿' },
    { id: 'soda', name: 'Soda Can', emoji: '🥤' },
    { id: 'pizza', name: 'Pizza Slice', emoji: '🍕' },
    { id: 'hotdog', name: 'Hot Dog', emoji: '🌭' },
];

interface CharacterSelectorProps {
    selectedCharacter: string;
    onCharacterChange: (id: string) => void;
}

const CharacterSelector: React.FC<CharacterSelectorProps> = ({ selectedCharacter, onCharacterChange }) => (
    <div className="mt-8 w-full max-w-lg">
        <h3 className="text-lg font-semibold text-center text-gray-300 mb-4">Choose Your Hero</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {characterOptions.map((char) => (
                <button
                    key={char.id}
                    onClick={() => onCharacterChange(char.id)}
                    className={`
                        p-4 rounded-lg flex flex-col items-center justify-center transition-all duration-200
                        border-2 
                        ${selectedCharacter === char.id 
                            ? 'bg-yellow-500/20 border-yellow-400 scale-105 shadow-lg' 
                            : 'bg-gray-700/50 border-gray-600 hover:bg-gray-600/50 hover:border-gray-500'
                        }
                    `}
                    aria-pressed={selectedCharacter === char.id}
                >
                    <span className="text-4xl">{char.emoji}</span>
                    <span className="mt-2 font-semibold text-sm text-white">{char.name}</span>
                </button>
            ))}
        </div>
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

interface ImageGalleryProps {
    images: string[];
    selectedImage: string | null;
    onSelectImage: (url: string) => void;
    onClearGallery: () => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, selectedImage, onSelectImage, onClearGallery }) => (
    <section className="w-full max-w-5xl mt-12 animate-fade-in">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-300">Recently Generated</h2>
            <button
                onClick={onClearGallery}
                className="flex items-center text-sm text-gray-400 hover:text-white transition-colors duration-200 p-2 rounded-md hover:bg-gray-700/50"
                aria-label="Clear gallery"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear
            </button>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {images.map((imgSrc, index) => (
                <button
                    key={index}
                    onClick={() => onSelectImage(imgSrc)}
                    className={`
                        relative aspect-square rounded-lg overflow-hidden focus:outline-none transition-all duration-200
                        ${selectedImage === imgSrc ? 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-gray-900' : 'ring-2 ring-transparent hover:ring-gray-500'}
                    `}
                    aria-label={`Select generated image ${index + 1}`}
                >
                    <img
                        src={imgSrc}
                        alt={`Generated scene thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                    />
                </button>
            ))}
        </div>
    </section>
);


export default function App() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [character, setCharacter] = useState<string>('popcorn');

  useEffect(() => {
    try {
      const storedGallery = localStorage.getItem(STORAGE_KEY);
      if (storedGallery) {
        const parsedGallery = JSON.parse(storedGallery);
        if (Array.isArray(parsedGallery) && parsedGallery.length > 0) {
          setGallery(parsedGallery);
          setImageUrl(parsedGallery[0]); // Display the most recent image on load
        }
      }
    } catch (e) {
      console.error("Failed to load gallery from local storage:", e);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const handleGenerateClick = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const generatedUrl = await generateGameSceneImage(character);
      setImageUrl(generatedUrl);
      
      setGallery(prevGallery => {
        const newGallery = [generatedUrl, ...prevGallery].filter((v, i, a) => a.indexOf(v) === i).slice(0, MAX_GALLERY_ITEMS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newGallery));
        return newGallery;
      });

    } catch (err) {
      if (err instanceof Error) {
        setError(`An error occurred: ${err.message}`);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [character]);

  const handleSelectImage = (url: string) => {
    setImageUrl(url);
  };

  const handleClearGallery = () => {
    setGallery([]);
    setImageUrl(null);
    localStorage.removeItem(STORAGE_KEY);
  };

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
            
            <CharacterSelector selectedCharacter={character} onCharacterChange={setCharacter} />

            <GenerateButton onClick={handleGenerateClick} disabled={isLoading} />

            {gallery.length > 0 && (
                <ImageGallery 
                    images={gallery} 
                    selectedImage={imageUrl}
                    onSelectImage={handleSelectImage}
                    onClearGallery={handleClearGallery}
                />
            )}
        </main>
        <footer className="text-center text-gray-500 text-sm p-4 mt-auto">
            <p>Powered by Google Gemini API. Concept Art Generator.</p>
        </footer>
    </div>
  );
}
