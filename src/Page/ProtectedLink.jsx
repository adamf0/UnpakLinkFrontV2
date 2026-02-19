import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

export default function ProtectedLink() {
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
        
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-12 h-12 flex items-center justify-center">
            <img src="https://unpak.link/assets/logo.svg"/>
          </div>
          <span className="text-xl font-semibold text-gray-800">unpak.link</span>
        </div>

        {/* Lock + Title */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Lock className="w-5 h-5 text-gray-500" />
            <span className="text-xl font-semibold text-gray-800">
              <span className="text-red-500">unpak.link</span>/1R4Tb
            </span>
          </div>
          <p className="text-gray-600 text-sm">
            Masukan Kode Rahasia untuk melanjutkan
          </p>
        </div>

        {/* Input */}
        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="------"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Button */}
        <button className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-lg transition duration-200">
          Lanjutkan
        </button>

        {/* Disclaimer */}
        <div className="mt-6 text-xs text-gray-500 text-center leading-relaxed">
          This link is generated user content and be careful for
          phishing/scam/malware. We never ask for your information details.
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-8 text-xs text-gray-500">
          <div className="flex gap-2">
            <span>© unpak.link 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}
