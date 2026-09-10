"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const ADMIN_EMAILS = ["collectorsvaults26@gmail.com"];

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? "")) {
    redirect("/login?redirect=/admin/cars");
  }
  return supabase;
}

export async function createCar(formData: FormData) {
  const supabase = await requireAdmin();

  const { error } = await supabase.from("cars").insert({
    brand: formData.get("brand") as string,
    model: formData.get("model") as string,
    scale: formData.get("scale") as string,
    year: Number(formData.get("year")) || null,
    price_paid: Number(formData.get("price_paid")) || null,
    current_value: Number(formData.get("current_value")) || null,
    image_url: (formData.get("image_url") as string) || null,
    notes: (formData.get("notes") as string) || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/cars");
}

export async function updateCar(id: string, formData: FormData) {
  const supabase = await requireAdmin();

  const { error } = await supabase
    .from("cars")
    .update({
      brand: formData.get("brand") as string,
      model: formData.get("model") as string,
      scale: formData.get("scale") as string,
      year: Number(formData.get("year")) || null,
      price_paid: Number(formData.get("price_paid")) || null,
      current_value: Number(formData.get("current_value")) || null,
      image_url: (formData.get("image_url") as string) || null,
      notes: (formData.get("notes") as string) || null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/cars");
}

export async function deleteCar(id: string) {
  const supabase = await requireAdmin();

  const { error } = await supabase.from("cars").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/cars");
}
