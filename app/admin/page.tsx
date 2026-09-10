import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAILS = ["collectorsvaults26@gmail.com"];

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login?redirect=/admin");
  }

  const isAdmin = ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? "");

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Access Denied</h1>
          <p className="text-neutral-400">
            You are signed in as {user.email}, which does not have admin access.
          </p>
        </div>
      </div>
    );
  }

  const [
    { count: userCount },
    { count: catalogCount },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("catalog_items").select("*", { count: "exact", head: true }),
  ]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-8">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Collector's Vault Admin</h1>
          <p className="text-neutral-400 text-sm">Signed in as {user.email}</p>
        </div>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm"
          >
            Sign out
          </button>
        </form>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <StatCard label="Total Users" value={userCount ?? 0} />
        <StatCard label="Catalog Entries" value={catalogCount ?? 0} />
        <StatCard label="Status" value="Live" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold mb-2">Manage</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AdminLink href="/admin/catalog" title="Catalog Entries" desc="Add, edit, or remove diecast sets and cars." />
          <AdminLink href="/admin/users" title="Users" desc="View and manage collector accounts." />
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-5">
      <p className="text-neutral-400 text-sm">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}

function AdminLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <a
      href={href}
      className="rounded-xl bg-neutral-900 border border-neutral-800 p-5 hover:border-neutral-600 transition-colors block"
    >
      <p className="font-semibold">{title}</p>
      <p className="text-neutral-400 text-sm mt-1">{desc}</p>
    </a>
  );
}
