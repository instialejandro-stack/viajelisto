import React from "react";
import { ArrowLeft, Printer } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import PrintItineraryDay from "../components/PrintItineraryDay.jsx";
import PrintSection from "../components/PrintSection.jsx";
import PrintTable from "../components/PrintTable.jsx";
import { useAppState } from "../state/AppStateContext.jsx";

function formatMoney(value) {
  return `${value.toLocaleString("es-ES")} €`;
}

function getPendingAmount(row) {
  return Math.max(row.estimated - row.spent, 0);
}

export default function PrintTripPage() {
  const { tripId } = useParams();
  const { trips, activeTrip, activeTripId, setActiveTripId, itineraryDays, expenses, checklist, budgetRows, documents, lodgings, places, restaurants, transports } = useAppState();
  const invalidTripRoute = Boolean(tripId && !trips.some((trip) => String(trip.id) === String(tripId)));
  React.useEffect(() => {
    if (tripId && !invalidTripRoute) setActiveTripId(tripId);
  }, [tripId, invalidTripRoute]);

  if (invalidTripRoute) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-10 text-ink">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-soft">
          <p className="text-sm font-black uppercase text-primary-700">Resumen imprimible</p>
          <h1 className="mt-3 text-3xl font-black">No encontramos este viaje</h1>
          <p className="mt-3 text-slate-500">Puede que se haya eliminado o que el enlace ya no sea valido.</p>
          <Link to="/dashboard" className="primary-button mt-6 justify-center">
            Volver al Dashboard
          </Link>
        </div>
      </main>
    );
  }
  const extraPaid = expenses
    .filter((expense) => expense.userAdded && expense.status === "pagado")
    .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const spentTotal = budgetRows.reduce((sum, row) => sum + row.spent, 0) + extraPaid;
  const categoryRows = budgetRows.map((row) => ({
    ...row,
    spent:
      row.spent +
      expenses
        .filter((expense) => expense.userAdded && expense.status === "pagado" && expense.category === row.category)
        .reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
  }));
  const pendingTasks = Object.entries(checklist).map(([group, tasks]) => ({
    group,
    tasks: tasks.filter((task) => !task.done),
  }));

  const handlePrint = () => window.print();

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-ink print:bg-white print:px-0 print:py-0">
      <div className="mx-auto mb-5 flex max-w-5xl flex-wrap items-center justify-between gap-3 print:hidden">
        <Link to={`/trips/${activeTripId}/summary`} className="secondary-button">
          <ArrowLeft size={16} />
          Volver al viaje
        </Link>
        <button type="button" onClick={handlePrint} className="primary-button">
          <Printer size={16} />
          Imprimir / Guardar PDF
        </button>
      </div>

      <div className="print-page mx-auto max-w-5xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8 print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <header className="border-b border-slate-200 pb-6">
          <p className="text-sm font-black uppercase tracking-wide text-primary-700">Resumen imprimible</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-ink">{activeTrip?.name || "Viaje"}</h1>
              <p className="mt-2 text-slate-500">Fechas: {activeTrip?.dates || "Por definir"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 px-4 py-3 text-sm print:rounded-none">
              <p>
                <strong>Estado:</strong> {activeTrip?.status || "Por definir"}
              </p>
              <p>
                <strong>Personas:</strong> {activeTrip?.people || "Por definir"}
              </p>
              <p>
                <strong>Presupuesto:</strong> {activeTrip?.budget || "0 €"}
              </p>
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-5">
          <PrintSection title="Resumen general">
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                ["Preparación", `${activeTrip?.progress || 0}%`],
                ["Tareas pendientes", pendingTasks.reduce((sum, group) => sum + group.tasks.length, 0)],
                ["Reservas confirmadas", transports.filter((item) => ["comprado", "confirmado"].includes(item.status)).length + lodgings.filter((item) => item.status === "reservado").length],
                ["Presupuesto gastado", formatMoney(spentTotal)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-slate-50 p-4 print:rounded-none print:border print:border-slate-200 print:bg-white">
                  <p className="text-xs font-black uppercase text-slate-500">{label}</p>
                  <p className="mt-2 text-xl font-black text-ink">{value}</p>
                </div>
              ))}
            </div>
          </PrintSection>

          <PrintSection title="Transporte" subtitle="Transportes principales del viaje.">
            <PrintTable
              columns={[
                { key: "route", label: "Trayecto" },
                { key: "date", label: "Fecha" },
                { key: "time", label: "Hora", render: (row) => `${row.departure} - ${row.arrival}` },
                { key: "company", label: "Compañía" },
                { key: "status", label: "Estado" },
                { key: "locator", label: "Localizador" },
              ]}
              rows={transports}
            />
          </PrintSection>

          <PrintSection title="Alojamiento">
            <PrintTable
              columns={[
                { key: "name", label: "Alojamiento" },
                { key: "address", label: "Dirección" },
                { key: "checkIn", label: "Check-in" },
                { key: "checkOut", label: "Check-out" },
                { key: "price", label: "Precio" },
                { key: "status", label: "Estado" },
              ]}
              rows={lodgings}
            />
          </PrintSection>

          <PrintSection title="Itinerario por días" subtitle="Versión compacta para llevar durante el viaje.">
            <div className="grid gap-3">
              {itineraryDays.map((day) => (
                <PrintItineraryDay key={day.day} day={day} />
              ))}
            </div>
          </PrintSection>

          <PrintSection title="Lugares importantes">
            <PrintTable
              columns={[
                { key: "name", label: "Lugar" },
                { key: "priority", label: "Prioridad" },
                { key: "price", label: "Precio" },
                { key: "needsBooking", label: "Reserva", render: (row) => (row.needsBooking ? "Sí" : "No") },
                { key: "day", label: "Día" },
              ]}
              rows={places}
            />
          </PrintSection>

          <PrintSection title="Restaurantes guardados">
            <PrintTable
              columns={[
                { key: "name", label: "Restaurante" },
                { key: "area", label: "Zona" },
                { key: "food", label: "Tipo" },
                { key: "price", label: "Precio" },
                { key: "day", label: "Día sugerido" },
              ]}
              rows={restaurants}
            />
          </PrintSection>

          <PrintSection title="Presupuesto">
            <PrintTable
              columns={[
                { key: "category", label: "Categoría" },
                { key: "estimated", label: "Estimado", render: (row) => formatMoney(row.estimated) },
                { key: "spent", label: "Gastado", render: (row) => formatMoney(row.spent) },
                { key: "pending", label: "Pendiente", render: (row) => formatMoney(getPendingAmount(row)) },
              ]}
              rows={categoryRows}
            />
          </PrintSection>

          <PrintSection title="Documentos">
            <PrintTable
              columns={[
                { key: "name", label: "Documento" },
                { key: "type", label: "Tipo" },
                { key: "status", label: "Estado" },
                { key: "related", label: "Relacionado con" },
                { key: "date", label: "Fecha" },
              ]}
              rows={documents}
            />
          </PrintSection>

          <PrintSection title="Checklist pendiente" subtitle="Tareas no completadas separadas por momento del viaje.">
            <div className="grid gap-4 sm:grid-cols-3">
              {pendingTasks.map(({ group, tasks }) => (
                <div key={group} className="rounded-xl border border-slate-200 p-4 print:rounded-none">
                  <h3 className="font-black text-ink">{group}</h3>
                  {tasks.length ? (
                    <ul className="mt-3 grid gap-2 text-sm text-slate-700">
                      {tasks.map((task) => (
                        <li key={`${group}-${task.title}`} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-600" />
                          <span>
                            <strong className="font-black text-ink">{task.title}</strong>
                            <span className="text-slate-500"> - {task.priority}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">Sin tareas pendientes.</p>
                  )}
                </div>
              ))}
            </div>
          </PrintSection>
        </div>

        <footer className="mt-8 border-t border-slate-200 pt-4 text-center text-sm font-bold text-slate-500">
          Generado con ViajeListo
        </footer>
      </div>
    </main>
  );
}
