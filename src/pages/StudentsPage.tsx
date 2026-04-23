import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { authFetch } from "@/services/api";
import { toast } from "sonner";
import { Users } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

type Student = {
  id: number;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  status: "active" | "inactive";
};

const API_URL = "http://localhost:8080/api/students";

export default function StudentsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const {
    data: students,
    isLoading,
    error,
  } = useQuery<Student[]>({
    queryKey: ["students", search],
    queryFn: async () => {
      const url = search ? `${API_URL}/search?q=${search}` : API_URL;
      const res = await authFetch(url);
      if (!res.ok) throw new Error("Erro ao buscar alunos");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await authFetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao deletar");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Aluno desativado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao desativar aluno");
    },
  });

  if (error) {
    toast.error("Erro ao carregar alunos");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alunos</h1>
          <p className="text-slate-400 mt-1">
            Gerencie seus alunos e suas informações
          </p>
        </div>
      </div>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-end">
            <Input
              placeholder="Buscar por nome, email ou CPF..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md h-11"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="h-11"
                onClick={() => navigate({ to: "/dashboard/students/new" })}
              >
                + Novo Aluno
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Lista de Alunos
            <Badge
              variant="secondary"
              className="bg-emerald-900/50 border-emerald-800 text-emerald-100"
            >
              {students?.length || 0} aluno(s)
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
          ) : students?.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">
                Nenhum aluno encontrado
              </h3>
              <p className="text-slate-500">
                Tente ajustar sua busca ou adicione um novo aluno.
              </p>
            </div>
          ) : (
            <div className="rounded-md border border-slate-800 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-slate-800">
                    <TableHead className="w-12">ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                    <TableHead className="w-24">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students?.map((student) => (
                    <TableRow
                      key={student.id}
                      className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors"
                    >
                      <TableCell className="font-mono text-sm text-slate-400">
                        #{student.id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {student.name}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{student.email}</div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {student.cpf}
                      </TableCell>
                      <TableCell className="text-sm">{student.phone}</TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={
                            student.status === "active"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            student.status === "active"
                              ? "bg-emerald-900/50 border-emerald-800"
                              : "bg-slate-900/50 border-slate-800"
                          }
                        >
                          {student.status === "active" ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex gap-2 justify-end">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 border-slate-700 hover:bg-slate-800"
                            >
                              Editar
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-slate-900 border-slate-800">
                            <DialogHeader>
                              <DialogTitle>Editar Aluno</DialogTitle>
                            </DialogHeader>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-8 bg-red-900/50 hover:bg-red-900 border-red-800"
                          onClick={() => deleteMutation.mutate(student.id)}
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending ? "..." : "Desativar"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
