import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppState } from "../state/AppStateContext.jsx";

export default function RequireOnboarding({ children }) {
  const { onboardingCompleted } = useAppState();
  const location = useLocation();
  const storedCompleted = (() => {
    try {
      return window.localStorage.getItem("viajelisto.onboardingCompleted") === "true";
    } catch {
      return false;
    }
  })();

  if (!onboardingCompleted && !storedCompleted) {
    return <Navigate to="/welcome" replace state={{ from: location.pathname }} />;
  }

  return children;
}
