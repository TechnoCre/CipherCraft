import { useState } from 'react';
import { CheckIcon, ClipboardCopyIcon } from 'lucide-react';

interface ResultCardProps {
  result: {
    text: string;
    algorithm: string;
    mode: string;
    keySize: string;
    inputLength: number;
    outputLength: number;
    processingTime: number;
  };
}

export default function ResultCard({ result }: ResultCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyClick = () => {
    navigator.clipboard.writeText(result.text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Operation Result
        </h3>
      </div>
      <div className="p-6">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium text-gray-500">Output</h4>
            <button 
              type="button" 
              onClick={handleCopyClick}
              className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {copied ? (
                <>
                  <CheckIcon className="h-4 w-4 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <ClipboardCopyIcon className="h-4 w-4 mr-1" />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="bg-gray-50 rounded-md p-4 overflow-auto max-h-60">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap break-words">{result.text}</pre>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Encryption Info</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-gray-600">Algorithm:</span>
                  <span className="font-medium text-gray-900">{result.algorithm}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Mode:</span>
                  <span className="font-medium text-gray-900">{result.mode}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Key Size:</span>
                  <span className="font-medium text-gray-900">{result.keySize}</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Statistics</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-gray-600">Input Length:</span>
                  <span className="font-medium text-gray-900">{result.inputLength} characters</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Output Length:</span>
                  <span className="font-medium text-gray-900">{result.outputLength} characters</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Processing Time:</span>
                  <span className="font-medium text-gray-900">{result.processingTime} seconds</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
