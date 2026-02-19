import React from "react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#1f1f1f] flex items-center justify-center px-6">
      <div className="text-center">
        
        {/* 404 */}
        <h1 className="text-[110px] md:text-[150px] font-extrabold text-gray-300 leading-none">
          404
        </h1>

        {/* Illustration */}
        <div className="relative flex justify-center mt-6 mb-8">
          <div className="relative">

            {/* Shadow */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-48 h-8 bg-black/40 rounded-full blur-md"></div>

            {/* Logo Container */}
            <div className="relative w-48 h-48 flex items-center justify-center">
              
              {/* Logo Image */}
              <img
                src="https://unpak.link/assets/logo.svg"   // <-- ganti dengan path logo kamu
                alt="Logo"
                className="w-48 h-48 object-contain"
              />

              {/* Eyes */}
              <div className="absolute top-10 left-14 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow">
                <div className="w-3 h-3 bg-black rounded-full"></div>
              </div>

              <div className="absolute top-10 right-14 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow">
                <div className="w-3 h-3 bg-black rounded-full"></div>
              </div>
            </div>

            {/* Question Mark */}
            <span className="absolute -right-5 top-6 rotate-25 text-orange-400 text-5xl font-bold">
              ?
            </span>
          </div>
        </div>

        {/* Text */}
        <p className="text-gray-400 text-base md:text-lg mb-5">
          The link you’re want visit is not found on our universe
        </p>

        {/* s.id text */}
        <div className="mt-6 text-gray-300 font-semibold text-lg">
          unpak.link
        </div>
      </div>
    </div>
  );
}
