import React, { useMemo, useState } from "react";
import { ArrowRightLeft, CheckCircle2, Lightbulb, Plus, ReceiptText, Trash2, UserPlus, UserRound, WalletCards } from "lucide-react";
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
    const customShares = expense.splitMode === "custom" ? expense.shares || {} : {};
    const customTotal = Object.values(customShares).reduce((sum, value) => sum + Number(value || 0), 0);
    const useCustomShares = customTotal > 0;
    const share = splitWith.length ? amount / splitWith.length : 0;
    if (balances[expense.paidBy]) balances[expense.paidBy].paid += amount;
    splitWith.forEach((participantId) => {
      if (balances[participantId]) balances[participantId].owes += useCustomShares ? Number(customShares[participantId] || 0) : share;
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

function debtKey(debt) {
  return `${debt.from}->${debt.to}:${Math.round(Number(debt.amount || 0) * 100)}`;
}

export default function Budget() {
  const {
    expenses,
    budgetRows,
    participants = [],
    settledDebts = [],
    settlementPayments = [],
    activeTrip,
    addExpense,
    updateExpense,
    deleteExpense,
    addParticipant,
    updateParticipant,
    deleteParticipant,
    toggleDebtPaid,
    addSettlementPayment,
    deleteSettlementPayment,
  } = useAppState();
  const [activeTab, setActiveTab] = useState("resumen");
  const [modalOpen, setModalOpen] = useState(false);
  const [paymentModal, setPaymentModal] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
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
    splitMode: "equal",
    shares: {},
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
  const normalizedShares = normalizedSplitWith.reduce((shares, participantId) => ({ ...shares, [participantId]: form.shares?.[participantId] || "" }), {});
  const sharedSummary = useMemo(() => calculateSharedExpenses(expenses, participants), [expenses, participants]);
  const paymentsByKey = useMemo(() => {
    return settlementPayments.reduce((map, payment) => {
      map[payment.key] = (map[payment.key] || 0) + Number(payment.amount || 0);
      return map;
    }, {});
  }, [settlementPayments]);
  const settlementRows = sharedSummary.settlements.map((settlement) => {
    const key = debtKey(settlement);
    const paid = settledDebts.includes(key) ? Number(settlement.amount || 0) : Math.min(Number(settlement.amount || 0), paymentsByKey[key] || 0);
    const remaining = Math.max(Number(settlement.amount || 0) - paid, 0);
    return { ...settlement, key, paid, remaining, complete: remaining <= 0.01 };
  });
  const pendingSettlements = settlementRows.filter((settlement) => !settlement.complete);
  const paidSettlements = settlementRows.filter((settlement) => settlement.complete);
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

  function updateShare(participantId, value) {
    setForm((current) => ({ ...current, shares: { ...(current.shares || {}), [participantId]: value } }));
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
    const customTotal = Object.values(normalizedShares).reduce((sum, value) => sum + Number(value || 0), 0);
    if (form.splitMode === "custom" && customTotal <= 0) {
      setError("Indica al menos un importe en el reparto personalizado.");
      return;
    }
    if (form.splitMode === "custom" && Math.abs(customTotal - Number(form.amount || 0)) > 0.01) {
      setError("El reparto personalizado debe sumar el importe total del gasto.");
      return;
    }
    const payload = { ...form, splitWith: normalizedSplitWith, shares: normalizedShares };
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

  function openPaymentModal(settlement) {
    setPaymentModal(settlement);
    setPaymentAmount(String(formatMoney(settlement.remaining || settlement.amount)));
  }

  function savePartialPayment(event) {
    event.preventDefault();
    if (!paymentModal || !paymentAmount) return;
    addSettlementPayment(paymentModal, paymentAmount);
    setPaymentModal(null);
    setPaymentAmount("");
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
          ["compartidos", "Gastos compartidos"],
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
                        splitMode: expense.splitMode || (expense.shares ? "custom" : "equal"),
                        shares: expense.shares || {},
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
              <StatCard icon={ArrowRightLeft} label="Movimientos pendientes" value={pendingSettlements.length} hint={`${paidSettlements.length} saldados`} accent="violet" />
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

            <SectionCard title="Liquidación final">
              {settlementRows.length ? (
                <div className="grid gap-3">
                  {settlementRows.map((settlement) => (
                    <div key={settlement.key} className={`rounded-2xl p-4 ${settlement.complete ? "bg-emerald-50" : settlement.paid > 0 ? "bg-amber-50" : "bg-primary-50"}`}>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-black text-ink">{participantsById[settlement.from]?.name} debe pagar a {participantsById[settlement.to]?.name}</p>
                          <p className="mt-1 text-sm font-bold text-slate-500">
                            {settlement.complete ? "Saldado" : settlement.paid > 0 ? `Pago parcial: ${formatMoney(settlement.paid)} € abonados` : "Pendiente de compensar"}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <strong className="text-primary-800">{formatMoney(settlement.remaining)} € pendientes</strong>
                          {!settlement.complete ? (
                            <button type="button" className="secondary-button px-3 py-2 text-xs" onClick={() => openPaymentModal(settlement)}>
                              Pago parcial
                            </button>
                          ) : null}
                          <button type="button" className={settlement.complete ? "secondary-button px-3 py-2 text-xs" : "primary-button px-3 py-2 text-xs"} onClick={() => toggleDebtPaid(settlement)}>
                            {settlement.complete ? "Reabrir" : "Marcar saldada"}
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/80">
                        <div className="h-full rounded-full bg-primary-500" style={{ width: `${Math.min(100, Math.round((settlement.paid / settlement.amount) * 100))}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="Todos están al día" description="Cuando registres gastos pagados y repartidos, ViajeListo calculará quién debe compensar a quién." icon={CheckCircle2} />
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

            <SectionCard title="Pagos registrados">
              {settlementPayments.length ? (
                <div className="grid gap-2">
                  {settlementPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-ink">{participantsById[payment.from]?.name} → {participantsById[payment.to]?.name}</p>
                        <p className="text-xs font-bold text-slate-500">{formatMoney(payment.amount)} €</p>
                      </div>
                      <button type="button" className="rounded-xl p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600" onClick={() => deleteSettlementPayment(payment.id)} aria-label="Eliminar pago">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">Todavía no hay pagos parciales registrados.</p>
              )}
            </SectionCard>

            <SectionCard title="Cómo se calcula">
              <div className="grid gap-3 text-sm leading-6 text-slate-600">
                <p className="rounded-2xl bg-slate-50 p-4">Solo se tienen en cuenta los gastos marcados como pagados.</p>
                <p className="rounded-2xl bg-slate-50 p-4">Cada gasto se divide a partes iguales entre las personas seleccionadas.</p>
                <p className="rounded-2xl bg-slate-50 p-4">Puedes registrar pagos parciales o marcar una deuda como saldada.</p>
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
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <p className="text-sm font-black text-ink">Repartir entre</p>
              <div className="flex rounded-xl border border-line bg-white p-1">
                {[
                  ["equal", "A partes iguales"],
                  ["custom", "Importes"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={`rounded-lg px-3 py-1.5 text-xs font-black transition ${form.splitMode === value ? "bg-primary-600 text-white" : "text-slate-500 hover:bg-slate-50"}`}
                    onClick={() => update("splitMode", value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
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
            {form.splitMode === "custom" ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {normalizedSplitWith.map((participantId) => (
                  <FormInput
                    key={participantId}
                    label={participantsById[participantId]?.name || "Participante"}
                    type="number"
                    min="0"
                    step="0.01"
                    value={normalizedShares[participantId]}
                    onChange={(event) => updateShare(participantId, event.target.value)}
                    placeholder="0"
                  />
                ))}
              </div>
            ) : null}
          </div>
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button type="button" className="secondary-button" onClick={() => { setModalOpen(false); setEditingExpense(null); }}>Cancelar</button>
            <button type="submit" className="primary-button">{editingExpense !== null ? "Guardar cambios" : "Guardar gasto"}</button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(paymentModal)} onClose={() => setPaymentModal(null)} title="Registrar pago" description="Anota un pago parcial o total entre participantes.">
        <form onSubmit={savePartialPayment} className="grid gap-4">
          <FormInput label="Importe pagado" type="number" min="0" step="0.01" value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} />
          {paymentModal ? (
            <p className="rounded-2xl bg-primary-50 p-4 text-sm font-bold text-primary-800">
              {participantsById[paymentModal.from]?.name} paga a {participantsById[paymentModal.to]?.name}. Pendiente actual: {formatMoney(paymentModal.remaining || paymentModal.amount)} €.
            </p>
          ) : null}
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button type="button" className="secondary-button" onClick={() => setPaymentModal(null)}>Cancelar</button>
            <button type="submit" className="primary-button">Guardar pago</button>
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
