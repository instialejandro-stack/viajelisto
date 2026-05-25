import React, { useMemo, useState } from "react";
import { ArrowRightLeft, Lightbulb, Plus, ReceiptText, Trash2, UserPlus, UserRound, WalletCards } from "lucide-react";
import BudgetCategoryCard from "../components/BudgetCategoryCard.jsx";
import ExpenseItem from "../components/ExpenseItem.jsx";
import { FormError, FormInput, FormSelect } from "../components/FormControls.jsx";
import Modal from "../components/Modal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import PageHeader from "../components/PageHeader.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import SectionCard from "../components/SectionCard.jsx";
import StatCard from "../components/StatCard.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { useAppState } from "../state/AppStateContext.jsx";
import { budgetTips } from "../data/mockData.js";

function formatMoney(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

function formatFileSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileToReceipt(file) {
  if (!file) return null;
  const fileType = file.type || "Archivo";
  return {
    fileName: file.name,
    fileType,
    fileSize: file.size,
    fileCategory: fileType.includes("pdf") ? "pdf" : fileType.startsWith("image/") ? "image" : "file",
    displaySize: formatFileSize(file.size),
    lastModified: file.lastModified,
  };
}

function receiptName(receipt) {
  if (!receipt) return "";
  if (typeof receipt === "string") return receipt;
  const name = receipt.fileName || receipt.name;
  const size = receipt.displaySize || receipt.size || (receipt.fileSize ? formatFileSize(receipt.fileSize) : "");
  return size ? `${name} · ${size}` : name;
}

function calculateSharedExpenses(expenses, participants) {
  const balances = Object.fromEntries(participants.map((participant) => [participant.id, { paid: 0, owes: 0, balance: 0 }]));
  const paidExpenses = expenses.filter((expense) => expense.status === "pagado" && Number(expense.amount || 0) > 0 && expense.paidBy);

  paidExpenses.forEach((expense) => {
    const splitWith = expense.splitWith?.length ? expense.splitWith : participants.map((participant) => participant.id);
    const amount = Number(expense.amount || 0);
    const share = splitWith.length ? amount / splitWith.length : 0;
    if (balances[expense.paidBy]) balances[expense.paidBy].paid += amount;
    splitWith.forEach((participantId) => {
      if (balances[participantId]) balances[participantId].owes += share;
    });
  });

  Object.values(balances).forEach((balance) => {
    balance.balance = balance.paid - balance.owes;
  });

  const debtors = Object.entries(balances)
    .filter(([, balance]) => balance.balance < -0.01)
    .map(([id, balance]) => ({ id, amount: Math.abs(balance.balance) }));
  const creditors = Object.entries(balances)
    .filter(([, balance]) => balance.balance > 0.01)
    .map(([id, balance]) => ({ id, amount: balance.balance }));
  const settlements = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtors[debtorIndex] && creditors[creditorIndex]) {
    const amount = Math.min(debtors[debtorIndex].amount, creditors[creditorIndex].amount);
    settlements.push({ from: debtors[debtorIndex].id, to: creditors[creditorIndex].id, amount });
    debtors[debtorIndex].amount -= amount;
    creditors[creditorIndex].amount -= amount;
    if (debtors[debtorIndex].amount < 0.01) debtorIndex += 1;
    if (creditors[creditorIndex].amount < 0.01) creditorIndex += 1;
  }

  return { balances, paidExpenses, settlements };
}

