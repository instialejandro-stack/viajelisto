import React from "react";
import { ReceiptText } from "lucide-react";
import Badge from "./Badge.jsx";
import ItemActions from "./ItemActions.jsx";

function formatReceipt(receipt) {
  if (!receipt) return "";
  if (typeof receipt === "string") return receipt;
  const name = receipt.fileName || receipt.name || "Archivo";
  const size = receipt.displaySize || receipt.size || "";
  return `${name}${size ? ` · ${size}` : ""}`;
}

export default function ExpenseItem({ expense, paidByName, splitWithNames, onEdit, onDelete }) {
  const receiptLabel = formatReceipt(expense.receipt);

  return (
    <article className="grid gap-3 rounded-2xl border border-line bg-white p-4 sm:grid-cols-[1fr_120px_100px_auto] sm:items-center">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
          <ReceiptText size={18} />
        </span>
        <div>
          <h3 className="font-black text-ink">{expense.name}</h3>
          <p className="mt-1 text-sm text-slate-500">{expense.category}</p>
          {paidByName && <p className="mt-1 text-xs font-bold text-slate-500">Pagó {paidByName}{splitWithNames ? ` · Repartido entre ${splitWithNames}` : ""}</p>}
          {receiptLabel && <p className="mt-1 text-xs font-bold text-primary-700">Justificante: {receiptLabel}</p>}
        </div>
      </div>
      <strong className="text-lg text-ink">{expense.amount} €</strong>
      <Badge>{expense.status}</Badge>
      <ItemActions onEdit={onEdit} onDelete={onDelete} />
    </article>
  );
}
