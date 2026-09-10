"use client";

import { useState } from "react";

type Car = {
  id: string;
  brand: string;
  model: string;
  scale: string | null;
  year: number | null;
  price_paid: number | null;
  current_value: number | null;
  image_url: string | null;
  notes: string | null;
};

export default function CarRow({
  car,
  updateCar,
  deleteCar,
}: {
  car: Car;
  updateCar: (id: string, formData: FormData) => Promise<void>;
  deleteCar: (id: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleUpdate(formData: FormData) {
    setBusy(true);
    await updateCar(car.id, formData);
    setBusy(false);
    setEditing(false);
  }

  async function handleDelete() {
    if (!confirm(`Delete ${car.brand} ${car.model}? This cannot be undone.`)) return;
    setBusy(true);
    await deleteCar(car.id);
    setBusy(false);
  }

  if (editing) {
    return (
      <form
        action={handleUpdate}
        className="bg-neutral-900 border border-neutral-700 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-2"
      >
        <input name="brand" defaultValue={car.brand} required
          className="rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm" />
        <input name="model" defaultValue={car.model} required
          className="rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm" />
        <input name="scale" defaultValue={car.scale ?? ""}
          className="rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm" />
        <input name="year" type="number" defaultValue={car.year ?? ""}
          className="rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm" />
        <input name="price_paid" type="number" step="0.01" defaultValue={car.price_paid ?? ""}
          className="rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm" />
        <input name="current_value" type="number" step="0.01" defaultValue={car.current_value ?? ""}
          className="rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm" />
        <input name="image_url" defaultValue={car.image_url ?? ""}
          className="rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm sm:col-span-2" />
        <input name="notes" defaultValue={car.notes ?? ""}
          className="rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm" />
        <div className="sm:col-span-3 flex gap-2">
          <button type="submit" disabled={busy}
            className="rounded-lg bg-white text-neutral-950 px-4 py-2 text-sm font-medium disabled:opacity-60">
            {busy ? "Saving..." : "Save"}
          </button>
          <button type="button" onClick={() => setEditing(false)}
            className="rounded-lg bg-neutral-800 px-4 py-2 text-sm">
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        {car.image_url && (
          <img src={car.image_url} alt={car.model} className="w-14 h-14 object-cover rounded-lg" />
        )}
        <div>
          <p className="font-semibold">{car.brand} — {car.model}</p>
          <p className="text-neutral-400 text-sm">
            {car.scale ?? "—"} · {car.year ?? "—"} · Paid ${car.price_paid ?? "—"} · Now worth ${car.current_value ?? "—"}
          </p>
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        <button onClick={() => setEditing(true)}
          className="rounded-lg bg-neutral-800 px-3 py-1.5 text-sm hover:bg-neutral-700">
          Edit
        </button>
        <button onClick={handleDelete} disabled={busy}
          className="rounded-lg bg-red-900/40 text-red-300 px-3 py-1.5 text-sm hover:bg-red-900/60 disabled:opacity-60">
          Delete
        </button>
      </div>
    </div>
  );
}
