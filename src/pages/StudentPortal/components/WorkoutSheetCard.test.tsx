import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  formatExerciseMetaSpy,
  printWorkoutBlockSpy,
  useGetWorkoutSheetByIdSpy,
} = vi.hoisted(() => ({
  formatExerciseMetaSpy: vi.fn(),
  printWorkoutBlockSpy: vi.fn(),
  useGetWorkoutSheetByIdSpy: vi.fn(),
}));

vi.mock("@/components/Button/Button", () => ({
  Button: ({
    children,
    onClick,
    type,
  }: {
    children: ReactNode;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
  }) => (
    <button type={type} onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/Skeleton/Skeleton", () => ({
  Skeleton: () => <div data-testid="sheet-skeleton" />,
}));

vi.mock("@/queries/useGetWorkoutSheetById", () => ({
  useGetWorkoutSheetById: useGetWorkoutSheetByIdSpy,
}));

vi.mock("../printWorkoutSheetReceipt", () => ({
  printWorkoutBlock: printWorkoutBlockSpy,
}));

vi.mock("../utils", () => ({
  formatExerciseMeta: formatExerciseMetaSpy,
}));

vi.mock("lucide-react", () => ({
  ChevronDown: () => <svg data-testid="chevron-down" />,
  Printer: () => <svg data-testid="printer-icon" />,
}));

import { WorkoutSheetCard } from "./WorkoutSheetCard";

const sheet = {
  workoutSheetId: 7,
  name: "Ficha A",
  goal: "Hipertrofia",
  instructorName: "Carla",
  instructor: { name: "Instrutora reserva" },
} as never;

describe("WorkoutSheetCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    formatExerciseMetaSpy.mockReturnValue("3 séries | 12 repetições");
    useGetWorkoutSheetByIdSpy.mockReturnValue({
      data: undefined,
      error: null,
      isFetching: false,
      isLoading: false,
    });
  });

  it("renders the summary and collapsed action", () => {
    render(
      <WorkoutSheetCard expanded={false} onToggle={vi.fn()} sheet={sheet} />,
    );

    expect(screen.getByText("Ficha A")).toBeInTheDocument();
    expect(
      screen.getByText(/Hipertrofia \| Instrutor: Carla/),
    ).toBeInTheDocument();
    expect(screen.getByText("0 treino(s)")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Ver treinos" }),
    ).toBeInTheDocument();
    expect(useGetWorkoutSheetByIdSpy).toHaveBeenCalledWith(undefined);
  });

  it("calls onToggle when the action button is clicked", () => {
    const onToggle = vi.fn();
    render(
      <WorkoutSheetCard expanded={false} onToggle={onToggle} sheet={sheet} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Ver treinos" }));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("shows loading state and skeletons while fetching details", () => {
    useGetWorkoutSheetByIdSpy.mockReturnValue({
      data: undefined,
      error: null,
      isFetching: true,
      isLoading: false,
    });

    render(<WorkoutSheetCard expanded onToggle={vi.fn()} sheet={sheet} />);

    expect(screen.getByText("Carregando...")).toBeInTheDocument();
    expect(screen.getAllByTestId("sheet-skeleton")).toHaveLength(2);
    expect(useGetWorkoutSheetByIdSpy).toHaveBeenCalledWith("7");
  });

  it("shows an error message when workout details fail to load", () => {
    useGetWorkoutSheetByIdSpy.mockReturnValue({
      data: undefined,
      error: new Error("Falhou"),
      isFetching: false,
      isLoading: false,
    });

    render(<WorkoutSheetCard expanded onToggle={vi.fn()} sheet={sheet} />);

    expect(
      screen.getByText("Não foi possível carregar os treinos desta ficha."),
    ).toBeInTheDocument();
  });

  it("renders sorted blocks and exercises and prints a workout block", () => {
    const blockB = {
      name: "Treino B",
      description: "Membros inferiores",
      executionOrder: 2,
      exercises: [
        {
          workoutSheetExerciseId: 20,
          executionOrder: 2,
          exerciseName: "Agachamento",
          sets: 4,
          repetitions: "10",
          restSeconds: 60,
          notes: "Carga moderada",
          muscleGroup: "Pernas",
        },
        {
          workoutSheetExerciseId: 10,
          executionOrder: 1,
          exerciseName: "Leg press",
          sets: 3,
          repetitions: "12",
          restSeconds: 45,
          notes: "",
          muscleGroup: "Quadríceps",
        },
      ],
    };

    const blockA = {
      name: "Treino A",
      description: "",
      executionOrder: 1,
      exercises: [],
    };

    useGetWorkoutSheetByIdSpy.mockReturnValue({
      data: {
        blocks: [blockB, blockA],
      },
      error: null,
      isFetching: false,
      isLoading: false,
    });

    render(<WorkoutSheetCard expanded onToggle={vi.fn()} sheet={sheet} />);

    expect(screen.getByText("2 treino(s)")).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "Imprimir treino" }),
    ).toHaveLength(2);
    expect(screen.getAllByText(/Treino/)[0]).toHaveTextContent("Treino A");
    expect(
      screen.getByText("Este treino ainda não possui exercícios."),
    ).toBeInTheDocument();
    expect(screen.getByText("1. Leg press")).toBeInTheDocument();
    expect(screen.getByText("2. Agachamento")).toBeInTheDocument();
    expect(screen.getByText("Carga moderada")).toBeInTheDocument();
    expect(screen.getByText("Quadríceps")).toBeInTheDocument();

    fireEvent.click(
      screen.getAllByRole("button", { name: "Imprimir treino" })[1],
    );
    expect(printWorkoutBlockSpy).toHaveBeenCalledWith(sheet, blockB);
    expect(formatExerciseMetaSpy).toHaveBeenCalled();
  });

  it("shows an empty state when the sheet has no blocks", () => {
    useGetWorkoutSheetByIdSpy.mockReturnValue({
      data: {
        blocks: [],
      },
      error: null,
      isFetching: false,
      isLoading: false,
    });

    render(<WorkoutSheetCard expanded onToggle={vi.fn()} sheet={sheet} />);

    expect(
      screen.getByText("Esta ficha ainda não possui treinos cadastrados."),
    ).toBeInTheDocument();
  });
});
