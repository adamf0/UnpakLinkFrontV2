import { useState } from "react";
import {
  LayoutDashboard,
  Link as LinkIcon,
  LogOut,
  X,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/Providers/AuthProvider";
import { useSidebar } from "@/Providers/SidebarProvider";
import { FaInstagram, FaFacebook, FaTiktok, FaYoutube } from "react-icons/fa";

export default function Template() {
  const { isSidebarOpen, toggleSidebar, isCollapsed, toggleCollapse } =
    useSidebar();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { getNameInfo, getLevelInfo } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showMobileUser, setShowMobileUser] = useState(false);

  return (
    <div className="md:flex min-h-screen">
      {/* =================== DESKTOP SIDEBAR =================== */}
      <aside
        className={`hidden md:flex flex-col bg-white border-r p-6 gap-6 transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <h1
          className="text-2xl font-bold cursor-pointer"
          onClick={toggleCollapse} // klik untuk collapse/expand desktop
        >
          unpak.link
        </h1>

        <nav className="flex flex-col gap-2 text-gray-600 mt-4">
          <NavItem
            icon={<LayoutDashboard size={18} />}
            label={isCollapsed ? "" : "Dashboard"}
            toUrl="/dashboard"
          />
          <NavItem
            icon={<LinkIcon size={18} />}
            label={isCollapsed ? "" : "Links"}
            toUrl="/link"
          />
        </nav>

        {/* USER PROFILE */}
        <div className="mt-auto pt-6 border-t">
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="hover:bg-gray-100 rounded-lg w-full text-left transition-colors p-2"
          >
            <div className="flex items-center gap-3">
              <div className="flex justify-center items-center bg-blue-600 rounded-lg text-white w-10 h-10 font-semibold text-lg">
                {getNameInfo()?.[0]?.toUpperCase() ?? ""}
              </div>
              <div className="flex-1">
                <h2 className="font-semibold truncate text-sm">
                  {getNameInfo()}
                </h2>
                <p className="text-xs text-gray-500">{getLevelInfo()}</p>
              </div>
              <LogOut className="w-4 h-4 text-gray-500 hover:text-red-500 transition" />
            </div>
          </button>
        </div>
      </aside>

      {/* =================== MOBILE SIDEBAR =================== */}
      {/* =================== MOBILE SIDEBAR =================== */}
      {isSidebarOpen && (
        <aside className="fixed inset-0 z-50 md:hidden flex">
          <div className="bg-white w-64 h-full p-6 relative flex flex-col">
            <button
              onClick={toggleSidebar}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5 text-gray-800" />
            </button>

            <h1
              className="text-2xl font-bold cursor-pointer mb-4"
              onClick={toggleSidebar}
            >
              unpak.link
            </h1>

            <nav className="flex flex-col gap-2 text-gray-600">
              <NavItem
                icon={<LayoutDashboard size={18} />}
                label="Dashboard"
                toUrl="/dashboard"
              />
              <NavItem
                icon={<LinkIcon size={18} />}
                label="Links"
                toUrl="/link"
              />
            </nav>

            {/* ================= MOBILE USER STICKY BOTTOM ================= */}
            <div className="mt-auto">
              <div className="w-full bg-white border-t flex flex-col">
                <div className="p-3 flex flex-col gap-1">
                  <p className="font-semibold text-sm">{getNameInfo()}</p>
                  <p className="text-xs text-gray-500">{getLevelInfo()}</p>
                </div>

                <button
                  onClick={() => {
                    setShowMobileUser(false);
                    setShowLogoutModal(true);
                  }}
                  className="w-full text-left text-red-600 text-sm hover:bg-red-50 px-3 py-2 flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* overlay hitam klik untuk tutup */}
          <div className="flex-1 bg-black/40" onClick={toggleSidebar}></div>
        </aside>
      )}

      {/* =================== MAIN CONTENT =================== */}
      <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
        {/* HEADER */}
        <header className="bg-[#49318f] text-white px-6 py-4 flex items-center justify-between shadow-md">
          {/* Left Side: Burger Menu + Logo + Brand Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="md:hidden p-2 -ml-2 rounded-lg hover:bg-white/10 transition"
              aria-label="Open Sidebar"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </button>
            
            <img
              src="https://assets.unpak.ac.id/images/logo/logo-unpak-simple.webp"
              alt="Logo UNPAK"
              className="h-10 p-1 bg-white/10 rounded-lg object-contain"
            />
            
            <div>
              <h1 className="font-bold text-lg leading-none tracking-wide">
                Unpak Shorter Link
              </h1>
              <p className="text-xs text-white/70 mt-0.5 hidden sm:block">
                Sivitas Akademika Universitas Pakuan
              </p>
            </div>
          </div>

          {/* Right Side: User Name and Avatar */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium hidden sm:inline-block">
              {getNameInfo()}
            </span>
            <div className="w-8 h-8 rounded-full bg-cyan-400 text-[#49318f] flex items-center justify-center font-bold text-sm shadow-inner">
              {getNameInfo()?.[0]?.toUpperCase() ?? ""}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet /> {/* render nested routes */}
        </main>

        {/* FOOTER */}
        <footer className="bg-[#49318f] text-white border-t border-white/10 rounded-t-[32px] pt-12 pb-8 font-montserrat mt-auto">
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
                <h4 className="text-[#ffc107] font-bold text-sm uppercase tracking-[1px] mb-4">
                  Layanan Akademik
                </h4>
                <ul className="space-y-2 text-xs font-medium leading-relaxed">
                  <li>
                    <a
                      href="https://simak.unpak.ac.id/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#e2e8f0] hover:text-[#ffc107] transition-colors duration-150"
                    >
                      SIMAK UNPAK
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://lms.unpak.ac.id/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#e2e8f0] hover:text-[#ffc107] transition-colors duration-150"
                    >
                      LMS UNPAK
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://siup.unpak.ac.id/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#e2e8f0] hover:text-[#ffc107] transition-colors duration-150"
                    >
                      SIUP UNPAK
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.unpak.ac.id/perkuliahan/pengumuman/kalender-akademik-jadwal-simak"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#e2e8f0] hover:text-[#ffc107] transition-colors duration-150"
                    >
                      Kalender Akademik
                    </a>
                  </li>
                </ul>
              </div>

              {/* Layanan Digital & Informasi */}
              <div className="text-center md:text-left">
                <h4 className="text-[#ffc107] font-bold text-sm uppercase tracking-[1px] mb-4">
                  Layanan Digital & Informasi
                </h4>
                <ul className="space-y-2 text-xs font-medium leading-relaxed">
                  <li>
                    <a
                      href="https://gerbang.unpak.ac.id/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#e2e8f0] hover:text-[#ffc107] transition-colors duration-150"
                    >
                      Gerbang UNPAK
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://pmb.unpak.ac.id/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#e2e8f0] hover:text-[#ffc107] transition-colors duration-150"
                    >
                      PMB Online
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://unpak.link/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#e2e8f0] hover:text-[#ffc107] transition-colors duration-150"
                    >
                      UNPAK LINK
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://uptime.unpak.ac.id/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#e2e8f0] hover:text-[#ffc107] transition-colors duration-150"
                    >
                      Status Layanan
                    </a>
                  </li>
                </ul>
              </div>

              {/* Aplikasi BPSI */}
              <div className="text-center md:text-left">
                <h4 className="text-[#ffc107] font-bold text-sm uppercase tracking-[1px] mb-4">
                  Aplikasi BPSI
                </h4>
                <ul className="space-y-2 text-xs font-medium leading-relaxed">
                  <li>
                    <a
                      href="https://tools.unpak.ac.id/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#e2e8f0] hover:text-[#ffc107] transition-colors duration-150"
                    >
                      Tools Network
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://pantau.unpak.ac.id/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#e2e8f0] hover:text-[#ffc107] transition-colors duration-150"
                    >
                      Pantau
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://test-ipv6.unpak.ac.id/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#e2e8f0] hover:text-[#ffc107] transition-colors duration-150"
                    >
                      Cek IPv6
                    </a>
                  </li>
                  <li>
                    <a
                      href="http://ip.unpak.ac.id"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#e2e8f0] hover:text-[#ffc107] transition-colors duration-150"
                    >
                      Cek IP Saya
                    </a>
                  </li>
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
        </footer>
      </div>

      {/* =================== LOGOUT MODAL =================== */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80 space-y-4">
            <h3 className="font-semibold text-lg">Confirm Logout</h3>
            <p className="text-sm text-gray-500">
              Are you sure you want to logout?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setShowLogoutModal(false);
                  logout();
                  navigate("/");
                  console.log("logout logic here");
                }}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =================== NAV COMPONENTS =================== */
function NavItem({ icon, label, toUrl }) {
  return (
    <NavLink
      to={toUrl}
      end
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg transition ${
          isActive
            ? "bg-[#49318f]/10 text-[#49318f] font-semibold"
            : "hover:bg-gray-100 text-gray-600"
        }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}

// function MobileNav({ icon, label, toUrl }) {
//   return (
//     <NavLink
//       to={toUrl}
//       end
//       className={({ isActive }) =>
//         `flex flex-col items-center text-xs ${
//           isActive ? "text-red-600 font-semibold" : "text-gray-500"
//         }`
//       }
//     >
//       {icon}
//       {label}
//     </NavLink>
//   );
// }
