import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createCar, updateCar, deleteCar } from "./actions";
import CarRow from "./CarRow";

const ADMIN_EMAILS = ["collectorsvaults26@gmail.com"];

export default async function CarsAdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? "")) {
    redirect("/login?redirect=/admin/cars");
  }

  const { data: cars, error } = await supabase
    .from("cars")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Manage Cars</h1>
          <a href="/admin" className="text-sm text-neutral-400 hover:underline">
            ← Back to admin
          </a>
        </div>

        {/* Add new car form */}
        <form
          action={createCar}
          className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 mb-8 grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          <input name="brand" placeholder="Brand (e.g. Hot Wheels)" required
            className="rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm" />
          <input name="model" placeholder="Model name" required
            className="rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm" />
          <input name="scale" placeholder="Scale (e.g. 1:64)"
            className="rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm" />
          <input name="year" type="number" placeholder="Year"
            className="rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm" />
          <input name="price_paid" type="number" step="0.01" placeholder="Price paid ($)"
            className="rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm" />
          <input name="current_value" type="number" step="0.01" placeholder="Current value ($)"
            className="rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm" />
          <input name="image_url" placeholder="Image URL"
            className="rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm sm:col-span-2" />
          <input name="notes" placeholder="Notes"
            className="rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm" />
          <button type="submit"
            className="sm:col-span-3 rounded-lg bg-white text-neutral-950 font-medium py-2 text-sm hover:bg-neutral-200">
            Add Car
          </button>
        </form>

        {error && <p className="text-red-400 mb-4">{error.message}</p>}

        {/* Existing cars list */}
        <div className="space-y-3">
          {cars?.length === 0 && (
            <p className="text-neutral-500 text-sm">No cars in your collection yet.</p>
          )}
          {cars?.map((car) => (
            <CarRow key={car.id} car={car} updateCar={updateCar} deleteCar={deleteCar} />
          ))}
        </div>
      </div>
    </div>
  );
}
