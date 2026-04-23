import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Dumbbell, Calendar, TrendingUp } from "lucide-react";

const stats = [
  {
    name: "Total Alunos",
    value: "247",
    change: "+12%",
    icon: Users,
    color: "emerald",
  },
  {
    name: "Treinos Hoje",
    value: "89",
    change: "+8%",
    icon: Dumbbell,
    color: "blue",
  },
  {
    name: "Aulas Agendadas",
    value: "34",
    change: "-2%",
    icon: Calendar,
    color: "purple",
  },
  {
    name: "Média Frequência",
    value: "87%",
    change: "+3%",
    icon: TrendingUp,
    color: "orange",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-slate-400 mt-1">Bem-vindo de volta! 👋</p>
        </div>
        <Badge
          variant="secondary"
          className="bg-emerald-900/50 border-emerald-800 text-emerald-100"
        >
          Online
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card
            key={stat.name}
            className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-slate-400">
                {stat.name}
              </CardTitle>
              <stat.icon className={`h-6 w-6 text-${stat.color}-400`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-100">
                {stat.value}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {stat.change.startsWith("+") ? "↗" : "↘"} {stat.change} do mês
                anterior
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900/50 border-slate-800 col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  name: "João Silva",
                  action: "Novo treino marcado",
                  time: "2min atrás",
                },
                {
                  name: "Maria Santos",
                  action: "Pagamento confirmado",
                  time: "5min atrás",
                },
                {
                  name: "Pedro Costa",
                  action: "Frequência registrada",
                  time: "12min atrás",
                },
              ].map((activity) => (
                <div
                  key={activity.name}
                  className="flex items-center p-3 bg-slate-800/30 rounded-lg"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-sm font-bold text-white">
                      {activity.name.split(" ")[0][0]}
                      {activity.name.split(" ")[1]?.[0] || ""}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-100">
                      {activity.name}
                    </p>
                    <p className="text-sm text-slate-500">{activity.action}</p>
                  </div>
                  <span className="text-xs text-slate-500">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
