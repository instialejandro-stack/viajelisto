import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./layouts/AppShell.jsx";
import LegacyTripRedirect from "./components/LegacyTripRedirect.jsx";
import RequireOnboarding from "./components/RequireOnboarding.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import WelcomePage from "./pages/WelcomePage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Ideas from "./pages/Ideas.jsx";
import TripSummary from "./pages/TripSummary.jsx";
import Itinerary from "./pages/Itinerary.jsx";
import Transport from "./pages/Transport.jsx";
import Lodging from "./pages/Lodging.jsx";
import Places from "./pages/Places.jsx";
import Restaurants from "./pages/Restaurants.jsx";
import Budget from "./pages/Budget.jsx";
import Documents from "./pages/Documents.jsx";
import PreparationChecklist from "./pages/PreparationChecklist.jsx";
import Packing from "./pages/Packing.jsx";
import DayMode from "./pages/DayMode.jsx";
import TripMap from "./pages/TripMap.jsx";
import Reservations from "./pages/Reservations.jsx";
import GroupVotes from "./pages/GroupVotes.jsx";
import Currency from "./pages/Currency.jsx";
import ZoneMap from "./pages/ZoneMap.jsx";
import Exports from "./pages/Exports.jsx";
import Templates from "./pages/Templates.jsx";
import History from "./pages/History.jsx";
import ActivityProgress from "./pages/ActivityProgress.jsx";
import PersonalNotes from "./pages/PersonalNotes.jsx";
import ContactsSafety from "./pages/ContactsSafety.jsx";
import TravelMemories from "./pages/TravelMemories.jsx";
import Reviews from "./pages/Reviews.jsx";
import Suggestions from "./pages/Suggestions.jsx";
import FinalCheck from "./pages/FinalCheck.jsx";
import PrintTripPage from "./pages/PrintTripPage.jsx";
import { AppStateProvider } from "./state/AppStateContext.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppStateProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/trip/print" element={<LegacyTripRedirect section="print" />} />
          <Route element={<RequireOnboarding><AppShell /></RequireOnboarding>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/ideas" element={<Ideas />} />

            {/* Legacy Spanish redirects */}
            <Route path="/viaje" element={<LegacyTripRedirect section="summary" />} />
            <Route path="/suggestions" element={<LegacyTripRedirect section="suggestions" />} />
            <Route path="/itinerario" element={<LegacyTripRedirect section="itinerary" />} />
            <Route path="/transporte" element={<LegacyTripRedirect section="transport" />} />
            <Route path="/alojamiento" element={<LegacyTripRedirect section="accommodation" />} />
            <Route path="/lugares" element={<LegacyTripRedirect section="places" />} />
            <Route path="/restaurantes" element={<LegacyTripRedirect section="restaurants" />} />
            <Route path="/presupuesto" element={<LegacyTripRedirect section="budget" />} />
            <Route path="/documentos" element={<LegacyTripRedirect section="documents" />} />
            <Route path="/checklist" element={<LegacyTripRedirect section="checklist" />} />
            <Route path="/preparacion" element={<LegacyTripRedirect section="checklist" />} />
            <Route path="/maleta" element={<LegacyTripRedirect section="packing" />} />
            <Route path="/dia" element={<LegacyTripRedirect section="day" />} />
            <Route path="/today" element={<LegacyTripRedirect section="day" />} />
            <Route path="/reservas" element={<LegacyTripRedirect section="reservations" />} />
            <Route path="/bookings" element={<LegacyTripRedirect section="reservations" />} />
            <Route path="/votaciones" element={<LegacyTripRedirect section="votes" />} />
            <Route path="/moneda" element={<LegacyTripRedirect section="currency" />} />
            <Route path="/zonas" element={<LegacyTripRedirect section="zones" />} />
            <Route path="/exportaciones" element={<LegacyTripRedirect section="exports" />} />
            <Route path="/plantillas" element={<LegacyTripRedirect section="templates" />} />
            <Route path="/historial" element={<LegacyTripRedirect section="history" />} />
            <Route path="/realizadas" element={<LegacyTripRedirect section="activity-progress" />} />
            <Route path="/notas" element={<LegacyTripRedirect section="notes" />} />
            <Route path="/contactos" element={<LegacyTripRedirect section="contacts" />} />
            <Route path="/emergencias" element={<LegacyTripRedirect section="contacts" />} />
            <Route path="/emergency" element={<LegacyTripRedirect section="contacts" />} />
            <Route path="/diario" element={<LegacyTripRedirect section="memories" />} />
            <Route path="/journal" element={<LegacyTripRedirect section="memories" />} />
            <Route path="/recuerdos" element={<LegacyTripRedirect section="memories" />} />
            <Route path="/valoraciones" element={<LegacyTripRedirect section="review" />} />
            <Route path="/review" element={<LegacyTripRedirect section="review" />} />
            <Route path="/comprobador" element={<LegacyTripRedirect section="final-check" />} />
            <Route path="/mapa" element={<LegacyTripRedirect section="map" />} />
            <Route path="/map" element={<LegacyTripRedirect section="map" />} />

            {/* Trip routes */}
            <Route path="/trips/:tripId" element={<LegacyTripRedirect section="summary" />} />
            <Route path="/trips/:tripId/summary" element={<TripSummary />} />
            <Route path="/trips/:tripId/suggestions" element={<Suggestions />} />
            <Route path="/trips/:tripId/final-check" element={<FinalCheck />} />
            <Route path="/trips/:tripId/itinerary" element={<Itinerary />} />
            <Route path="/trips/:tripId/map" element={<TripMap />} />
            <Route path="/trips/:tripId/transport" element={<Transport />} />
            <Route path="/trips/:tripId/accommodation" element={<Lodging />} />
            <Route path="/trips/:tripId/places" element={<Places />} />
            <Route path="/trips/:tripId/restaurants" element={<Restaurants />} />
            <Route path="/trips/:tripId/budget" element={<Budget />} />
            <Route path="/trips/:tripId/documents" element={<Documents />} />

            {/* Merged: Checklist + Preparation → PreparationChecklist */}
            <Route path="/trips/:tripId/checklist" element={<PreparationChecklist />} />
            <Route path="/trips/:tripId/preparation" element={<PreparationChecklist />} />

            <Route path="/trips/:tripId/packing" element={<Packing />} />
            <Route path="/trips/:tripId/day" element={<DayMode />} />
            <Route path="/trips/:tripId/today" element={<DayMode />} />
            <Route path="/trips/:tripId/reservations" element={<Reservations />} />
            <Route path="/trips/:tripId/bookings" element={<Reservations />} />
            <Route path="/trips/:tripId/votes" element={<GroupVotes />} />
            <Route path="/trips/:tripId/currency" element={<Currency />} />
            <Route path="/trips/:tripId/zones" element={<ZoneMap />} />
            <Route path="/trips/:tripId/exports" element={<Exports />} />
            <Route path="/trips/:tripId/templates" element={<Templates />} />
            <Route path="/trips/:tripId/history" element={<History />} />
            <Route path="/trips/:tripId/activity-progress" element={<ActivityProgress />} />
            <Route path="/trips/:tripId/notes" element={<PersonalNotes />} />

            {/* Merged: Contacts + Emergencies → ContactsSafety */}
            <Route path="/trips/:tripId/contacts" element={<ContactsSafety />} />
            <Route path="/trips/:tripId/emergencies" element={<ContactsSafety />} />
            <Route path="/trips/:tripId/emergency" element={<ContactsSafety />} />

            {/* Merged: Diary + Memories → TravelMemories */}
            <Route path="/trips/:tripId/memories" element={<TravelMemories />} />
            <Route path="/trips/:tripId/diary" element={<TravelMemories />} />
            <Route path="/trips/:tripId/journal" element={<TravelMemories />} />

            <Route path="/trips/:tripId/reviews" element={<Reviews />} />
            <Route path="/trips/:tripId/review" element={<Reviews />} />
          </Route>
          <Route path="/trips/:tripId/print" element={<PrintTripPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AppStateProvider>
  </React.StrictMode>
);
