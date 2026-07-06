import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Clock, Send, LogOut } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const Layout = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  return (
    <div className="flex min-h-screen bg-white text-gray-900">
      <aside className="w-64 border-r border-gray-200 flex flex-col p-4">
        <div className="text-3xl font-black tracking-widest mb-6 px-2 text-gray-900">
          ONG
        </div>

        <div className="flex items-center gap-3 bg-[#f5f5f5] p-2 rounded-xl mb-4 cursor-pointer hover:bg-gray-200 transition-colors">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300">
            <img
              src={
                user?.avatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || "Oliver"}`
              }
              alt="User"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold truncate">
              {user?.name || "Oliver Brown"}
            </h3>
            <p className="text-xs text-gray-500 truncate">
              {user?.email || "oliver.brown@domain.io"}
            </p>
          </div>
          <button
            onClick={signOut}
            className="p-1 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-4 h-4 text-gray-400 hover:text-red-500" />
          </button>
        </div>

        <button
          onClick={() => navigate("/compose")}
          className="w-full border border-brand-green text-brand-green font-medium py-2 px-4 rounded-full mb-8 hover:bg-green-50 transition-colors"
        >
          Compose
        </button>

        <div className="flex flex-col gap-1">
          <div className="text-xs font-semibold text-gray-400 mb-2 px-2 uppercase tracking-wider">
            CORE
          </div>

          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-[#e8f5e9] text-gray-900 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`
            }
          >
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Scheduled</span>
            </div>
          </NavLink>

          <NavLink
            to="/sent"
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-[#e8f5e9] text-gray-900 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`
            }
          >
            <div className="flex items-center gap-3">
              <Send className="w-4 h-4" />
              <span className="text-sm">Sent</span>
            </div>
          </NavLink>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
