import React from "react";
import { Link } from "react-router-dom";
import Logo from "@/assets/logo.svg"
import Img1 from "@/assets/img-1.svg"
import Img2 from "@/assets/img-2.svg"
import Img3 from "@/assets/img-3.svg"
import instagram from "@/assets/instagram.svg"
import twitter from "@/assets/twitter.svg"
import facebook from "@/assets/facebook.svg"
import tiktok from "@/assets/tiktok.svg"

export default function Landing() {
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
                  <Link
                    to="/login"
                    className="inline-block bg-cyan-400 text-[#49318f] px-8 py-3 rounded-full font-semibold hover:bg-cyan-500 transition-all duration-300 shadow-md"
                  >
                    Login
                  </Link>
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
                    © Unpak.link - 2023 Managed by PUTIK
                  </div>

                  <div className="flex gap-5">
                    <SocialIcon src={instagram} />
                    <SocialIcon src={twitter} />
                    <SocialIcon src={facebook} />
                    <SocialIcon src={tiktok} />
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
      <section className="bg-[#49318f] text-white rounded-t-3xl pt-16 pb-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10">

            {/* LOGO */}
            <div className="lg:col-span-4 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <img
                src={Logo}
                alt="logo"
                className="w-16"
              />
              <img
                src={Img3}
                alt="img3"
                className="w-12"
              />
            </div>

            {/* INTERNAL */}
            <div className="lg:col-span-3 space-y-4 text-center sm:text-left">
              <p className="font-semibold text-lg">Internal link</p>
              <ul className="space-y-2 text-sm text-gray-200">
                <li className="hover:text-yellow-500"><Link to="https://pmb.unpak.ac.id/">PMB Online</Link></li>
                <li className="hover:text-yellow-500"><Link to="https://monit.unpak.ac.id/">Status Server</Link></li>
                <li className="hover:text-yellow-500"><Link to="https://unpak.ac.id/">Website publik</Link></li>
              </ul>
            </div>

            {/* OTHER */}
            <div className="lg:col-span-3 space-y-4 text-center sm:text-left">
              <p className="font-semibold text-lg">Link lainnya</p>
              <ul className="space-y-2 text-sm text-gray-200">
                <li className="hover:text-yellow-500"><Link to="https://lms.unpak.ac.id/">LMS Unpak</Link></li>
                <li className="hover:text-yellow-500"><Link to="https://www.unpak.ac.id/perkuliahan/pengumuman/kalender-akademik-jadwal-simak">Kalendar Akademik</Link></li>
              </ul>
            </div>

          </div>

          {/* Bottom Footer */}
          <div className="mt-14 border-t border-white/20 pt-6 text-xs sm:text-sm flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <div>
              © Unpak.link - 2026 Managed by Pusat Teknologi Informasi &
              Komunikasi Universitas Pakuan
            </div>

            <div className="flex gap-5">
              <Link to="https://www.instagram.com/official_unpak/"><SocialIcon src={instagram} /></Link>
              <Link to="https://x.com/official_unpak"><SocialIcon src={twitter} /></Link>
              <Link to="https://www.facebook.com/unpak/"><SocialIcon src={facebook} /></Link>
              <Link to="https://www.tiktok.com/discover/universitas-pakuan"><SocialIcon src={tiktok} /></Link>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}

/* ===== Reusable Social Component ===== */
function SocialIcon({ src }) {
  return (
    <img
      src={src}
      alt={src}
      className="w-4 h-4 hover:scale-110 transition-transform duration-300 cursor-pointer"
    />
  );
}
