const KNOWN_LOCATIONS = [
  { name: "Fontana di Trevi", keys: ["fontana di trevi", "piazza di trevi"], lat: 41.9009, lng: 12.4833, zone: "Centro histórico" },
  { name: "Panteón", keys: ["panteon", "pantheon", "piazza della rotonda"], lat: 41.8986, lng: 12.4769, zone: "Centro histórico" },
  { name: "Coliseo", keys: ["coliseo", "colosseo", "piazza del colosseo", "foro romano"], lat: 41.8902, lng: 12.4922, zone: "Centro histórico" },
  { name: "Museos Vaticanos", keys: ["museos vaticanos", "viale vaticano", "vaticano"], lat: 41.9065, lng: 12.4536, zone: "Vaticano" },
  { name: "Basílica de San Pedro", keys: ["basilica de san pedro", "san pedro", "piazza san pietro"], lat: 41.9022, lng: 12.4539, zone: "Vaticano" },
  { name: "Castillo de Sant'Angelo", keys: ["castillo de sant'angelo", "castillo de santangelo", "lungotevere castello"], lat: 41.9031, lng: 12.4663, zone: "Vaticano" },
  { name: "Trastevere", keys: ["trastevere", "barrio de trastevere"], lat: 41.8896, lng: 12.4703, zone: "Trastevere" },
  { name: "Hotel Roma Centro", keys: ["hotel roma centro", "via del corso", "via nazionale"], lat: 41.9016, lng: 12.4863, zone: "Centro histórico" },
  { name: "Piazza Navona", keys: ["piazza navona"], lat: 41.8992, lng: 12.4731, zone: "Centro histórico" },
  { name: "Campidoglio", keys: ["piazza del campidoglio", "campidoglio"], lat: 41.8933, lng: 12.4828, zone: "Centro histórico" },
  { name: "Roma Termini", keys: ["termini", "roma termini"], lat: 41.901, lng: 12.501, zone: "Termini" },
  { name: "Aeropuerto de Fiumicino", keys: ["fiumicino", "aeropuerto de fiumicino"], lat: 41.8003, lng: 12.2389, zone: "Aeropuerto" },
  { name: "Torre Eiffel", keys: ["torre eiffel", "eiffel"], lat: 48.8584, lng: 2.2945, zone: "Centro" },
  { name: "Museo del Louvre", keys: ["louvre", "museo del louvre"], lat: 48.8606, lng: 2.3376, zone: "Centro" },
  { name: "Notre Dame", keys: ["notre dame"], lat: 48.853, lng: 2.3499, zone: "Centro" },
];

function clean(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function asNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  const next = Number(String(value).replace(",", "."));
  return Number.isFinite(next) ? next : null;
}

export function hasCoordinates(point = {}) {
  return point.lat !== undefined && point.lng !== undefined && Number.isFinite(Number(point.lat)) && Number.isFinite(Number(point.lng));
}

function toRad(value) {
  return (Number(value) * Math.PI) / 180;
}

export function distanceKm(a = {}, b = {}) {
  if (!hasCoordinates(a) || !hasCoordinates(b)) return Number.POSITIVE_INFINITY;
  const earthKm = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthKm * Math.asin(Math.sqrt(h));
}

export function buildLocationFromForm(form = {}, fallback = {}) {
  const lat = asNumber(form.lat ?? form.latitude ?? form.location?.lat ?? fallback.location?.lat);
  const lng = asNumber(form.lng ?? form.longitude ?? form.location?.lng ?? fallback.location?.lng);
  const address = form.address || form.zone || form.area || fallback.address || fallback.zone || fallback.area || fallback.location?.address || "";
  const zone = form.zone || form.area || fallback.zone || fallback.area || fallback.location?.zone || "";

  if (lat === null || lng === null) {
    return address || zone ? { address, zone } : null;
  }

  return { address, zone, lat, lng };
}

export function inferLocation(item = {}) {
  const existing = item.location || {};
  const manual = buildLocationFromForm({
    lat: item.lat ?? existing.lat,
    lng: item.lng ?? existing.lng,
    address: existing.address || item.address || item.name,
    zone: existing.zone || item.zone || item.area,
  });
  if (manual?.lat !== undefined && manual?.lng !== undefined) return manual;

  const candidates = [
    item.name,
    item.address,
    item.zone,
    item.area,
    item.near,
    existing.address,
    existing.zone,
  ].map(clean).filter(Boolean);

  const matched = KNOWN_LOCATIONS.find((location) =>
    location.keys.some((key) => candidates.some((candidate) => candidate.includes(clean(key)) || clean(key).includes(candidate)))
  );

  if (!matched) return manual;
  return {
    address: existing.address || item.address || item.name || matched.zone,
    zone: existing.zone || item.zone || item.area || matched.zone,
    lat: matched.lat,
    lng: matched.lng,
  };
}

