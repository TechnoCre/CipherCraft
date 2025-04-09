import { useState, useRef } from "react";
import { 
  LockIcon, 
  UnlockIcon, 
  EyeIcon, 
  EyeOffIcon, 
  DownloadIcon
} from "lucide-react";
import { encrypt, decrypt, generateRandomKey } from "@/lib/cipher";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type InsertCipherHistory, type CipherHistory } from "@shared/schema";

interface CipherToolProps {
  setResult: React.Dispatch<React.SetStateAction<{
    text: string;
    algorithm: string;
    mode: string;
    keySize: string;
    inputLength: number;
    outputLength: number;
    processingTime: number;
  } | null>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function CipherTool({ setResult, setError }: CipherToolProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showDecryptAdvancedOptions, setShowDecryptAdvancedOptions] = useState(false);
  const [showEncryptionKey, setShowEncryptionKey] = useState(false);
  const [showDecryptionKey, setShowDecryptionKey] = useState(false);
  const [keyStrength, setKeyStrength] = useState<'Weak' | 'Medium' | 'Strong'>('Medium');
  const [keyStrengthColor, setKeyStrengthColor] = useState('text-amber-500');
  
  // Mutation for saving cipher history
  const saveCipherHistoryMutation = useMutation({
    mutationFn: (historyData: InsertCipherHistory) => 
      apiRequest('/api/cipher-history', { method: 'POST', body: historyData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cipher-history'] });
    }
  });
  
  // Form inputs
  const [inputText, setInputText] = useState('');
  const [encryptionKey, setEncryptionKey] = useState('');
  const [encryptionMethod, setEncryptionMethod] = useState('aes');
  const [keySize, setKeySize] = useState('128');
  const [modeOfOperation, setModeOfOperation] = useState('CBC');
  const [initializationVector, setInitializationVector] = useState('');
  
  const [inputCiphertext, setInputCiphertext] = useState('');
  const [decryptionKey, setDecryptionKey] = useState('');
  const [decryptionMethod, setDecryptionMethod] = useState('aes');
  const [decryptKeySize, setDecryptKeySize] = useState('128');
  const [decryptModeOfOperation, setDecryptModeOfOperation] = useState('CBC');
  const [decryptInitializationVector, setDecryptInitializationVector] = useState('');

  const descriptions = {
    'aes': 'AES is a symmetric encryption algorithm widely used for secure data transmission.',
    'des': 'DES is a symmetric-key algorithm for encryption, now considered insecure due to its small key size.',
    'triple-des': 'Triple DES applies the DES algorithm three times to each data block, increasing security.',
    'rc4': 'RC4 is a stream cipher used in protocols like SSL and WPA, but now considered insecure for some applications.'
  };

  const handleGenerateKey = () => {
    const newKey = generateRandomKey(16);
    setEncryptionKey(newKey);
    setShowEncryptionKey(true);
    setKeyStrength('Strong');
    setKeyStrengthColor('text-green-500');
  };

  const handleEncryptClick = () => {
    try {
      if (!inputText.trim()) {
        setError("Please enter text to encrypt.");
        return;
      }
      
      if (!encryptionKey.trim()) {
        setError("Please provide an encryption key.");
        return;
      }

      const startTime = performance.now();
      const encrypted = encrypt(
        inputText, 
        encryptionKey, 
        encryptionMethod,
        showAdvancedOptions ? {
          keySize: parseInt(keySize),
          mode: modeOfOperation,
          iv: initializationVector || undefined
        } : undefined
      );
      const endTime = performance.now();
      const processingTime = parseFloat(((endTime - startTime) / 1000).toFixed(3));
      
      const result = {
        text: encrypted,
        algorithm: `${encryptionMethod.toUpperCase()}-${showAdvancedOptions ? keySize : '128'}`,
        mode: showAdvancedOptions ? modeOfOperation : 'CBC',
        keySize: `${showAdvancedOptions ? keySize : '128'} bits`,
        inputLength: inputText.length,
        outputLength: encrypted.length,
        processingTime
      };
      
      setResult(result);
      
      // Save to database
      saveCipherHistoryMutation.mutate({
        operation: 'encrypt',
        algorithm: encryptionMethod,
        mode: showAdvancedOptions ? modeOfOperation : 'CBC',
        keySize: showAdvancedOptions ? keySize : '128',
        inputLength: inputText.length,
        outputLength: encrypted.length,
        processingTime: processingTime.toString(),
        inputText: inputText.length > 1000 ? inputText.substring(0, 1000) + "..." : inputText,
        outputText: encrypted.length > 1000 ? encrypted.substring(0, 1000) + "..." : encrypted
      });
      
      setError(null);
    } catch (error) {
      if (error instanceof Error) {
        setError(`Encryption error: ${error.message}`);
      } else {
        setError("An unknown error occurred during encryption.");
      }
      setResult(null);
    }
  };

  const handleDecryptClick = () => {
    try {
      if (!inputCiphertext.trim()) {
        setError("Please enter text to decrypt.");
        return;
      }
      
      if (!decryptionKey.trim()) {
        setError("Please provide a decryption key.");
        return;
      }

      const startTime = performance.now();
      const decrypted = decrypt(
        inputCiphertext, 
        decryptionKey, 
        decryptionMethod,
        showDecryptAdvancedOptions ? {
          keySize: parseInt(decryptKeySize),
          mode: decryptModeOfOperation,
          iv: decryptInitializationVector || undefined
        } : undefined
      );
      const endTime = performance.now();
      const processingTime = parseFloat(((endTime - startTime) / 1000).toFixed(3));
      
      const result = {
        text: decrypted,
        algorithm: `${decryptionMethod.toUpperCase()}-${showDecryptAdvancedOptions ? decryptKeySize : '128'}`,
        mode: showDecryptAdvancedOptions ? decryptModeOfOperation : 'CBC',
        keySize: `${showDecryptAdvancedOptions ? decryptKeySize : '128'} bits`,
        inputLength: inputCiphertext.length,
        outputLength: decrypted.length,
        processingTime
      };
      
      setResult(result);
      
      // Save to database
      saveCipherHistoryMutation.mutate({
        operation: 'decrypt',
        algorithm: decryptionMethod,
        mode: showDecryptAdvancedOptions ? decryptModeOfOperation : 'CBC',
        keySize: showDecryptAdvancedOptions ? decryptKeySize : '128',
        inputLength: inputCiphertext.length,
        outputLength: decrypted.length,
        processingTime: processingTime.toString(),
        inputText: inputCiphertext.length > 1000 ? inputCiphertext.substring(0, 1000) + "..." : inputCiphertext,
        outputText: decrypted.length > 1000 ? decrypted.substring(0, 1000) + "..." : decrypted
      });
      
      setError(null);
    } catch (error) {
      if (error instanceof Error) {
        setError(`Decryption error: ${error.message}`);
      } else {
        setError("An unknown error occurred during decryption.");
      }
      setResult(null);
    }
  };

  const clearEncryptFields = () => {
    setInputText('');
    setEncryptionKey('');
    setInitializationVector('');
    setResult(null);
    setError(null);
  };

  const clearDecryptFields = () => {
    setInputCiphertext('');
    setDecryptionKey('');
    setDecryptInitializationVector('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      <div className="border-b border-gray-200">
        <nav className="flex" aria-label="Tabs">
          <button 
            onClick={() => setActiveTab('encrypt')}
            className={`bg-white inline-flex items-center px-4 py-2 border-b-2 ${
              activeTab === 'encrypt' 
                ? 'border-primary text-sm font-medium text-primary' 
                : 'border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            aria-current={activeTab === 'encrypt' ? 'page' : undefined}
          >
            <LockIcon className="h-5 w-5 mr-2" />
            Encrypt
          </button>
          <button 
            onClick={() => setActiveTab('decrypt')}
            className={`bg-white inline-flex items-center px-4 py-2 border-b-2 ${
              activeTab === 'decrypt' 
                ? 'border-primary text-sm font-medium text-primary' 
                : 'border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            aria-current={activeTab === 'decrypt' ? 'page' : undefined}
          >
            <UnlockIcon className="h-5 w-5 mr-2" />
            Decrypt
          </button>
        </nav>
      </div>

      {/* Encrypt Tab */}
      <div className={`p-6 ${activeTab !== 'encrypt' ? 'hidden' : ''}`}>
        <div className="space-y-6">
          <div>
            <label htmlFor="input-text" className="block text-sm font-medium text-gray-700 mb-1">Text to Encrypt</label>
            <textarea 
              id="input-text" 
              rows={4} 
              className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md resize-y" 
              placeholder="Enter the text you want to encrypt..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="encryption-method" className="block text-sm font-medium text-gray-700 mb-1">Encryption Method</label>
              <select 
                id="encryption-method" 
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                value={encryptionMethod}
                onChange={(e) => setEncryptionMethod(e.target.value)}
              >
                <option value="aes">AES (Advanced Encryption Standard)</option>
                <option value="des">DES (Data Encryption Standard)</option>
                <option value="triple-des">Triple DES</option>
                <option value="rc4">RC4 (Rivest Cipher 4)</option>
              </select>
              <div className="mt-1 text-xs text-gray-500">
                {descriptions[encryptionMethod as keyof typeof descriptions] || 'Select an encryption method'}
              </div>
            </div>

            <div>
              <label htmlFor="encryption-key" className="block text-sm font-medium text-gray-700 mb-1">Encryption Key</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input 
                  type={showEncryptionKey ? "text" : "password"} 
                  id="encryption-key" 
                  className="focus:ring-primary focus:border-primary block w-full pr-10 sm:text-sm border-gray-300 rounded-md" 
                  placeholder="Enter encryption key"
                  value={encryptionKey}
                  onChange={(e) => setEncryptionKey(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button 
                    type="button" 
                    onClick={() => setShowEncryptionKey(!showEncryptionKey)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    {showEncryptionKey ? (
                      <EyeOffIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="mt-2 flex items-center">
                <button 
                  type="button" 
                  onClick={handleGenerateKey}
                  className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Generate Key
                </button>
                <div className="ml-2 text-xs text-gray-500">
                  Key strength: <span id="key-strength" className={`font-medium ${keyStrengthColor}`}>{keyStrength}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <div className="flex items-center h-5">
              <input 
                id="advanced-options" 
                type="checkbox" 
                className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                checked={showAdvancedOptions}
                onChange={() => setShowAdvancedOptions(!showAdvancedOptions)}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="advanced-options" className="font-medium text-gray-700">Show advanced options</label>
            </div>
          </div>

          {/* Advanced options */}
          <div className={`p-4 bg-gray-50 rounded-md border border-gray-200 ${!showAdvancedOptions ? 'hidden' : ''}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="key-size" className="block text-sm font-medium text-gray-700">Key Size</label>
                <select 
                  id="key-size" 
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                  value={keySize}
                  onChange={(e) => setKeySize(e.target.value)}
                >
                  <option value="128">128-bit</option>
                  <option value="192">192-bit</option>
                  <option value="256">256-bit</option>
                </select>
              </div>
              <div>
                <label htmlFor="mode-of-operation" className="block text-sm font-medium text-gray-700">Mode of Operation</label>
                <select 
                  id="mode-of-operation" 
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                  value={modeOfOperation}
                  onChange={(e) => setModeOfOperation(e.target.value)}
                >
                  <option value="CBC">CBC - Cipher Block Chaining</option>
                  <option value="ECB">ECB - Electronic Codebook</option>
                  <option value="CFB">CFB - Cipher Feedback</option>
                  <option value="OFB">OFB - Output Feedback</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="initialization-vector" className="block text-sm font-medium text-gray-700">Initialization Vector (IV)</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input 
                  type="text" 
                  id="initialization-vector" 
                  className="focus:ring-primary focus:border-primary flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300" 
                  placeholder="Enter IV or leave blank for random generation"
                  value={initializationVector}
                  onChange={(e) => setInitializationVector(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={() => setInitializationVector(generateRandomKey(16))}
                  className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 rounded-r-md hover:text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                >
                  Generate
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={clearEncryptFields}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Clear
            </button>
            <button 
              type="button" 
              onClick={handleEncryptClick}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <DownloadIcon className="h-5 w-5 mr-2" />
              Encrypt
            </button>
          </div>
        </div>
      </div>

      {/* Decrypt Tab */}
      <div className={`p-6 ${activeTab !== 'decrypt' ? 'hidden' : ''}`}>
        <div className="space-y-6">
          <div>
            <label htmlFor="input-ciphertext" className="block text-sm font-medium text-gray-700 mb-1">Encrypted Text to Decrypt</label>
            <textarea 
              id="input-ciphertext" 
              rows={4} 
              className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md resize-y" 
              placeholder="Enter the encrypted text you want to decrypt..."
              value={inputCiphertext}
              onChange={(e) => setInputCiphertext(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="decryption-method" className="block text-sm font-medium text-gray-700 mb-1">Decryption Method</label>
              <select 
                id="decryption-method" 
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                value={decryptionMethod}
                onChange={(e) => setDecryptionMethod(e.target.value)}
              >
                <option value="aes">AES (Advanced Encryption Standard)</option>
                <option value="des">DES (Data Encryption Standard)</option>
                <option value="triple-des">Triple DES</option>
                <option value="rc4">RC4 (Rivest Cipher 4)</option>
              </select>
            </div>

            <div>
              <label htmlFor="decryption-key" className="block text-sm font-medium text-gray-700 mb-1">Decryption Key</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input 
                  type={showDecryptionKey ? "text" : "password"} 
                  id="decryption-key" 
                  className="focus:ring-primary focus:border-primary block w-full pr-10 sm:text-sm border-gray-300 rounded-md" 
                  placeholder="Enter decryption key"
                  value={decryptionKey}
                  onChange={(e) => setDecryptionKey(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button 
                    type="button" 
                    onClick={() => setShowDecryptionKey(!showDecryptionKey)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    {showDecryptionKey ? (
                      <EyeOffIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <div className="flex items-center h-5">
              <input 
                id="advanced-decrypt-options" 
                type="checkbox" 
                className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                checked={showDecryptAdvancedOptions}
                onChange={() => setShowDecryptAdvancedOptions(!showDecryptAdvancedOptions)}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="advanced-decrypt-options" className="font-medium text-gray-700">Show advanced options</label>
            </div>
          </div>

          {/* Advanced options for decryption */}
          <div className={`p-4 bg-gray-50 rounded-md border border-gray-200 ${!showDecryptAdvancedOptions ? 'hidden' : ''}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="decrypt-key-size" className="block text-sm font-medium text-gray-700">Key Size</label>
                <select 
                  id="decrypt-key-size" 
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                  value={decryptKeySize}
                  onChange={(e) => setDecryptKeySize(e.target.value)}
                >
                  <option value="128">128-bit</option>
                  <option value="192">192-bit</option>
                  <option value="256">256-bit</option>
                </select>
              </div>
              <div>
                <label htmlFor="decrypt-mode-of-operation" className="block text-sm font-medium text-gray-700">Mode of Operation</label>
                <select 
                  id="decrypt-mode-of-operation" 
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                  value={decryptModeOfOperation}
                  onChange={(e) => setDecryptModeOfOperation(e.target.value)}
                >
                  <option value="CBC">CBC - Cipher Block Chaining</option>
                  <option value="ECB">ECB - Electronic Codebook</option>
                  <option value="CFB">CFB - Cipher Feedback</option>
                  <option value="OFB">OFB - Output Feedback</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="decrypt-initialization-vector" className="block text-sm font-medium text-gray-700">Initialization Vector (IV)</label>
              <input 
                type="text" 
                id="decrypt-initialization-vector" 
                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" 
                placeholder="Enter the IV used during encryption"
                value={decryptInitializationVector}
                onChange={(e) => setDecryptInitializationVector(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={clearDecryptFields}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Clear
            </button>
            <button 
              type="button" 
              onClick={handleDecryptClick}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
            >
              <DownloadIcon className="h-5 w-5 mr-2" />
              Decrypt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
