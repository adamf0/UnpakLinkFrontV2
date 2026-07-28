import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard,
  Link as LinkIcon,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
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
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* =================== HEADER (Full Width) =================== */}
      <header className="bg-[#49318f] text-white px-6 py-4 flex items-center justify-between shadow-md z-30 shrink-0 select-none">
        {/* Left Side: Burger Menu + Logo + Brand Name */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (window.innerWidth < 768) {
                toggleSidebar(); // mobile drawer toggle
              } else {
                toggleCollapse(); // desktop collapse toggle
              }
            }}
            className="p-2 rounded-xl hover:bg-white/10 transition border border-white/15 cursor-pointer active:scale-95 flex items-center justify-center w-10 h-10 shrink-0"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>
          
          <img
            src="https://assets.unpak.ac.id/images/logo/logo-unpak.webp"
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

        {/* Right Side: User Name and Avatar with Dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setShowDropdown((prev) => !prev)}
            className="flex items-center gap-3 hover:bg-white/10 px-3 py-1.5 rounded-xl transition duration-150 cursor-pointer select-none"
          >
            <span className="text-sm font-semibold hidden sm:inline-block">
              {getNameInfo()}
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-400 text-[#49318f] flex items-center justify-center font-bold text-base shadow-sm shrink-0 border border-white/20">
              {getNameInfo()?.[0]?.toUpperCase() ?? ""}
            </div>
            <ChevronDown size={14} className={`text-white/70 transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1">
              <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Masuk sebagai</p>
                <p className="text-sm font-bold text-gray-700 truncate">{getNameInfo()}</p>
                <p className="text-[10px] text-[#49318f] font-semibold mt-0.5">{getLevelInfo()}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowDropdown(false);
                  setShowLogoutModal(true);
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-semibold transition"
                title="Keluar"
              >
                <LogOut size={16} />
                Keluar / Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* =================== BODY AREA (Sidebar + Content) =================== */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* =================== DESKTOP SIDEBAR =================== */}
        <aside
          className={`hidden md:flex flex-col bg-[#0b1329] text-white transition-all duration-300 border-r border-[#1e293b] select-none shrink-0 ${
            isCollapsed ? "w-16 p-2 gap-4" : "w-64 p-4 gap-6"
          }`}
        >
          <nav className="flex flex-col gap-2 text-gray-400 mt-2">
            <NavItem
              icon={<LayoutDashboard size={20} className="stroke-[2]" />}
              label="Dashboard"
              toUrl="/dashboard"
            />
            <NavItem
              icon={<LinkIcon size={20} className="stroke-[2]" />}
              label="Links"
              toUrl="/link"
            />
          </nav>
        </aside>

        {/* =================== MOBILE SIDEBAR =================== */}
        {isSidebarOpen && (
          <aside className="fixed inset-0 z-50 md:hidden flex">
            <div className="bg-[#0b1329] text-white w-64 h-full p-6 relative flex flex-col border-r border-[#1e293b]">
              <button
                onClick={toggleSidebar}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/5 transition text-gray-400 hover:text-white"
                aria-label="Close Sidebar"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 border-b border-[#1e293b] pb-4 mb-6">
                <img
                  src="https://assets.unpak.ac.id/images/logo/logo-unpak.webp"
                  alt="Logo"
                  className="h-8 w-8 object-contain"
                />
                <span className="text-xl font-extrabold text-white tracking-wide">
                  unpak.link
                </span>
              </div>

              <nav className="flex flex-col gap-2 text-gray-400">
                <NavItem
                  icon={<LayoutDashboard size={20} className="stroke-[2]" />}
                  label="Dashboard"
                  toUrl="/dashboard"
                />
                <NavItem
                  icon={<LinkIcon size={20} className="stroke-[2]" />}
                  label="Links"
                  toUrl="/link"
                />
              </nav>

              {/* ================= MOBILE USER STICKY BOTTOM ================= */}
              <div className="mt-auto pt-4 border-t border-[#1e293b]">
                <div className="flex flex-col bg-[#111c3a] border border-[#1e293b] rounded-xl p-3">
                  <div className="flex flex-col gap-0.5">
                    <p className="font-bold text-sm text-white">{getNameInfo()}</p>
                    <p className="text-xs text-gray-400">{getLevelInfo()}</p>
                  </div>

                  <button
                    onClick={() => {
                      toggleSidebar();
                      setShowLogoutModal(true);
                    }}
                    className="mt-3 w-full text-left text-red-400 hover:text-red-500 text-sm hover:bg-red-500/10 px-3 py-2 rounded-lg flex items-center gap-2 font-semibold transition"
                  >
                    <LogOut size={16} />
                    Keluar / Logout
                  </button>
                </div>
              </div>
            </div>

            {/* overlay hitam klik untuk tutup */}
            <div className="flex-1 bg-black/40" onClick={toggleSidebar}></div>
          </aside>
        )}

        {/* =================== MAIN CONTENT AREA =================== */}
        <div className="flex-1 flex flex-col overflow-y-auto h-[calc(100vh-72px)]">
          <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
          
          {/* FOOTER */}
          <footer className="bg-[#49318f] text-white border-t border-white/10 rounded-t-[32px] pt-12 pb-8 font-montserrat mt-auto shrink-0 z-10">
            <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                {/* Logo */}
                <div className="text-center md:text-left">
                  <img
                    src="https://assets.unpak.ac.id/images/logo/logo-unpak.webp"
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

function NavItem({ icon, label, toUrl }) {
  const { isCollapsed } = useSidebar();
  return (
    <NavLink
      to={toUrl}
      end
      className={({ isActive }) =>
        `flex items-center rounded-xl transition-all duration-200 ${
          isCollapsed ? "justify-center w-11 h-11 mx-auto" : "gap-3 px-4 py-3"
        } ${
          isActive
            ? "bg-[#49318f] text-white font-bold shadow-md shadow-black/20"
            : "text-gray-400 hover:text-white hover:bg-white/5 font-medium"
        }`
      }
      title={isCollapsed ? label : ""}
    >
      {icon}
      {!isCollapsed && <span className="text-sm">{label}</span>}
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
