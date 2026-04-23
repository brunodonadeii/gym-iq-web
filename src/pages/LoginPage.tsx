import { useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { login } from "@/services/auth";
import { toast } from "sonner";
import { Users, Lock, Mail, Shield, Dumbbell, TrendingUp } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      toast.success("Login realizado com sucesso! 💪");
      navigate({ to: "/dashboard" });
    },
    onError: (error) => {
      toast.error(
        error.message || "Erro no login. Verifique suas credenciais.",
      );
    },
  });

  const handleLogin = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Preencha todos os campos!");
      return;
    }
    mutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Card Principal */}
        <Card className="bg-slate-900/95 backdrop-blur-xl border-slate-800 shadow-2xl shadow-slate-900/50 overflow-hidden">
          {/* Header com Logo */}
          <CardHeader className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-b border-slate-800/50 pb-8 text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/30 border-4 border-white/20">
              <Users className="h-10 w-10 text-white drop-shadow-lg" />
            </div>
            <CardTitle className="text-4xl font-black bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent tracking-tight">
              GymIQ
            </CardTitle>
            <CardDescription className="text-slate-400 text-lg mt-1">
              Plataforma completa para gestão de academias
            </CardDescription>
          </CardHeader>

          {/* Formulário */}
          <CardContent className="p-8 space-y-6">
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="admin@gymiq.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 pl-12 bg-slate-800/50 border-slate-700 hover:border-slate-600 text-slate-100 placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-all duration-300 shadow-sm"
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Senha
                </label>
                <div className="relative">
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 pl-12 bg-slate-800/50 border-slate-700 hover:border-slate-600 text-slate-100 placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-all duration-300 shadow-sm"
                  />
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                </div>
              </div>

              {/* Credenciais Demo */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <p className="text-xs text-emerald-400 font-mono bg-emerald-900/30 px-3 py-2 rounded-lg mb-2">
                  🚀 <strong>Conta Demo:</strong>
                </p>
                <div className="text-xs space-y-1 text-slate-400">
                  <div>
                    <span className="font-mono">Email:</span> admin@gymiq.com
                  </div>
                  <div>
                    <span className="font-mono">Senha:</span> gymiq@2026
                  </div>
                </div>
              </div>

              {/* Botão de Login */}
              <Button
                type="submit"
                className="h-14 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:via-teal-600 hover:to-emerald-700 shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/40 font-bold text-lg rounded-2xl transition-all duration-300 border-0"
                disabled={mutation.isPending || !email || !password}
              >
                {mutation.isPending ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5 mr-2" />
                    Entrar na Academia
                  </>
                )}
              </Button>
            </form>

            {/* Links Adicionais */}
            <div className="text-center space-y-4 pt-6">
              <Separator className="bg-slate-800" />
              <div className="text-xs text-slate-500 space-y-2">
                <Link
                  to="/recover-password"
                  className="hover:text-emerald-400 transition-colors font-medium"
                >
                  Esqueceu a senha?
                </Link>
                <div className="flex items-center justify-center gap-1 text-xs">
                  <span>Não tem conta?</span>
                  <Link
                    to="/register"
                    className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                  >
                    Criar conta
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cards Informativos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
          <Card className="bg-slate-900/50 border-slate-800/50 p-6 text-center hover:bg-slate-900/70 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10">
            <Dumbbell className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-200 mb-1">
              Gestão Completa
            </h3>
            <p className="text-xs text-slate-500">
              Controle total dos alunos e treinos
            </p>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800/50 p-6 text-center hover:bg-slate-900/70 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
            <TrendingUp className="h-8 w-8 text-blue-400 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-200 mb-1">Relatórios</h3>
            <p className="text-xs text-slate-500">
              Analytics e métricas em tempo real
            </p>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800/50 p-6 text-center hover:bg-slate-900/70 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
            <Shield className="h-8 w-8 text-purple-400 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-200 mb-1">Seguro</h3>
            <p className="text-xs text-slate-500">
              Dados protegidos e backup automático
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