export function searchKnownLocations(query = "", limit = 6) {
  const cleaned = clean(query);
  if (cleaned.length < 2) return [];

  return KNOWN_LOCATIONS
    .map((location) => {
      const haystack = [location.name, location.zone, ...location.keys].map(clean);
      const exact = haystack.some((value) => value === cleaned);
      const starts = haystack.some((value) => value.startsWith(cleaned));
      const contains = haystack.some((value) => value.includes(cleaned) || cleaned.includes(value));
      if (!exact && !starts && !contains) return null;
      return {
        id: `search-${clean(location.name)}-${location.lat}-${location.lng}`,
        name: location.name,
        type: "Resultado",
        source: "search",
        address: location.name,
        zone: location.zone,
        lat: location.lat,
        lng: location.lng,
        score: exact ? 3 : starts ? 2 : 1,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, limit);
}

export function normalizeMappableData(data = {}) {
  return {
    ...data,
    places: (data.places || []).map((place) => ({ ...place, location: inferLocation(place) })),
    restaurants: (data.restaurants || []).map((restaurant) => ({ ...restaurant, location: inferLocation(restaurant) })),
    lodgings: (data.lodgings || []).map((lodging) => ({ ...lodging, location: inferLocation(lodging) })),
    itineraryDays: (data.itineraryDays || []).map((day) => ({
      ...day,
      items: (day.items || []).map((item) => ({ ...item, location: inferLocation(item) })),
    })),
  };
}

function findRelatedEntity(activity = {}, collections = []) {
  const name = clean(activity.name);
  const address = clean(activity.address || activity.location?.address);
  return collections.flat().find((item) => {
    const itemName = clean(item.name);
    const itemAddress = clean(item.address || item.location?.address);
    if (!itemName && !itemAddress) return false;
    return Boolean(
      (name && itemName && (name.includes(itemName) || itemName.includes(name))) ||
      (address && itemAddress && (address.includes(itemAddress) || itemAddress.includes(address))) ||
      (address && itemName && (address.includes(itemName) || itemName.includes(address)))
    );
  });
}

export function getDayMapPoints(day = {}, { places = [], restaurants = [], lodgings = [] } = {}) {
  const seen = new Set();
  const points = [];
  const missing = [];
  const selectedDay = clean(day.day);

  function addPoint(point) {
    if (point.lat === undefined || point.lng === undefined) {
      if (point.address || point.zone) missing.push(point);
      return;
    }

    const key = `${point.lat}-${point.lng}-${clean(point.name)}`;
    if (!seen.has(key)) {
      seen.add(key);
      points.push(point);
    }
  }

  (day.items || []).forEach((activity, index) => {
    const related = findRelatedEntity(activity, [places, restaurants, lodgings]);
    const relatedLocation = related?.location?.lat !== undefined ? related.location : related ? inferLocation(related) : null;
    const location = activity.location?.lat !== undefined ? activity.location : relatedLocation || inferLocation(activity);
    const point = {
      id: `${day.day}-${index}-${activity.time}-${activity.name}`,
      activityIndex: index,
      name: activity.name,
      type: activity.type,
      time: activity.time,
      address: location?.address || activity.address || related?.address || related?.area || related?.zone || "",
      zone: location?.zone || related?.zone || related?.area || "",
      lat: location?.lat,
      lng: location?.lng,
      cost: activity.cost,
      duration: activity.duration,
      notes: activity.notes,
    };

    addPoint(point);
  });

  [...places, ...restaurants].filter((item) => clean(item.day) === selectedDay).forEach((item) => {
    const location = item.location?.lat !== undefined ? item.location : inferLocation(item);
    addPoint({
      id: `${day.day}-${item.name}`,
      name: item.name,
      type: item.category || item.food || "Lugar",
      time: "",
      address: location?.address || item.address || item.area || item.zone || "",
      zone: location?.zone || item.zone || item.area || "",
      lat: location?.lat,
      lng: location?.lng,
      cost: item.price,
      duration: item.duration,
      notes: item.note,
    });
  });

  return { points, missing };
}

export function getMapBounds(points = []) {
  if (!points.length) return null;
  const lats = points.map((point) => point.lat);
  const lngs = points.map((point) => point.lng);
  return {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs),
  };
}

export function getMapCenter(points = []) {
  const mappable = points.filter(hasCoordinates);
  if (!mappable.length) return { lat: 40.4168, lng: -3.7038 };
  return {
    lat: mappable.reduce((sum, point) => sum + Number(point.lat), 0) / mappable.length,
    lng: mappable.reduce((sum, point) => sum + Number(point.lng), 0) / mappable.length,
  };
}

export function lonLatToWorldPixel(lat, lng, zoom = 14) {
  const scale = 256 * 2 ** zoom;
  const sinLat = Math.sin((Number(lat) * Math.PI) / 180);
  return {
    x: ((Number(lng) + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale,
  };
}

export function worldPixelToLonLat(x, y, zoom = 14) {
  const scale = 256 * 2 ** zoom;
  const lng = (Number(x) / scale) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * Number(y)) / scale;
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return { lat, lng };
}

export function buildOsmTiles(center, zoom = 14, width = 960, height = 520) {
  const centerPx = lonLatToWorldPixel(center.lat, center.lng, zoom);
  const startX = centerPx.x - width / 2;
  const startY = centerPx.y - height / 2;
  const minTileX = Math.floor(startX / 256);
  const maxTileX = Math.floor((startX + width) / 256);
  const minTileY = Math.floor(startY / 256);
  const maxTileY = Math.floor((startY + height) / 256);
  const tileCount = 2 ** zoom;
  const tiles = [];

  for (let x = minTileX; x <= maxTileX; x += 1) {
    for (let y = minTileY; y <= maxTileY; y += 1) {
      if (y < 0 || y >= tileCount) continue;
      const wrappedX = ((x % tileCount) + tileCount) % tileCount;
      tiles.push({
        key: `${zoom}-${wrappedX}-${y}`,
        url: `https://tile.openstreetmap.org/${zoom}/${wrappedX}/${y}.png`,
        left: x * 256 - startX,
        top: y * 256 - startY,
      });
    }
  }

  return { tiles, centerPx, startX, startY, width, height, zoom, center };
}

export function projectPointToMap(point, mapModel) {
  const px = lonLatToWorldPixel(point.lat, point.lng, mapModel.zoom);
  return {
    left: px.x - mapModel.startX,
    top: px.y - mapModel.startY,
  };
}

export function clusterMapPoints(points = [], mapModel, radius = 34) {
  const clusters = [];
  points.filter(hasCoordinates).forEach((point, index) => {
    const position = projectPointToMap(point, mapModel);
    const existing = clusters.find((cluster) => Math.hypot(cluster.left - position.left, cluster.top - position.top) <= radius);
    if (existing) {
      existing.points.push({ ...point, originalIndex: index });
      existing.left = existing.points.reduce((sum, item) => sum + projectPointToMap(item, mapModel).left, 0) / existing.points.length;
      existing.top = existing.points.reduce((sum, item) => sum + projectPointToMap(item, mapModel).top, 0) / existing.points.length;
      return;
    }
    clusters.push({ id: `cluster-${point.id}`, left: position.left, top: position.top, points: [{ ...point, originalIndex: index }] });
  });
  return clusters;
}

export function orderActivitiesByProximity(items = []) {
  const withLocation = items.map((item, index) => ({ ...item, originalIndex: index, location: item.location || inferLocation(item) }));
  const fixedWithoutLocation = withLocation.filter((item) => !hasCoordinates(item.location));
  const remaining = withLocation.filter((item) => hasCoordinates(item.location));
  if (remaining.length < 2) return items;

  const ordered = [remaining.shift()];
  while (remaining.length) {
    const current = ordered[ordered.length - 1].location;
    let nextIndex = 0;
    let nextDistance = Number.POSITIVE_INFINITY;
    remaining.forEach((candidate, index) => {
      const candidateDistance = distanceKm(current, candidate.location);
      if (candidateDistance < nextDistance) {
        nextDistance = candidateDistance;
        nextIndex = index;
      }
    });
    ordered.push(remaining.splice(nextIndex, 1)[0]);
  }

  return [...ordered, ...fixedWithoutLocation].map((item, index) => ({
    ...item,
    time: item.time,
    routeOrder: index + 1,
    proximityHint: item.originalIndex !== index ? "Reordenado por cercanía" : item.proximityHint,
  }));
}

const NEARBY_PRESETS = [
  { name: "Cafetería cercana", type: "Cafetería", category: "nearby", latOffset: 0.0012, lngOffset: 0.001, distance: "2 min caminando" },
  { name: "Supermercado de barrio", type: "Supermercado", category: "nearby", latOffset: -0.0015, lngOffset: 0.0014, distance: "4 min caminando" },
  { name: "Restaurante recomendado", type: "Restaurante", category: "nearby", latOffset: 0.0018, lngOffset: -0.0013, distance: "5 min caminando" },
  { name: "Bar para desayunar", type: "Bar", category: "nearby", latOffset: -0.0009, lngOffset: -0.0016, distance: "3 min caminando" },
  { name: "Tienda de alimentación", type: "Tienda", category: "nearby", latOffset: 0.0022, lngOffset: 0.0004, distance: "6 min caminando" },
];

export function getNearbyUsefulPoints(lodgings = []) {
  return lodgings.flatMap((lodging, lodgingIndex) => {
    const location = lodging.location?.lat !== undefined ? lodging.location : inferLocation(lodging);
    if (location?.lat === undefined || location?.lng === undefined) return [];

    return NEARBY_PRESETS.map((preset, index) => ({
      id: `nearby-${lodgingIndex}-${index}`,
      name: preset.name,
      type: preset.type,
      category: preset.category,
      source: "nearby",
      relatedLodging: lodging.name,
      address: `${preset.type} cerca de ${lodging.name}`,
      zone: location.zone || lodging.address || "",
      lat: Number((location.lat + preset.latOffset).toFixed(6)),
      lng: Number((location.lng + preset.lngOffset).toFixed(6)),
      distance: preset.distance,
      notes: "Punto simulado generado localmente a partir de la ubicación del alojamiento.",
    }));
  });
}
