# Gym IQ Web

Frontend do projeto acadêmico **Gym IQ**, desenvolvido como parte de um **Trabalho de Conclusão de Curso (TCC)**. A aplicação tem como objetivo apoiar a gestão de academias, centralizando rotinas administrativas, acompanhamento operacional e serviços voltados ao aluno em uma interface web moderna.

## Contexto do projeto

O sistema foi idealizado para atender necessidades comuns do ambiente de academias, como:

- cadastro e acompanhamento de alunos;
- organização de planos e matrículas;
- controle de pagamentos;
- gestão de instrutores, exercícios e fichas de treino;
- acompanhamento de indicadores administrativos;
- disponibilização de uma área do aluno.

Além do foco operacional, o projeto também contempla recursos analíticos, como **dashboard administrativo**, métricas financeiras e sinais relacionados à **retenção de alunos**.

## Objetivo deste repositório

Este repositório contém o **frontend** da solução. A aplicação consome uma API REST e oferece diferentes experiências de uso conforme o perfil autenticado.

Perfis identificados no projeto:

- `ADMIN`
- `RECEPTION`
- `INSTRUCTOR`
- `STUDENT`

## Principais funcionalidades

### Painel administrativo

- dashboard com indicadores de retenção, finanças e operação;
- visualização de alertas de retenção;
- consulta de logs de auditoria;
- gestão de usuários administrativos.

### Operação da academia

- cadastro e listagem de alunos;
- gerenciamento de planos;
- controle de matrículas;
- controle de pagamentos;
- gerenciamento de instrutores.

### Treinamento

- cadastro de exercícios;
- criação e manutenção de fichas de treino;
- associação de exercícios às fichas.

### Portal do aluno

- visualização de matrícula ativa;
- consulta de pagamentos;
- histórico de presenças;
- acesso às fichas de treino ativas;
- solicitação de exclusão de dados pessoais, respeitando regras do sistema.

## Tecnologias utilizadas

- `React 19`
- `TypeScript`
- `Vite`
- `TanStack Router`
- `TanStack Query`
- `Vitest`
- `Testing Library`
- `ESLint`
- `MUI`
- `Lucide React`

## Estrutura geral do projeto

```text
src/
  components/   Componentes reutilizáveis da interface
  hooks/        Hooks customizados
  mutations/    Operações de escrita na API
  pages/        Páginas e fluxos da aplicação
  queries/      Consultas e cache de dados
  routes/       Definição de rotas e regras de acesso
  services/     Configuração de API e serviços compartilhados
  test/         Setup de testes
  utils/        Funções utilitárias
```

## Requisitos

- `Node.js` 20 ou superior
- `npm` 10 ou superior

## Configuração do ambiente

O projeto utiliza a variável de ambiente `VITE_API_URL` para definir a URL base da API.

Exemplo:

```env
VITE_API_URL=https://api.gymiq.gusoaresfdev.com.br/api
```

Se a variável não for informada, o frontend utiliza uma URL padrão configurada no projeto.

## Como executar localmente

1. Instale as dependências:

```bash
npm install
```

2. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

3. Acesse a aplicação no endereço exibido pelo Vite, normalmente:

```text
http://localhost:5173
```

## Scripts disponíveis

- `npm run dev`: inicia a aplicação em modo de desenvolvimento.
- `npm run build`: gera a versão de produção.
- `npm run preview`: executa a versão buildada localmente.
- `npm run lint`: analisa o código com ESLint.
- `npm run test`: executa os testes automatizados.
- `npm run test:watch`: executa os testes em modo observação.
- `npm run test:coverage`: gera relatório de cobertura de testes.
- `npm run routes`: exibe a árvore de rotas do projeto.

## Qualidade e testes

O projeto possui cobertura de testes automatizados para utilitários, hooks, componentes, queries, mutations e fluxos específicos de páginas. A estratégia adotada busca aumentar a confiabilidade do sistema e apoiar a evolução do software durante o desenvolvimento do TCC.

## Observações acadêmicas

Este software foi desenvolvido com finalidade acadêmica, servindo como artefato prático de um TCC na área de desenvolvimento de sistemas web. A proposta envolve aplicar conceitos de:

- arquitetura de frontend;
- componentização;
- roteamento com controle de acesso;
- consumo de API REST;
- testes automatizados;
- experiência do usuário em sistemas de gestão.

## Possíveis evoluções

- integração mais ampla com notificações e alertas em tempo real;
- expansão dos indicadores analíticos;
- melhorias de acessibilidade;
- evolução do portal do aluno;
- integração com novos módulos do ecossistema da academia.
