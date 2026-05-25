import React, { useState } from "react";
import { Calculator, RefreshCw } from "lucide-react";
import { FormInput } from "../components/FormControls.jsx";
import PageHeader from "../components/PageHeader.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatCard from "../components/StatCard.jsx";
import { useAppState } from "../state/AppStateContext.jsx";

export default function Currency() {
  const { currency = { base: "EUR", target: "USD", rate: 1, amount: 100 }, updateCurrency } = useAppState();
  const [form, setForm] = useState(currency);
  const converted = Number(form.amount || 0) * Number(form.rate || 0);

  function update(field, value) {
    const next = { ...form, [field]: value };
    setForm(next);
    updateCurrency(next);
  }

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="Herramientas" title="Conversor de moneda" subtitle="Calcula cambios de forma manual, sin conectarte a servicios externos." />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Calculator} label="Importe" value={`${form.amount || 0} ${form.base}`} hint="Moneda origen" />
        <StatCard icon={RefreshCw} label="Cambio manual" value={form.rate || 0} hint={`1 ${form.base} = ${form.rate} ${form.target}`} accent="emerald" />
        <StatCard icon={Calculator} label="Resultado" value={`${converted.toFixed(2)} ${form.target}`} hint="Estimación manual" accent="violet" />
      </div>
      <SectionCard title="Conversor manual">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput label="Moneda origen" value={form.base} onChange={(event) => update("base", event.target.value.toUpperCase())} placeholder="EUR" />
          <FormInput label="Moneda destino" value={form.target} onChange={(event) => update("target", event.target.value.toUpperCase())} placeholder="USD" />
          <FormInput label="Importe" type="number" value={form.amount} onChange={(event) => update("amount", event.target.value)} />
          <FormInput label="Tipo de cambio manual" type="number" step="0.0001" value={form.rate} onChange={(event) => update("rate", event.target.value)} />
        </div>
        <p className="mt-5 rounded-2xl bg-primary-50 p-4 text-sm font-bold text-primary-800">El cambio se introduce a mano y queda guardado solo en este viaje.</p>
      </SectionCard>
    </div>
  );
}
