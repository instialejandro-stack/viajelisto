import React, { useState } from "react";
import { CalendarDays, MapPinned, Plus, Star, Utensils } from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import FilterPills from "../components/FilterPills.jsx";
import PageHeader from "../components/PageHeader.jsx";
import RestaurantCard from "../components/RestaurantCard.jsx";
import RestaurantFormModal from "../components/RestaurantFormModal.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatCard from "../components/StatCard.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { useAppState } from "../state/AppStateContext.jsx";

const filters = ["Todos", "Pasta", "Pizza", "Cafetería", "Económico", "Cerca del hotel", "Requieren reserva"];

export default function Restaurants() {
  const { restaurants, activeTrip, deleteRestaurant } = useAppState();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const bookingRequired = restaurants.filter((restaurant) => restaurant.needsBooking).length;
  const zones = new Set(restaurants.map((restaurant) => restaurant.area)).size;

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow={`Comer en ${activeTrip?.destination || "el destino"}`}
        title="Restaurantes"
        subtitle="Guarda restaurantes, cafeterías y sitios recomendados cerca de tus planes."
        actionLabel="Añadir restaurante"
        icon={Plus}
        onAction={() => {
          setEditing(null);
          setModalOpen(true);
        }}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Utensils} label="Restaurantes guardados" value={restaurants.length} hint="Opciones por zona" />
        <StatCard icon={CalendarDays} label="Reservas necesarias" value={bookingRequired} hint="Conviene confirmar" accent="amber" />
        <StatCard icon={Star} label="Precio medio" value="€€" hint="Entre económico y especial" accent="emerald" />
        <StatCard icon={MapPinned} label="Zonas cubiertas" value={zones} hint="Centro, Vaticano y Trastevere" accent="violet" />
      </div>

      <FilterPills filters={filters} />

      <SectionCard title="Sitios donde comer">
        {restaurants.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {restaurants.map((restaurant, index) => (
              <RestaurantCard
                key={`${restaurant.name}-${index}`}
                restaurant={restaurant}
                onEdit={() => {
                  setEditing({ restaurant, index });
                  setModalOpen(true);
                }}
                onDelete={() => setDeleting({ index, name: restaurant.name })}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="Aún no hay restaurantes" description="Guarda restaurantes, cafeterías o recomendaciones por zona cuando empieces a planificar comidas." actionLabel="Añadir restaurante" onAction={() => { setEditing(null); setModalOpen(true); }} icon={Utensils} />
        )}
      </SectionCard>
      <RestaurantFormModal open={modalOpen} restaurant={editing?.restaurant} index={editing?.index} onClose={() => { setModalOpen(false); setEditing(null); }} />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Eliminar restaurante"
        description={`Vas a eliminar ${deleting?.name || "este restaurante"}. Esta acción no se puede deshacer en la demo.`}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          deleteRestaurant(deleting.index);
          setDeleting(null);
        }}
      />
    </div>
  );
}
