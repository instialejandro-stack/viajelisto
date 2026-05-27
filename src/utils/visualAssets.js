const images = [
  {
    keys: ["presupuesto", "gasto", "gastos", "coste", "coste por persona", "financiero", "moneda", "deuda"],
    url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    keys: ["itinerario", "agenda", "calendario", "día", "hoy", "actividad", "actividades"],
    url: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1200&q=80",
  },
  {
    keys: ["mapa", "ruta", "rutas", "lugares", "zona", "zonas"],
    url: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    keys: ["transporte", "vuelo", "tren", "bus", "reservas"],
    url: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80",
  },
  {
    keys: ["alojamiento", "hotel", "apartamento", "estancia"],
    url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
  },
  {
    keys: ["restaurante", "restaurantes", "comida", "cena", "cafetería"],
    url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
  },
  {
    keys: ["documentos", "documento", "pasaporte", "archivo"],
    url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80",
  },
  {
    keys: ["checklist", "tareas", "preparación", "preparacion", "comprobador"],
    url: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    keys: ["maleta", "equipaje"],
    url: "https://images.unsplash.com/photo-1553531889-e6cf4d692b1b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    keys: ["participantes", "grupo", "votaciones", "personas"],
    url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
  },
  {
    keys: ["notas", "diario", "recuerdos", "valoraciones"],
    url: "https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&w=1200&q=80",
  },
  {
    keys: ["dashboard", "resumen", "viaje", "inicio"],
    url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  },
];

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function getVisualAsset(...values) {
  const text = normalize(values.filter(Boolean).join(" "));
  return images.find((image) => image.keys.some((key) => text.includes(normalize(key))))?.url || images.at(-1).url;
}

export function backgroundImageStyle(url, strength = "soft") {
  const overlays = {
    soft: "linear-gradient(90deg, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.88) 48%, rgba(255,255,255,0.58) 100%)",
    card: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.86) 58%, rgba(255,255,255,0.58) 100%)",
    strong: "linear-gradient(90deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.9) 62%, rgba(255,255,255,0.7) 100%)",
  };
  return {
    backgroundImage: `${overlays[strength] || overlays.soft}, url("${url}")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
}
