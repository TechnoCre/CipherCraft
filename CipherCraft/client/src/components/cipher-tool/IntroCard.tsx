import { ArrowLeftRightIcon, ShieldCheckIcon, ZapIcon, UsersIcon } from "lucide-react";

export default function IntroCard() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Welcome to CipherCraft</h2>
      <p className="text-gray-600">
        Whether you're encrypting sensitive information or decrypting hidden messages, we've got you covered. 
        Simply input your text, choose an encryption method, and let our cutting-edge algorithms handle the rest.
      </p>
      <div className="mt-4 flex flex-wrap gap-4">
        <div className="flex items-center">
          <div className="bg-blue-100 p-2 rounded-full">
            <ArrowLeftRightIcon className="h-5 w-5 text-primary" />
          </div>
          <span className="ml-2 text-sm text-gray-700">User-friendly interface</span>
        </div>
        <div className="flex items-center">
          <div className="bg-emerald-100 p-2 rounded-full">
            <ShieldCheckIcon className="h-5 w-5 text-secondary" />
          </div>
          <span className="ml-2 text-sm text-gray-700">Advanced encryption standards</span>
        </div>
        <div className="flex items-center">
          <div className="bg-indigo-100 p-2 rounded-full">
            <ZapIcon className="h-5 w-5 text-accent" />
          </div>
          <span className="ml-2 text-sm text-gray-700">Instant processing</span>
        </div>
        <div className="flex items-center">
          <div className="bg-purple-100 p-2 rounded-full">
            <UsersIcon className="h-5 w-5 text-purple-500" />
          </div>
          <span className="ml-2 text-sm text-gray-700">Built for all skill levels</span>
        </div>
      </div>
    </div>
  );
}
