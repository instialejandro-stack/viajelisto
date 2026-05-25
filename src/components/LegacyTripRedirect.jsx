import React from "react";
import { Navigate, useParams } from "react-router-dom";
import { useAppState } from "../state/AppStateContext.jsx";

const sectionMap = {
  viaje: "summary",
  itinerario: "itinerary",
  transporte: "transport",
  alojamiento: "accommodation",
  lugares: "places",
  restaurantes: "restaurants",
  presupuesto: "budget",
  documentos: "documents",
  checklist: "checklist",
  suggestions: "suggestions",
  print: "print",
};

export default function LegacyTripRedirect({ section = "summary" }) {
  const { activeTripId, trips } = useAppState();
  const params = useParams();
  const tripId = params.tripId || activeTripId;
  const tripExists = tripId && trips.some((trip) => String(trip.id) === String(tripId));
  const target = sectionMap[section] || section;

  if (!tripExists) return <Navigate to="/dashboard" replace />;
  return <Navigate to={`/trips/${tripId}/${target}`} replace />;
}
