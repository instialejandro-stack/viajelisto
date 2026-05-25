# ViajeListo: Arquitectura visual y estructura frontend

## Enfoque UX/UI

ViajeListo debe sentirse como un centro de mando tranquilo para viajes: visual, claro y con poca friccion. La prioridad inicial no es resolver logica compleja, sino transmitir control: que el usuario entienda en segundos que puede pasar de una idea suelta a un viaje organizado con reservas, presupuesto, documentos y tareas.

Principios de producto:

- Una accion principal por pantalla.
- Informacion escaneable mediante tarjetas, badges y progresos.
- Navegacion persistente para que el usuario nunca se sienta perdido.
- Datos conectados visualmente aunque todavia sean mockeados.
- Apariencia premium, limpia y preparada para mostrar a usuarios o inversores.

## Estructura de carpetas propuesta

```txt
src/
  components/
    Badge.jsx
    BudgetRow.jsx
    ChecklistItem.jsx
    ItineraryItem.jsx
    ProgressBar.jsx
    SectionCard.jsx
    StatCard.jsx
    TripCard.jsx
  data/
    mockData.js
  layouts/
    AppShell.jsx
  pages/
    LandingPage.jsx
    Dashboard.jsx
    Ideas.jsx
    TripSummary.jsx
    Itinerary.jsx
    Transport.jsx
    Lodging.jsx
    Places.jsx
    Restaurants.jsx
    Budget.jsx
    Documents.jsx
    Checklist.jsx
  main.jsx
  styles.css
```

Evolucion recomendada cuando el producto crezca:

```txt
src/
  app/
    routes.jsx
  components/
    ui/
    travel/
    layout/
  data/
    mock/
  features/
    itinerary/
    budget/
    documents/
    checklist/
  hooks/
  lib/
  styles/
```

La primera version mantiene una estructura simple para avanzar rapido, pero ya separa paginas, layout, componentes y datos.

## Componentes reutilizables principales

- `AppShell`: estructura interna de la app con sidebar desktop, header y navegacion movil.
- `Badge`: estados visuales como idea, pendiente, comprado, confirmado, reservado, subido o completado.
- `TripCard`: resumen de viaje con imagen, fechas, estado, presupuesto y progreso.
- `StatCard`: metricas resumidas para presupuesto, tareas, transporte o preparacion.
- `ProgressBar`: progreso visual reusable para viaje y presupuesto.
- `SectionCard`: contenedor consistente para secciones de contenido.
- `ItineraryItem`: item de timeline con hora, actividad, tipo, coste, direccion y notas.
- `BudgetRow`: fila con estimado, gastado y barra de uso.
- `ChecklistItem`: tarea con estado completado o pendiente.

Componentes futuros:

- `EmptyState`
- `PageHeader`
- `QuickActionGrid`
- `DocumentCard`
- `PlaceCard`
- `TransportCard`
- `RestaurantCard`
- `MapPlaceholder`

## Paginas y layouts

La app se divide en dos experiencias:

- `LandingPage`: pagina publica para explicar la propuesta de valor.
- `AppShell`: experiencia privada o de producto, con navegacion persistente y pantallas internas.

Paginas internas:

- `Dashboard`: todos los viajes y estado global.
- `Ideas`: comparativa de destinos antes de elegir.
- `TripSummary`: vista principal del viaje elegido.
- `Itinerary`: plan diario por tabs y timeline.
- `Transport`: vuelos, trenes, autobuses y traslados.
- `Lodging`: alojamiento principal y reservas.
- `Places`: puntos de interes priorizados.
- `Restaurants`: lugares para comer.
- `Budget`: control de gasto por categorias.
- `Documents`: documentos importantes.
- `Checklist`: tareas antes, durante y despues del viaje.

## Navegacion general

Rutas actuales:

```txt
/              Landing
/dashboard     Dashboard de viajes
/ideas         Ideas de viaje
/viaje         Resumen del viaje
/itinerario    Itinerario diario
/transporte    Transporte
/alojamiento   Alojamiento
/lugares       Lugares que visitar
/restaurantes  Restaurantes
/presupuesto   Presupuesto
/documentos    Documentos
/checklist     Checklist
```

Desktop:

- Sidebar fijo a la izquierda.
- Header superior con contexto del viaje y CTA.
- Contenido en area amplia con cards y grids.

Movil:

- Header compacto.
- Navegacion horizontal desplazable.
- Cards en una columna.
- Acciones principales visibles arriba.

## Guia visual

Colores:

- Fondo principal: `#f6f8fb`
- Superficies: `#ffffff`
- Texto principal: `#172033`
- Texto secundario: grises suaves de Tailwind.
- Lineas/bordes: `#e6ebf2`
- Color principal: cyan/turquesa `#06b6d4`
- Estados positivos: emerald.
- Estados pendientes: amber.
- Estados neutros: slate.

Tipografia:

- Sans serif de sistema, preparada para sustituirse por Inter o Geist.
- Titulares con peso alto (`font-black`) para dar presencia SaaS.
- Texto secundario pequeno y legible.

Espaciado:

- Layout con padding `16px` en movil, `24-32px` en desktop.
- Gap base entre secciones: `24px`.
- Cards con padding `20-32px` segun jerarquia.

Tarjetas:

- Fondo blanco.
- Borde suave.
- Radio amplio pero profesional.
- Sombra sutil para dar profundidad sin aspecto decorativo pesado.

Botones:

- Primario: fondo turquesa, texto blanco, icono a la izquierda o derecha.
- Secundario: fondo blanco, borde suave, texto oscuro.
- Icon buttons: cuadrados redondeados con hover visible.

## Responsive

Desktop:

- Sidebar fijo de `288px`.
- Grids de 2, 3 o 4 columnas segun densidad.
- Imagenes de hero y resumen ocupan espacio relevante.
- Tablas ligeras sustituidas por filas/cards para mantener claridad.

Tablet:

- Grids de 2 columnas.
- Sidebar puede mantenerse oculto si el ancho no permite comodidad.

Movil:

- Navegacion horizontal scrollable.
- Una columna para todo el contenido.
- Botones a ancho natural o completo cuando la accion sea primaria.
- Textos compactos, sin depender de hover.
- Timeline y cards adaptados a lectura vertical.

## Datos mockeados

`src/data/mockData.js` centraliza el contenido para evitar mezclar datos y UI.

Estructura actual:

- `trips`: viajes del dashboard.
- `ideas`: destinos comparables.
- `tripSummary`: datos principales del viaje elegido.
- `itineraryDays`: dias y actividades.
- `transports`: vuelos, trenes y traslados.
- `lodgings`: estancias.
- `places`: puntos de interes.
- `restaurants`: sitios para comer.
- `budgetRows`: categorias de presupuesto.
- `documents`: documentos importantes.
- `checklist`: tareas por fase.

Forma recomendada a futuro:

```js
{
  trip: {
    id,
    title,
    destination,
    dates,
    travelers,
    status,
    budget,
    progress
  },
  itinerary: [
    {
      day,
      date,
      activities: []
    }
  ],
  resources: {
    transport: [],
    lodging: [],
    places: [],
    restaurants: [],
    documents: [],
    checklist: []
  }
}
```

Esto permitira conectar cada documento, gasto o actividad con una entidad del viaje cuando exista backend.
