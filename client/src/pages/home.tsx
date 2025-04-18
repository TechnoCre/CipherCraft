import Header from "@/components/cipher-tool/Header";
import IntroCard from "@/components/cipher-tool/IntroCard";
import CipherTool from "@/components/cipher-tool/CipherTool";
import { useState } from "react";
import ResultCard from "@/components/cipher-tool/ResultCard";
import ErrorCard from "@/components/cipher-tool/ErrorCard";
import HistoryPanel from "@/components/cipher-tool/HistoryPanel";

export default function Home() {
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    text: string;
    algorithm: string;
    mode: string;
    keySize: string;
    inputLength: number;
    outputLength: number;
    processingTime: number;
  } | null>(null);

  const dismissError = () => {
    setError(null);
  };

  return (
    <div className="bg-background font-sans text-foreground min-h-screen">
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-5xl">
        <Header />
        
        <main>
          <IntroCard />
          <CipherTool 
            setResult={setResult}
            setError={setError}
          />
          
          {result && (
            <ResultCard 
              result={result} 
            />
          )}
          
          {error && (
            <ErrorCard 
              message={error}
              dismiss={dismissError}
            />
          )}
          
          {/* Cipher history section */}
          <HistoryPanel />
        </main>
        
        <footer className="mt-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="border-t border-border py-8 md:flex md:items-center md:justify-between">
              <div className="flex space-x-6 md:order-2">
                <a href="https://github.com" className="text-muted-foreground hover:text-foreground transition-colors">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
                  </svg>
                </a>
              </div>
              <div className="mt-8 md:mt-0 md:order-1">
                <p className="text-center text-base text-muted-foreground">&copy; {new Date().getFullYear()} CipherCraft. All rights reserved.</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