export default function Budget() {
  const { expenses, budgetRows, participants = [], settledDebts = [], activeTrip, addExpense, updateExpense, deleteExpense, addParticipant, updateParticipant, deleteParticipant, toggleDebtPaid } = useAppState();
  const [activeTab, setActiveTab] = useState("resumen");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deletingExpense, setDeletingExpense] = useState(null);
  const [participantName, setParticipantName] = useState("");
  const [editingParticipant, setEditingParticipant] = useState(null);
  const [participantEditName, setParticipantEditName] = useState("");
  const [participantError, setParticipantError] = useState("");
  const [error, setError] = useState("");

  const emptyForm = () => ({
    name: "",
    category: "Extras",
    amount: "",
    status: "pagado",
    receipt: "",
    paidBy: participants[0]?.id || "",
    splitWith: participants.map((participant) => participant.id),
  });

  const [form, setForm] = useState(emptyForm);
  const estimated = Number.parseInt(String(activeTrip?.budget || "0").replace(/[^\d]/g, ""), 10) || 0;
  const baseSpent = budgetRows.reduce((sum, row) => sum + row.spent, 0);
  const extraPaid = useMemo(() => expenses.filter((expense) => expense.userAdded && expense.status === "pagado").reduce((sum, expense) => sum + Number(expense.amount || 0), 0), [expenses]);
  const spent = baseSpent + extraPaid;
  const pending = Math.max(estimated - spent, 0);
  const percent = estimated ? Math.min(Math.round((spent / estimated) * 100), 100) : 0;
  const participantsById = useMemo(() => Object.fromEntries(participants.map((participant) => [participant.id, participant])), [participants]);
  const normalizedSplitWith = form.splitWith?.length ? form.splitWith : participants.map((participant) => participant.id);
  const sharedSummary = useMemo(() => calculateSharedExpenses(expenses, participants), [expenses, participants]);
  const debtKey = (debt) => `${debt.from}->${debt.to}:${Math.round(Number(debt.amount || 0) * 100)}`;
  const pendingSettlements = sharedSummary.settlements.filter((settlement) => !settledDebts.includes(debtKey(settlement)));
  const paidSettlements = sharedSummary.settlements.filter((settlement) => settledDebts.includes(debtKey(settlement)));
  const sharedTotal = sharedSummary.paidExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const categoryRows = useMemo(
    () =>
      budgetRows.map((row) => ({
        ...row,
        spent: row.spent + expenses.filter((expense) => expense.userAdded && expense.status === "pagado" && expense.category === row.category).reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
      })),
    [budgetRows, expenses]
  );

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function openAddExpense() {
    setEditingExpense(null);
    setForm(emptyForm());
    setError("");
    setModalOpen(true);
  }

  function toggleSplitWith(participantId) {
    setForm((current) => {
      const currentSplit = current.splitWith?.length ? current.splitWith : participants.map((participant) => participant.id);
      const nextSplit = currentSplit.includes(participantId) ? currentSplit.filter((id) => id !== participantId) : [...currentSplit, participantId];
      return { ...current, splitWith: nextSplit };
    });
  }

  function handleReceiptFile(event) {
    update("receipt", fileToReceipt(event.target.files?.[0]));
  }

  function submit(event) {
    event.preventDefault();
    if (!form.name || !form.category || !form.amount || !form.paidBy || !normalizedSplitWith.length) {
      setError("Completa concepto, categoría, importe, pagador y al menos una persona del reparto.");
      return;
    }
    const payload = { ...form, splitWith: normalizedSplitWith };
    if (editingExpense !== null) updateExpense(editingExpense, payload);
    else addExpense(payload);
    setForm(emptyForm());
    setEditingExpense(null);
    setError("");
    setModalOpen(false);
  }

  function submitParticipant(event) {
    event.preventDefault();
    if (!participantName.trim()) {
      setParticipantError("Escribe el nombre de la persona.");
      return;
    }
    addParticipant(participantName.trim());
    setParticipantName("");
    setParticipantError("");
  }

  function startEditingParticipant(participant) {
    setEditingParticipant(participant.id);
    setParticipantEditName(participant.name);
    setParticipantError("");
  }

  function saveParticipantName(event) {
    event.preventDefault();
    if (!participantEditName.trim()) {
      setParticipantError("El nombre no puede estar vacío.");
      return;
    }
    updateParticipant(editingParticipant, participantEditName.trim());
    setEditingParticipant(null);
    setParticipantEditName("");
    setParticipantError("");
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Control financiero"
        title="Presupuesto"
        subtitle="Controla gastos estimados, pagos realizados y presupuesto restante de tu viaje."
        actionLabel="Añadir gasto"
        icon={Plus}
        onAction={openAddExpense}
      />

      <div className="flex flex-wrap gap-2 rounded-2xl border border-line bg-white p-2 shadow-sm">
        {[
          ["resumen", "Resumen"],
          ["gastos", "Gastos"],
          ["compartidos", "Dividir gastos"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setActiveTab(value)}
            className={`rounded-xl px-4 py-2 text-sm font-black transition ${activeTab === value ? "bg-ink text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-ink"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "resumen" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={WalletCards} label="Presupuesto total estimado" value={`${estimated} €`} hint={activeTrip?.people || "Viaje seleccionado"} />
            <StatCard icon={ReceiptText} label="Gastado hasta ahora" value={`${spent} €`} hint={`${percent}% del presupuesto`} accent="emerald" />
            <StatCard icon={WalletCards} label="Pendiente estimado" value={`${pending} €`} hint="Margen restante" accent="amber" />
            <StatCard icon={UserRound} label="Coste por persona" value={`${Math.round(estimated / (Number.parseInt(activeTrip?.people, 10) || 1))} €`} hint="Estimación actual" accent="violet" />
          </div>

          <section className="card p-5 sm:p-6">
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-lg font-black text-ink">Progreso general del presupuesto</h2>
                <p className="mt-1 text-sm text-slate-500">{spent} € gastados de {estimated} € estimados.</p>
              </div>
              <span className="w-fit rounded-full bg-primary-50 px-3 py-1 text-sm font-black text-primary-700">{percent}% usado</span>
            </div>
            <ProgressBar value={percent} label="Uso del presupuesto" />
          </section>
        </>
      )}

      {(activeTab === "resumen" || activeTab === "gastos") && (
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="grid gap-6">
            {activeTab === "resumen" && (
              <SectionCard title="Categorías">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {categoryRows.map((row) => (
                    <BudgetCategoryCard key={row.category} row={row} />
                  ))}
                </div>
              </SectionCard>
            )}

            <SectionCard title="Gastos recientes">
              <div className="grid gap-3">
                {expenses.length ? expenses.map((expense, index) => (
                  <ExpenseItem
                    key={expense.id || expense.name}
                    expense={expense}
                    paidByName={participantsById[expense.paidBy]?.name}
                    splitWithNames={(expense.splitWith || []).map((id) => participantsById[id]?.name).filter(Boolean).join(", ")}
                    onEdit={() => {
                      setEditingExpense(index);
                      setForm({
                        id: expense.id,
                        name: expense.name,
                        category: expense.category,
                        amount: String(expense.amount),
                        status: expense.status,
                        receipt: expense.receipt || "",
                        paidBy: expense.paidBy || participants[0]?.id || "",
                        splitWith: expense.splitWith?.length ? expense.splitWith : participants.map((participant) => participant.id),
                      });
                      setError("");
                      setModalOpen(true);
                    }}
                    onDelete={() => setDeletingExpense({ index, name: expense.name })}
                  />
                )) : <EmptyState title="No hay gastos todavía" description="Añade el primer gasto para empezar a controlar el presupuesto." actionLabel="Añadir gasto" onAction={openAddExpense} icon={ReceiptText} />}
              </div>
            </SectionCard>
          </div>

          <SectionCard title="Consejos">
            <div className="grid gap-3">
              {budgetTips.map((tip) => (
                <div key={tip} className="flex items-start gap-3 rounded-2xl bg-primary-50 p-4 text-sm font-bold text-primary-800">
                  <Lightbulb size={17} className="mt-0.5 shrink-0" />
                  {tip}
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {activeTab === "compartidos" && (
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="grid gap-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard icon={UserRound} label="Participantes" value={participants.length} hint="Personas del viaje" />
              <StatCard icon={ReceiptText} label="Gastos compartidos" value={sharedSummary.paidExpenses.length} hint="Pagados y repartidos" accent="emerald" />
              <StatCard icon={WalletCards} label="Total compartido" value={`${formatMoney(sharedTotal)} €`} hint="Incluye gastos pagados" accent="amber" />
              <StatCard icon={ArrowRightLeft} label="Movimientos pendientes" value={pendingSettlements.length} hint={`${paidSettlements.length} marcados como pagados`} accent="violet" />
            </div>

            <SectionCard title="Balance por persona">
              <div className="grid gap-3">
                {participants.map((participant) => {
                  const balance = sharedSummary.balances[participant.id] || { paid: 0, owes: 0, balance: 0 };
                  return (
                    <article key={participant.id} className="rounded-2xl border border-line bg-white p-4">
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div>
                          <h3 className="font-black text-ink">{participant.name}</h3>
                          <p className="mt-1 text-sm text-slate-500">Pagó {formatMoney(balance.paid)} € · Le corresponde {formatMoney(balance.owes)} €</p>
                        </div>
                        <span className={`w-fit rounded-full px-3 py-1 text-sm font-black ${balance.balance >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                          {balance.balance >= 0 ? "Debe recibir" : "Debe pagar"} {formatMoney(Math.abs(balance.balance))} €
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </SectionCard>

            <SectionCard title="Quién debe a quién">
              {sharedSummary.settlements.length ? (
                <div className="grid gap-3">
                  {sharedSummary.settlements.map((settlement) => (
                    <div key={`${settlement.from}-${settlement.to}-${settlement.amount}`} className={`flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between ${settledDebts.includes(debtKey(settlement)) ? "bg-emerald-50" : "bg-primary-50"}`}>
                      <div>
                        <p className="font-black text-ink">{participantsById[settlement.from]?.name} debe pagar a {participantsById[settlement.to]?.name}</p>
                        <p className="mt-1 text-sm font-bold text-slate-500">{settledDebts.includes(debtKey(settlement)) ? "Marcada como pagada" : "Pendiente de compensar"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <strong className="text-primary-800">{formatMoney(settlement.amount)} €</strong>
                        <button type="button" className={settledDebts.includes(debtKey(settlement)) ? "secondary-button" : "primary-button"} onClick={() => toggleDebtPaid(settlement)}>
                          {settledDebts.includes(debtKey(settlement)) ? "Desmarcar" : "Marcar pagada"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No hay deudas pendientes" description="Cuando registres gastos pagados y repartidos, ViajeListo calculará los saldos." />
              )}
            </SectionCard>
          </div>

          <aside className="grid gap-6 self-start">
            <SectionCard title="Participantes">
              <form onSubmit={submitParticipant} className="grid gap-3">
                <FormError>{participantError}</FormError>
                <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                  <FormInput label="Añadir persona" value={participantName} onChange={(event) => setParticipantName(event.target.value)} placeholder="Nombre" />
                  <button type="submit" className="primary-button mt-0 h-11 px-3 sm:mt-7" aria-label="Añadir participante">
                    <UserPlus size={18} />
                  </button>
                </div>
              </form>
              <div className="mt-4 grid gap-2">
                {participants.map((participant) => (
                  editingParticipant === participant.id ? (
                    <form key={participant.id} onSubmit={saveParticipantName} className="grid gap-2 rounded-2xl bg-slate-50 p-2 sm:grid-cols-[1fr_auto_auto]">
                      <input
                        className="rounded-xl border border-line bg-white px-3 py-2 text-sm font-bold text-ink outline-none focus:border-primary-200 focus:ring-2 focus:ring-primary-100"
                        value={participantEditName}
                        onChange={(event) => setParticipantEditName(event.target.value)}
                        autoFocus
                      />
                      <button type="submit" className="primary-button justify-center px-3 py-2 text-sm">Guardar</button>
                      <button type="button" className="secondary-button justify-center px-3 py-2 text-sm" onClick={() => setEditingParticipant(null)}>Cancelar</button>
                    </form>
                  ) : (
                    <div key={participant.id} className="flex items-center justify-between gap-2 rounded-2xl bg-slate-50 px-3 py-2">
                      <button type="button" className="min-w-0 flex-1 truncate text-left font-bold text-ink hover:text-primary-700" onClick={() => startEditingParticipant(participant)}>
                        {participant.name}
                      </button>
                      <button type="button" className="secondary-button px-3 py-2 text-xs" onClick={() => startEditingParticipant(participant)}>
                        Editar
                      </button>
                      <button
                        type="button"
                        className="rounded-xl p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                        disabled={participants.length <= 1}
                        onClick={() => deleteParticipant(participant.id)}
                        aria-label={`Eliminar ${participant.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Cómo se calcula">
              <div className="grid gap-3 text-sm leading-6 text-slate-600">
                <p className="rounded-2xl bg-slate-50 p-4">Solo se tienen en cuenta los gastos marcados como pagados.</p>
                <p className="rounded-2xl bg-slate-50 p-4">Cada gasto se divide a partes iguales entre las personas seleccionadas.</p>
                <p className="rounded-2xl bg-slate-50 p-4">El balance indica quién adelantó dinero y quién debe compensar.</p>
              </div>
            </SectionCard>
          </aside>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditingExpense(null); }} title={editingExpense !== null ? "Editar gasto" : "Añadir gasto"} description="Registra un gasto pagado o pendiente, quién lo pagó y entre quiénes se reparte.">
        <form onSubmit={submit} className="grid gap-4">
          <FormError>{error}</FormError>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput label="Concepto" value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Cena en Trastevere" />
            <FormSelect label="Categoría" value={form.category} onChange={(event) => update("category", event.target.value)}>
              {["Vuelos", "Alojamiento", "Transporte", "Comida", "Entradas", "Extras"].map((category) => <option key={category}>{category}</option>)}
            </FormSelect>
            <FormInput label="Importe" type="number" min="0" value={form.amount} onChange={(event) => update("amount", event.target.value)} placeholder="30" />
            <FormSelect label="Estado" value={form.status} onChange={(event) => update("status", event.target.value)}>
              <option value="pagado">Pagado</option>
              <option value="pendiente">Pendiente</option>
            </FormSelect>
            <FormSelect label="Pagado por" value={form.paidBy || participants[0]?.id || ""} onChange={(event) => update("paidBy", event.target.value)}>
              {participants.map((participant) => <option key={participant.id} value={participant.id}>{participant.name}</option>)}
            </FormSelect>
          </div>
          <div className="rounded-2xl border border-line bg-slate-50 p-4">
            <label className="block text-sm font-black text-ink">
              Justificante o recibo
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={handleReceiptFile}
                className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm font-semibold text-ink file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:text-sm file:font-black file:text-primary-700 hover:file:bg-primary-100"
              />
            </label>
            <p className="mt-2 text-xs font-semibold text-slate-500">Se guardan solo nombre, tipo y tamaño del archivo para esta demo.</p>
            {form.receipt ? (
              <div className="mt-3 flex flex-col gap-2 rounded-xl bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-bold text-primary-800">{receiptName(form.receipt)}</span>
                <button type="button" className="secondary-button px-3 py-2 text-xs" onClick={() => update("receipt", null)}>
                  Quitar archivo
                </button>
              </div>
            ) : null}
          </div>
          <div className="rounded-2xl border border-line bg-slate-50 p-4">
            <p className="text-sm font-black text-ink">Repartir entre</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {participants.map((participant) => (
                <label key={participant.id} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition ${normalizedSplitWith.includes(participant.id) ? "border-primary-200 bg-white text-primary-800 shadow-sm" : "border-line bg-white/60 text-slate-500"}`}>
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-line text-primary-600"
                    checked={normalizedSplitWith.includes(participant.id)}
                    onChange={() => toggleSplitWith(participant.id)}
                  />
                  {participant.name}
                </label>
              ))}
            </div>
          </div>
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button type="button" className="secondary-button" onClick={() => { setModalOpen(false); setEditingExpense(null); }}>Cancelar</button>
            <button type="submit" className="primary-button">{editingExpense !== null ? "Guardar cambios" : "Guardar gasto"}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deletingExpense)}
        title="Eliminar gasto"
        description={`Vas a eliminar ${deletingExpense?.name || "este gasto"}. Esta acción no se puede deshacer en la demo.`}
        onCancel={() => setDeletingExpense(null)}
        onConfirm={() => {
          deleteExpense(deletingExpense.index);
          setDeletingExpense(null);
        }}
      />
    </div>
  );
}
