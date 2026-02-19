export default function NotFoundRoute() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-6">
      <h1 className="text-6xl font-bold text-[#49318f]">404</h1>
      <p className="mt-4 text-lg text-gray-600">
        Halaman tidak ditemukan
      </p>

      <a
        href="/"
        className="mt-6 px-6 py-3 bg-[#49318f] text-white rounded-full hover:bg-[#3a2572] transition"
      >
        Kembali ke Beranda
      </a>
    </div>
  );
}
