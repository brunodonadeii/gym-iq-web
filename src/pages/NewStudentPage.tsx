import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authFetch } from "@/services/api";
import { toast } from "sonner";
import {
  UserPlus,
  ArrowLeft,
  User,
  Mail,
  Lock,
  Hash,
  Calendar,
  Phone,
  MapPin,
  Home,
} from "lucide-react";

const API_URL = "http://localhost:8080/api/students";

type CreateStudentForm = {
  name: string;
  email: string;
  password: string;
  cpf: string;
  birthDate: string;
  phone: string;
  zipCode: string;
  address: string;
};

const INITIAL_FORM: CreateStudentForm = {
  name: "",
  email: "",
  password: "",
  cpf: "",
  birthDate: "",
  phone: "",
  zipCode: "",
  address: "",
};

function Field({
  label,
  icon: Icon,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon: React.ElementType;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
        <Icon className="h-4 w-4 text-slate-400" />
        {label}
      </label>
      <div className="relative">
        <Input
          {...props}
          className={`h-12 pl-4 bg-slate-800/50 border-slate-700 hover:border-slate-600 text-slate-100 placeholder-slate-500
            focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-all duration-200
            ${error ? "border-red-500 focus-visible:ring-red-500" : ""}`}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

function formatCPF(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function formatPhone(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

function formatZipCode(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 8)
    .replace(/(\d{5})(\d)/, "$1-$2");
}

export default function NewStudentPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CreateStudentForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<CreateStudentForm>>({});

  const mutation = useMutation({
    mutationFn: async (data: CreateStudentForm) => {
      const res = await authFetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, birthDate: data.birthDate }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Erro ao criar aluno");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Aluno cadastrado com sucesso! 💪");
      navigate({ to: "/dashboard/students" });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const validate = (): boolean => {
    const e: Partial<CreateStudentForm> = {};
    if (!form.name || form.name.length < 2)
      e.name = "Nome deve ter pelo menos 2 caracteres";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "E-mail inválido";
    if (!form.password || form.password.length < 6)
      e.password = "Senha deve ter no mínimo 6 caracteres";
    if (!form.cpf || !/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(form.cpf))
      e.cpf = "CPF inválido (000.000.000-00)";
    if (!form.birthDate) e.birthDate = "Data de nascimento obrigatória";
    if (!form.phone) e.phone = "Telefone obrigatório";
    if (form.zipCode && !/^\d{5}-\d{3}$/.test(form.zipCode))
      e.zipCode = "CEP inválido (00000-000)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (validate()) mutation.mutate(form);
  };

  const set = (field: keyof CreateStudentForm, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-xl border border-slate-800 hover:bg-slate-800 hover:border-slate-700"
          onClick={() => navigate({ to: "/dashboard/students" })}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Novo Aluno</h1>
          <p className="text-slate-400 mt-1">
            Preencha os dados para cadastrar um novo aluno
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados Pessoais */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-base text-slate-300 flex items-center gap-2">
              <User className="h-4 w-4 text-emerald-400" />
              Dados Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <Field
                label="Nome completo"
                icon={User}
                placeholder="João da Silva"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                error={errors.name}
              />
            </div>
            <Field
              label="CPF"
              icon={Hash}
              placeholder="000.000.000-00"
              value={form.cpf}
              onChange={(e) => set("cpf", formatCPF(e.target.value))}
              error={errors.cpf}
            />
            <Field
              label="Data de Nascimento"
              icon={Calendar}
              type="date"
              value={form.birthDate}
              onChange={(e) => set("birthDate", e.target.value)}
              error={errors.birthDate}
            />
            <Field
              label="Telefone"
              icon={Phone}
              placeholder="(11) 99999-9999"
              value={form.phone}
              onChange={(e) => set("phone", formatPhone(e.target.value))}
              error={errors.phone}
            />
          </CardContent>
        </Card>

        {/* Acesso */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-base text-slate-300 flex items-center gap-2">
              <Mail className="h-4 w-4 text-emerald-400" />
              Acesso
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <Field
                label="E-mail"
                icon={Mail}
                type="email"
                placeholder="joao@email.com"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                error={errors.email}
              />
            </div>
            <Field
              label="Senha"
              icon={Lock}
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              error={errors.password}
            />
          </CardContent>
        </Card>

        {/* Endereço (opcional) */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-base text-slate-300 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-400" />
              Endereço
              <span className="text-xs text-slate-500 font-normal">
                (opcional)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field
              label="CEP"
              icon={MapPin}
              placeholder="00000-000"
              value={form.zipCode}
              onChange={(e) => set("zipCode", formatZipCode(e.target.value))}
              error={errors.zipCode}
            />
            <div className="sm:col-span-2">
              <Field
                label="Endereço"
                icon={Home}
                placeholder="Rua, número, bairro..."
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end pb-4">
          <Button
            type="button"
            variant="outline"
            className="h-12 px-6 border-slate-700 hover:bg-slate-800"
            onClick={() => navigate({ to: "/dashboard/students" })}
            disabled={mutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="h-12 px-8 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:via-teal-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/20 font-bold rounded-xl transition-all duration-300"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Cadastrando...
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5 mr-2" />
                Cadastrar Aluno
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
