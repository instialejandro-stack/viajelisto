import React, { useMemo, useState } from "react";
import { Backpack, CheckCircle2, CheckSquare, Plus, Search, Square, Trash2 } from "lucide-react";
import EmptyState from "../components/EmptyState.jsx";
import { FormError, FormInput, FormSelect, FormTextarea } from "../components/FormControls.jsx";
import PageHeader from "../components/PageHeader.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatCard from "../components/StatCard.jsx";
import { useAppState } from "../state/AppStateContext.jsx";

const initialForm = { name: "", category: "Ropa", priority: "media", notes: "" };

export default function Packing() {
  const { packingItems = [], addPackingItem, togglePackingItem, deletePackingItem } = useAppState();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const packed = packingItems.filter((item) => item.packed).length;
  const progress = packingItems.length ? Math.round((packed / packingItems.length) * 100) : 0;

  const groupedItems = useMemo(() => {
    const filtered = searchQuery.trim()
      ? packingItems.filter((item) =>
          [item.name, item.category, item.notes].some((field) =>
            field?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        )
      : packingItems;
    return filtered.reduce((groups, item) => {
      const category = item.category || "General";
      return { ...groups, [category]: [...(groups[category] || []), item] };
    }, {});
  }, [packingItems, searchQuery]);

  function submit(event) {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Escribe qué quieres llevar en la maleta.");
      return;
    }
    addPackingItem(form);
    setForm(initialForm);
    setError("");
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function markAllCategory(category, shouldBePacked) {
    const items = groupedItems[category] || [];
    items.forEach((item) => {
      if (item.packed !== shouldBePacked) togglePackingItem(item.id);
    });
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Preparación"
        title="Maleta"
        subtitle="Organiza lo que tienes que llevar y marca lo que ya está preparado."
        actionLabel="Añadir a la maleta"
        icon={Plus}
        onAction={() => document.getElementById("packing-name")?.focus()}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Backpack} label="Elementos" value={packingItems.length} hint="En la lista" />
        <StatCard icon={CheckCircle2} label="Preparados" value={packed} hint={`${progress}% completado`} accent="emerald" />
        <StatCard icon={Backpack} label="Pendientes" value={packingItems.length - packed} hint="Antes de salir" accent="amber" />
      </div>

      <section className="card p-5 sm:p-6">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-lg font-black text-ink dark:text-white">Progreso de maleta</h2>
            <p className="mt-1 text-sm text-slate-500">{packed} de {packingItems.length} elementos preparados.</p>
          </div>
          <span className="w-fit rounded-full bg-primary-50 px-3 py-1 text-sm font-black text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">{progress}%</span>
        </div>
        <ProgressBar value={progress} label="Maleta preparada" />
      </section>

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <SectionCard title="Añadir elemento">
          <form onSubmit={submit} className="grid gap-4">
            <FormError>{error}</FormError>
            <FormInput
              id="packing-name"
              label="Elemento"
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
              placeholder="Adaptador, chaqueta, cámara..."
            />
            <FormSelect label="Categoría" value={form.category} onChange={(event) => update("category", event.target.value)}>
              {["Documentación", "Ropa", "Aseo", "Tecnología", "Salud", "Extras"].map((category) => (
                <option key={category}>{category}</option>
              ))}
            </FormSelect>
            <FormSelect label="Prioridad" value={form.priority} onChange={(event) => update("priority", event.target.value)}>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </FormSelect>
            <FormTextarea
              label="Notas"
              value={form.notes}
              onChange={(event) => update("notes", event.target.value)}
              placeholder="Cantidad, detalle o recordatorio"
            />
            <button type="submit" className="primary-button justify-center">
              <Plus size={16} /> Añadir
            </button>
          </form>
        </SectionCard>

        <div className="grid gap-4 self-start">
          {packingItems.length > 0 && (
            <div className="relative">
              <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Buscar en la maleta…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-base pl-9"
              />
            </div>
          )}

          <SectionCard title="Lista de equipaje">
            {packingItems.length ? (
              Object.keys(groupedItems).length ? (
                <div className="grid gap-6">
                  {Object.entries(groupedItems).map(([category, items]) => {
                    const allPacked = items.every((i) => i.packed);
                    const somePacked = items.some((i) => i.packed);
                    return (
                      <div key={category}>
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <h3 className="text-sm font-black uppercase tracking-wide text-slate-400">{category}</h3>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => markAllCategory(category, true)}
                              disabled={allPacked}
                              title="Marcar todos como preparados"
                              className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                            >
                              <CheckSquare size={13} />
                              Marcar todo
                            </button>
                            <button
                              type="button"
                              onClick={() => markAllCategory(category, false)}
                              disabled={!somePacked}
                              title="Desmarcar todos"
                              className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                            >
                              <Square size={13} />
                              Desmarcar
                            </button>
                          </div>
                        </div>
                        <div className="grid gap-2">
                          {items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-start justify-between gap-3 rounded-2xl border border-line bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
                            >
                              <label className="flex min-w-0 cursor-pointer items-start gap-3">
                                <input
                                  type="checkbox"
                                  className="mt-1 h-5 w-5 rounded border-line text-primary-600"
                                  checked={item.packed}
                                  onChange={() => togglePackingItem(item.id)}
                                />
                                <span>
                                  <span className={`block font-black ${item.packed ? "text-slate-400 line-through" : "text-ink dark:text-white"}`}>
                                    {item.name}
                                  </span>
                                  <span className="mt-1 block text-xs font-bold text-slate-500">
                                    {item.priority ? item.priority.charAt(0).toUpperCase() + item.priority.slice(1) : ""} · {item.notes || "Sin notas"}
                                  </span>
                                </span>
                              </label>
                              <button
                                type="button"
                                className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                onClick={() => deletePackingItem(item.id)}
                                aria-label={`Eliminar ${item.name}`}
                              >
                                <Trash2 size={17} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  title={`Sin resultados para "${searchQuery}"`}
                  description="Prueba con otro término o revisa la ortografía."
                />
              )
            ) : (
              <EmptyState
                title="La maleta está vacía"
                description="Añade lo imprescindible para preparar el viaje con calma."
                actionLabel="Añadir a la maleta"
                onAction={() => document.getElementById("packing-name")?.focus()}
                icon={Backpack}
              />
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
