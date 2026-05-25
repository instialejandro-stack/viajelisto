import React from "react";
import { TriangleAlert } from "lucide-react";
import Modal from "./Modal.jsx";

export default function ConfirmDialog({
  open,
  title = "Eliminar elemento",
  description,
  warningText = "Confirma que quieres eliminar este elemento. Se quitará de los datos guardados en este navegador.",
  confirmLabel = "Eliminar",
  onCancel,
  onConfirm,
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title} description={description || "Esta acción no se puede deshacer en la demo."}>
      <div className="rounded-3xl bg-rose-50 p-5 text-rose-800">
        <TriangleAlert className="mb-3" size={22} />
        <p className="text-sm font-bold leading-6">{warningText}</p>
      </div>
      <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" className="secondary-button" onClick={onCancel}>Cancelar</button>
        <button type="button" className="inline-flex items-center justify-center rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-rose-700" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
