import type { WorkoutBlock, WorkoutSheetSummary } from "@/pages/WorkoutSheets/types";
import { formatDate, formatExerciseMeta } from "./utils";

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const safeText = (value: unknown, fallback = "-") =>
  escapeHtml(
    value === null || value === undefined || value === "" ? fallback : value,
  );

export const printWorkoutBlock = (
  sheet: WorkoutSheetSummary,
  block: WorkoutBlock,
) => {
  const printWindow = window.open("", "_blank", "width=420,height=900");

  if (!printWindow) return;

  const sortedExercises = [...(block.exercises ?? [])].sort(
    (a, b) => Number(a.executionOrder ?? 0) - Number(b.executionOrder ?? 0),
  );
  const exercisesMarkup = sortedExercises.length
    ? sortedExercises
        .map(
          (exercise) => `
            <div class="exercise">
              <div class="exercise-head">
                <span class="order">${safeText(exercise.executionOrder)}</span>
                <span class="name">${safeText(exercise.exerciseName)}</span>
              </div>
              <div class="meta">
                ${safeText(
                  formatExerciseMeta(
                    exercise.sets,
                    exercise.repetitions,
                    exercise.restSeconds,
                  ),
                  "Sem detalhes informados",
                )}
              </div>
              <div class="note">${safeText(exercise.notes ?? exercise.muscleGroup)}</div>
            </div>
          `,
        )
        .join("")
    : `<div class="empty">Nenhum exercício listado.</div>`;

  printWindow.document.write(`
    <html>
      <head>
        <title>${safeText(block.name)} - ${safeText(sheet.name)}</title>
        <style>
          @page { size: 80mm auto; margin: 4mm; }
          * { box-sizing: border-box; }
          html, body { margin: 0; padding: 0; }
          body {
            font-family: Arial, sans-serif;
            color: #111827;
            font-size: 11px;
            line-height: 1.35;
            display: flex;
            justify-content: center;
            background: #ffffff;
          }
          .receipt { width: 72mm; padding: 2mm 0; }
          .brand {
            text-align: center;
            border-bottom: 1px dashed #9ca3af;
            padding-bottom: 8px;
            margin-bottom: 8px;
          }
          .brand h1 { margin: 0 0 4px; font-size: 16px; }
          .brand p { margin: 0; color: #4b5563; font-size: 10px; }
          .section { border-bottom: 1px dashed #d1d5db; padding: 8px 0; }
          .label {
            display: block;
            color: #6b7280;
            font-size: 9px;
            text-transform: uppercase;
            margin-bottom: 2px;
          }
          .value { font-weight: 700; word-break: break-word; }
          .exercise {
            padding: 8px 0;
            border-bottom: 1px dashed #e5e7eb;
          }
          .exercise:last-child { border-bottom: 0; }
          .exercise-head { display: flex; gap: 8px; align-items: flex-start; }
          .order { font-weight: 700; min-width: 14px; }
          .name { font-weight: 700; flex: 1; }
          .meta, .note {
            margin-top: 4px;
            color: #4b5563;
            padding-left: 22px;
            word-break: break-word;
          }
          .empty { color: #4b5563; padding: 4px 0; }
          .footer {
            text-align: center;
            padding-top: 10px;
            color: #6b7280;
            font-size: 9px;
          }
        </style>
      </head>
      <body>
        <main class="receipt">
          <section class="brand">
            <h1>${safeText(block.name)}</h1>
            <p>${safeText(sheet.name)}</p>
          </section>

          <section class="section">
            <span class="label">Descrição</span>
            <div class="value">${safeText(block.description, "Sem descrição informada")}</div>
          </section>

          <section class="section">
            <span class="label">Objetivo</span>
            <div class="value">${safeText(sheet.goal, "Sem objetivo informado")}</div>
          </section>

          <section class="section">
            <span class="label">Instrutor</span>
            <div class="value">${safeText(sheet.instructorName ?? sheet.instructor?.name, "Não informado")}</div>
          </section>

          <section class="section">
            <span class="label">Período</span>
            <div class="value">Início: ${safeText(formatDate(sheet.startDate))}</div>
            <div class="value">Fim: ${safeText(formatDate(sheet.endDate))}</div>
          </section>

          <section class="section">
            <span class="label">Exercícios</span>
            ${exercisesMarkup}
          </section>

          <footer class="footer">Gym IQ</footer>
        </main>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};
