import { Outlet, useMatchRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, UserPlus, LogOut } from "lucide-react";

const SIDEBAR_ITEMS = [
  { label: "Dashboard", to: "/dashboard/", icon: LayoutDashboard },
  { label: "Alunos", to: "/dashboard/students/", icon: Users },
  {
    label: "Novo Aluno",
    to: "/dashboard/students/new",
    icon: UserPlus,
  },
];

export function Layout() {
  const navigate = useNavigate();
  const matchRoute = useMatchRoute();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 z-50 shadow-2xl shadow-slate-900/50">
        <div className="p-8">
          <div className="mb-12 pb-8 border-b border-slate-800">
            <h1 className="text-3xl font-black bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent tracking-tight">
              Gym<span className="text-emerald-400">IQ</span>
            </h1>
            <p className="text-xs text-slate-500 mt-2 font-medium tracking-wider uppercase">
              Gestão de Academias
            </p>
          </div>

          <nav className="space-y-1 mb-12">
            {SIDEBAR_ITEMS.map((item) => {
              const isActive = !!matchRoute({ to: item.to, fuzzy: true });

              return (
                <Button
                  key={item.to}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start h-14 px-4 py-3 text-lg font-semibold rounded-xl border-l-4 transition-all duration-300 group hover:bg-slate-800/50",
                    isActive
                      ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-500/20"
                      : "border-transparent hover:border-emerald-400/50 hover:text-emerald-300",
                  )}
                  onClick={() => navigate({ to: item.to })}
                >
                  <item.icon
                    className={cn(
                      "h-6 w-6 mr-4 transition-transform group-hover:scale-110",
                      isActive && "text-emerald-400",
                    )}
                  />
                  {item.label}
                </Button>
              );
            })}
          </nav>

          <Button
            variant="ghost"
            className="w-full justify-start h-14 px-4 py-3 text-lg font-semibold rounded-xl border-l-4 border-transparent hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
            onClick={handleLogout}
          >
            <LogOut className="h-6 w-6 mr-4" />
            Sair
          </Button>
        </div>
      </aside>

      <main className="ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}
