import { useState, useEffect } from "react";
import { LockIcon, MoonIcon, SunIcon } from "lucide-react";

export default function Header() {
  const [darkMode, setDarkMode] = useState(false);
  
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <header className="mb-8">
      <div className="flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center mb-4 sm:mb-0">
          <div className="bg-primary p-2 rounded-lg mr-3">
            <LockIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">CipherCraft</h1>
        </div>
        <div className="flex space-x-2">
          <button 
            type="button" 
            onClick={toggleDarkMode}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            {darkMode ? (
              <>
                <SunIcon className="h-5 w-5 mr-2" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <MoonIcon className="h-5 w-5 mr-2" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </div>
      </div>
      <p className="mt-2 text-gray-600 text-center sm:text-left">Transform your cryptographic needs with our cutting-edge encryption tool</p>
    </header>
  );
}
