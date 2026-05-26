import React, { useState } from "react";
import { BedDouble, CheckCircle2, Coffee, Moon, Plus, WalletCards } from "lucide-react";
import AccommodationCard from "../components/AccommodationCard.jsx";
import AccommodationFormModal from "../components/AccommodationFormModal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import PageHeader from "../components/PageHeader.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatCard from "../components/StatCard.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { useAppState } from "../state/AppStateContext.jsx";
import { getNearbyUsefulPoints } from "../utils/mapUtils.js";

export default function Lodging() {
  const { lodgings, deleteAccommodation } = useAppState();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const total = lodgings.reduce((sum, item) => sum + Number.parseInt(item.price, 10), 0);
  const confirmed = lodgings.filter((item) => item.status === "reservado").length;
  const nearbyCount = getNearbyUsefulPoints(lodgings).length;

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Estancias"
        title="Alojamiento"
        subtitle="Guarda tus hoteles, apartamentos y estancias con sus horarios y reservas."
        actionLabel="Añadir alojamiento"
        icon={Plus}
        onAction={() => {
          setEditing(null);
          setModalOpen(true);
        }}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Moon} label="Noches reservadas" value={lodgings[0]?.nights || "0"} hint={lodgings[0]?.days || "Por definir"} />
        <StatCard icon={BedDouble} label="Alojamientos" value={lodgings.length} hint="Estancia principal" accent="emerald" />
        <StatCard icon={WalletCards} label="Coste total" value={`${total} €`} hint="Reserva completa" accent="violet" />
        <StatCard icon={nearbyCount ? Coffee : CheckCircle2} label={nearbyCount ? "Cerca del alojamiento" : "Reservas confirmadas"} value={nearbyCount || confirmed} hint={nearbyCount ? "Comida y compras útiles" : "Sin acciones urgentes"} accent="emerald" />
      </div>

      <SectionCard title="Estancias guardadas">
        {lodgings.length ? (
          <div className="grid gap-5">
            {lodgings.map((lodging, index) => (
              <AccommodationCard
                key={`${lodging.name}-${index}`}
                lodging={lodging}
                onEdit={() => {
                  setEditing({ lodging, index });
                  setModalOpen(true);
                }}
                onDelete={() => setDeleting({ index, name: lodging.name })}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="Aún no hay alojamiento" description="Guarda hoteles, apartamentos o estancias cuando tengas una reserva candidata." actionLabel="Añadir alojamiento" onAction={() => setModalOpen(true)} icon={BedDouble} />
        )}
      </SectionCard>
      <AccommodationFormModal open={modalOpen} lodging={editing?.lodging} index={editing?.index} onClose={() => { setModalOpen(false); setEditing(null); }} />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Eliminar alojamiento"
        description={`Vas a eliminar ${deleting?.name || "este alojamiento"}. Esta acción no se puede deshacer en la demo.`}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          deleteAccommodation(deleting.index);
          setDeleting(null);
        }}
      />
    </div>
  );
}
