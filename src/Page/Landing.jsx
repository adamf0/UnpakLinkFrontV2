import React from "react";
import { Link } from "react-router-dom";
import Logo from "@/assets/logo.svg"
import Img1 from "@/assets/img-1.svg"
import Img2 from "@/assets/img-2.svg"
import { FaInstagram, FaFacebook, FaTiktok, FaYoutube } from "react-icons/fa";
import { useKeycloak } from "@react-keycloak/web";

export default function Landing() {
  const { keycloak } = useKeycloak();

  return (
    <div className="font-montserrat overflow-x-hidden">

      {/* ================= HERO SECTION ================= */}
      <section className="min-h-screen bg-[#6c53b4] flex items-center py-10 sm:py-16">
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="bg-[#49318f] rounded-3xl px-6 sm:px-10 lg:px-20 py-10 sm:py-14 text-white shadow-xl">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

              {/* LEFT */}
              <div className="lg:col-span-7 text-center lg:text-left space-y-6">
                <img
                  src={Logo}
                  alt="logo"
                  className="w-16 sm:w-[73px] mx-auto lg:mx-0"
                />

                <div className="space-y-3">
                  <h4 className="font-light text-lg sm:text-xl">
                    Selamat datang di
                  </h4>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                    Unpak Shorter Link
                  </h1>

                  <h4 className="font-light text-lg sm:text-xl italic">
                    Short link untuk sivitas Akademik Unpak!
                  </h4>
                </div>

                <div>
                  {keycloak?.authenticated ? (
                    <Link
                      to="/dashboard"
                      className="inline-block bg-cyan-400 text-[#49318f] px-8 py-3 rounded-full font-semibold hover:bg-cyan-500 transition-all duration-300 shadow-md"
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <button
                      onClick={() => keycloak.login({ redirectUri: window.location.origin + "/callback_sso" })}
                      className="inline-block bg-cyan-400 text-[#49318f] px-8 py-3 rounded-full font-semibold hover:bg-cyan-500 transition-all duration-300 shadow-md cursor-pointer"
                    >
                      Login
                    </button>
                  )}
                </div>
              </div>

              {/* RIGHT IMAGE */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <img
                  src={Img1}
                  alt="hero"
                  className="w-64 sm:w-80 lg:w-full max-w-md"
                />
              </div>

              {/* MINI FOOTER */}
              <div className="col-span-1 lg:col-span-12 pt-8 border-t border-white/20 mt-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs sm:text-sm text-center md:text-left">
                  <div>
                    © Unpak.link - 2023 Managed by BPSI - Universitas Pakuan
                  </div>

                  <div className="flex gap-4 text-base">
                    <a href="https://www.instagram.com/official_unpak/" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform duration-300"><FaInstagram /></a>
                    <a href="https://www.facebook.com/unpak/" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform duration-300"><FaFacebook /></a>
                    <a href="https://www.tiktok.com/discover/universitas-pakuan" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform duration-300"><FaTiktok /></a>
                    <a href="https://www.youtube.com/c/UNPAKTV" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform duration-300"><FaYoutube /></a>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ================= ABOUT SECTION ================= */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            <div className="lg:col-span-5 flex justify-center">
              <img
                src={Img2}
                alt="img2"
                className="w-72 sm:w-96 lg:w-full max-w-md"
              />
            </div>

            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              <h1 className="text-3xl sm:text-4xl font-bold text-[#49318f]">
                Apa itu Unpak.Link?
              </h1>

              <p className="text-base sm:text-lg lg:text-xl font-light text-gray-700 leading-relaxed">
                <span className="font-semibold text-[#49318f]">
                  Unpak.link
                </span>{" "}
                adalah layanan pemendekan link gratis untuk membuat link pendek
                dan mudah diingat yang dapat digunakan untuk mempromosikan
                website, produk, pembelajaran dll, bagi sivitas akademika
                Universitas Pakuan.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ================= FOOTER SECTION ================= */}
      <section className="bg-[#49318f] text-white border-t border-white/10 rounded-t-[32px] pt-16 pb-8 font-montserrat">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Logo */}
            <div className="text-center md:text-left">
              <img
                src="https://assets.unpak.ac.id/images/logo/logo-unpak-simple.webp"
                alt="Logo UNPAK"
                className="max-h-[64px] mt-4 md:mt-8 mb-3 rounded-xl border border-white/10 bg-white/10 p-2 inline-block"
              />
            </div>

            {/* Layanan Akademik */}
            <div className="text-center md:text-left">
              <h4 className="text-[#ffc107] font-bold text-sm uppercase tracking-[1px] mb-4">Layanan Akademik</h4>
              <ul className="space-y-2 text-xs font-medium leading-relaxed">
                <li><a href="https://simak.unpak.ac.id/" target="_blank" rel="noopener noreferrer" className="text-[#e2e8f0] hover:text-[#ffc107] transition-colors duration-150">SIMAK UNPAK</a></li>
                <li><a href="https://lms.unpak.ac.id/" target="_blank" rel="noopener noreferrer" className="text-[#e2e8f0] hover:text-[#ffc107] transition-colors duration-150">LMS UNPAK</a></li>
                <li><a href="https://siup.unpak.ac.id/" target="_blank" rel="noopener noreferrer" className="text-[#e2e8f0] hover:text-[#ffc107] transition-colors duration-150">SIUP UNPAK</a></li>
                <li><a href="https://www.unpak.ac.id/perkuliahan/pengumuman/kalender-akademik-jadwal-simak" target="_blank" rel="noopener noreferrer" className="text-[#e2e8f0] hover:text-[#ffc107] transition-colors duration-150">Kalender Akademik</a></li>
              </ul>
            </div>

            {/* Layanan Digital & Informasi */}
            <div className="text-center md:text-left">
              <h4 className="text-[#ffc107] font-bold text-sm uppercase tracking-[1px] mb-4">Layanan Digital & Informasi</h4>
              <ul className="space-y-2 text-xs font-medium leading-relaxed">
                <li><a href="https://gerbang.unpak.ac.id/" target="_blank" rel="noopener noreferrer" className="text-[#e2e8f0] hover:text-[#ffc107] transition-colors duration-150">Gerbang UNPAK</a></li>
                <li><a href="https://pmb.unpak.ac.id/" target="_blank" rel="noopener noreferrer" className="text-[#e2e8f0] hover:text-[#ffc107] transition-colors duration-150">PMB Online</a></li>
                <li><a href="https://unpak.link/" target="_blank" rel="noopener noreferrer" className="text-[#e2e8f0] hover:text-[#ffc107] transition-colors duration-150">UNPAK LINK</a></li>
                <li><a href="https://uptime.unpak.ac.id/" target="_blank" rel="noopener noreferrer" className="text-[#e2e8f0] hover:text-[#ffc107] transition-colors duration-150">Status Layanan</a></li>
              </ul>
            </div>

            {/* Aplikasi BPSI */}
            <div className="text-center md:text-left">
              <h4 className="text-[#ffc107] font-bold text-sm uppercase tracking-[1px] mb-4">Aplikasi BPSI</h4>
              <ul className="space-y-2 text-xs font-medium leading-relaxed">
                <li><a href="https://tools.unpak.ac.id/" target="_blank" rel="noopener noreferrer" className="text-[#e2e8f0] hover:text-[#ffc107] transition-colors duration-150">Tools Network</a></li>
                <li><a href="https://pantau.unpak.ac.id/" target="_blank" rel="noopener noreferrer" className="text-[#e2e8f0] hover:text-[#ffc107] transition-colors duration-150">Pantau</a></li>
                <li><a href="https://test-ipv6.unpak.ac.id/" target="_blank" rel="noopener noreferrer" className="text-[#e2e8f0] hover:text-[#ffc107] transition-colors duration-150">Cek IPv6</a></li>
                <li><a href="http://ip.unpak.ac.id" target="_blank" rel="noopener noreferrer" className="text-[#e2e8f0] hover:text-[#ffc107] transition-colors duration-150">Cek IP Saya</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-4 mt-5 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-white/75">
            <div className="text-center md:text-left leading-relaxed">
              © unpak.link - 2026 Bagian Perencanaan & Sistem Informasi (BPSI) - Universitas Pakuan
            </div>

            <div className="flex gap-2 text-base justify-center">
              <a
                href="https://www.instagram.com/official_unpak/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white transition-all duration-200 hover:bg-white/20 hover:scale-110 hover:text-[#f43f5e]"
              >
                <FaInstagram />
              </a>
              <a
                href="https://www.facebook.com/unpak/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white transition-all duration-200 hover:bg-white/20 hover:scale-110 hover:text-[#3b82f6]"
              >
                <FaFacebook />
              </a>
              <a
                href="https://www.tiktok.com/discover/universitas-pakuan"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white transition-all duration-200 hover:bg-white/20 hover:scale-110 hover:text-black"
              >
                <FaTiktok />
              </a>
              <a
                href="https://www.youtube.com/c/UNPAKTV"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white transition-all duration-200 hover:bg-white/20 hover:scale-110 hover:text-[#ef4444]"
              >
                <FaYoutube />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
