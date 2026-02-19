export default function ExpiredLink() {
  return (
    <div className="min-h-screen bg-[#0f2a33] flex items-center justify-center px-4">
      <div className="text-center">
        
        {/* Illustration Wrapper */}
        <div className="relative w-48 h-48 mx-auto mb-8">
          
          {/* Outer Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-pulse"></div>

          {/* Logo */}
          <div
            className="absolute inset-3 rounded-full shadow-xl 
                       bg-[url('https://unpak.link/assets/logo.svg')] 
                       bg-contain bg-center bg-no-repeat"
          >
          </div>

          {/* Expired Badge */}
          <div className="absolute -bottom-2 -right-2 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
            Time Expired
          </div>

          {/* Small Clock Icon */}
          <div className="absolute top-3 left-1 bg-red-500 w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 3" />
            </svg>
          </div>
        </div>

        {/* Text */}
        <h1 className="text-white text-2xl font-semibold">
          unpak.link{" "}
          <span className="text-gray-300 font-normal">
            | Link Expired
          </span>
        </h1>

        <p className="text-gray-400 mt-3 text-sm">
          The link you are trying to access has expired.
        </p>
      </div>
    </div>
  );
}
