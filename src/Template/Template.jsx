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
                AF
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
      <div className="flex-1 flex flex-col">
        <Outlet /> {/* render nested routes */}
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
                  navigate("/login");
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
            ? "bg-red-50 text-red-600"
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
