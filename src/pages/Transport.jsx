import React, { useState } from "react";
import { CheckCircle2, Clock3, Plus, Ticket, WalletCards } from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import FilterPills from "../components/FilterPills.jsx";
import PageHeader from "../components/PageHeader.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatCard from "../components/StatCard.jsx";
import TransportCard from "../components/TransportCard.jsx";
import EmptyState from "../components/EmptyState.jsx";
import TransportFormModal from "../components/TransportFormModal.jsx";
import { useAppState } from "../state/AppStateContext.jsx";

const filters = ["Todos", "Vuelos", "Trenes", "Autobuses", "Pendientes", "Confirmados"];

export default function Transport() {
  const { transports, deleteTransport } = useAppState();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const confirmed = transports.filter((item) => ["comprado", "confirmado"].includes(item.status)).length;
  const pending = transports.filter((item) => item.status === "pendiente").length;
  const total = transports.reduce((sum, item) => sum + Number.parseInt(item.price, 10), 0);

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Logística"
        title="Transporte"
        subtitle="Gestiona vuelos, trenes, autobuses y desplazamientos internos de tu viaje."
        actionLabel="Añadir transporte"
        icon={Plus}
        onAction={() => {
          setEditing(null);
          setModalOpen(true);
        }}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Ticket} label="Transportes totales" value={transports.length} hint="Incluye ida, traslados y excursiones" />
        <StatCard icon={CheckCircle2} label="Comprados/confirmados" value={confirmed} hint="Listos para viajar" accent="emerald" />
        <StatCard icon={Clock3} label="Pendientes" value={pending} hint="Revisar antes de salir" accent="amber" />
        <StatCard icon={WalletCards} label="Coste total" value={`${total} €`} hint="Según transportes guardados" accent="violet" />
      </div>

      <FilterPills filters={filters} />

      <SectionCard title="Desplazamientos del viaje">
        {transports.length ? (
          <div className="grid gap-5 lg:grid-cols-3">
            {transports.map((transport, index) => (
              <TransportCard
                key={`${transport.locator || transport.route}-${index}`}
                transport={transport}
                onEdit={() => {
                  setEditing({ transport, index });
                  setModalOpen(true);
                }}
                onDelete={() => setDeleting({ index, name: transport.route })}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="Aún no hay transportes" description="Añade vuelos, trenes o traslados para completar la logística del viaje." actionLabel="Añadir transporte" onAction={() => setModalOpen(true)} icon={Plus} />
        )}
      </SectionCard>
      <TransportFormModal open={modalOpen} transport={editing?.transport} index={editing?.index} onClose={() => { setModalOpen(false); setEditing(null); }} />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Eliminar transporte"
        description={`Vas a eliminar ${deleting?.name || "este transporte"}. Esta acción no se puede deshacer en la demo.`}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          deleteTransport(deleting.index);
          setDeleting(null);
        }}
      />
    </div>
  );
}
