import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAILS = ["collectorsvaults26@gmail.com"];

function timeAgoLabel(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const isSameDay = date.toDateString() === now.toDateString();
  if (isSameDay) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

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
    { count: collectorCount },
    { count: castingCount },
    { count: verifiedCount },
    { count: flaggedItemCount },
    { count: flaggedPostCount },
    { data: latestProfile },
    { count: pendingReviewCount },
    { data: latestFlaggedPost },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("registry_items").select("*", { count: "exact", head: true }),
    supabase
      .from("registry_items")
      .select("*", { count: "exact", head: true })
      .eq("verification_status", "verified"),
    supabase
      .from("registry_items")
      .select("*", { count: "exact", head: true })
      .eq("verification_status", "flagged"),
    supabase
      .from("forum_posts")
      .select("*", { count: "exact", head: true })
      .eq("is_flagged", true),
    supabase
      .from("profiles")
      .select("username, created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("registry_items")
      .select("*", { count: "exact", head: true })
      .eq("verification_status", "unverified"),
    supabase
      .from("forum_posts")
      .select("title, created_at")
      .eq("is_flagged", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const openModerationItems = (flaggedItemCount ?? 0) + (flaggedPostCount ?? 0);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg border border-amber-500/50 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 17l3-9 3 9M4 17h6M14 17V8l6 9V8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-semibold">Collector&apos;s Vault</span>
        </div>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            aria-label="Sign out"
            className="w-9 h-9 rounded-lg border border-neutral-800 flex items-center justify-center hover:border-neutral-600"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>
      </header>

      <main className="px-6 py-8 max-w-3xl mx-auto space-y-8">
        <div>
          <p className="text-xs font-semibold tracking-widest text-amber-400 mb-2">
            ADMINISTRATOR AREA
          </p>
          <h1 className="text-3xl font-bold mb-2">Vault Command</h1>
          <p className="text-neutral-400">
            Monitor collector activity, catalog health, and moderation tasks.
          </p>
        </div>

        <section className="space-y-4">
          <StatCard
            icon={<PeopleIcon />}
            iconClass="bg-blue-500/10 text-blue-400"
            value={collectorCount ?? 0}
            label="Registered collectors"
          />
          <StatCard
            icon={<DatabaseIcon />}
            iconClass="bg-amber-500/10 text-amber-400"
            value={castingCount ?? 0}
            label="Catalog castings"
          />
          <StatCard
            icon={<CheckShieldIcon />}
            iconClass="bg-emerald-500/10 text-emerald-400"
            value={verifiedCount ?? 0}
            label="Verified submissions"
          />
          <StatCard
            icon={<ShieldIcon />}
            iconClass="bg-purple-500/10 text-purple-400"
            value={openModerationItems}
            label="Open moderation items"
          />
        </section>

        <section className="rounded-xl border border-neutral-800 divide-y divide-neutral-800 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h4l2 7 4-14 2 7h6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h2 className="font-semibold">Command activity</h2>
          </div>

          <ActivityRow
            title="New collector account created"
            desc={
              latestProfile
                ? `${latestProfile.username} joined the vault`
                : "No collectors have joined yet"
            }
            time={latestProfile ? timeAgoLabel(latestProfile.created_at) : ""}
          />
          <ActivityRow
            title="Catalog entries pending review"
            desc={
              pendingReviewCount && pendingReviewCount > 0
                ? `${pendingReviewCount} submission${pendingReviewCount === 1 ? "" : "s"} awaiting verification`
                : "No submissions currently need review"
            }
            time=""
          />
          <ActivityRow
            title="Community moderation queue"
            desc={
              latestFlaggedPost
                ? `Flagged: "${latestFlaggedPost.title}"`
                : "No flagged posts currently need review"
            }
            time={latestFlaggedPost ? timeAgoLabel(latestFlaggedPost.created_at) : ""}
          />
        </section>

        <section className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h3 className="font-semibold">Admin access confirmed</h3>
          </div>
          <p className="text-sm text-neutral-400">
            This screen only appears for profiles whose Supabase{" "}
            <code className="text-neutral-300">role</code> is set to{" "}
            <code className="text-neutral-300">admin</code>.
          </p>
          <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-3 text-sm text-neutral-500">
            Stats above reflect live counts from your Supabase tables. Verified
            submissions and moderation items require an admin `role` on your
            profile row to appear correctly, since row-level security limits
            what each account can see.
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  iconClass,
  value,
  label,
}: {
  icon: React.ReactNode;
  iconClass: string;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-800 p-5 space-y-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconClass}`}>
        {icon}
      </div>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-neutral-400 text-sm">{label}</p>
    </div>
  );
}

function ActivityRow({
  title,
  desc,
  time,
}: {
  title: string;
  desc: string;
  time: string;
}) {
  return (
    <div className="flex items-start justify-between px-5 py-4">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-neutral-500 mt-0.5">{desc}</p>
      </div>
      {time && <span className="text-sm text-neutral-500 shrink-0 ml-4">{time}</span>}
    </div>
  );
}

function PeopleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" strokeLinecap="round" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M15.5 13.5c2.5.3 4.5 2.4 4.5 5" strokeLinecap="round" />
    </svg>
  );
}

function DatabaseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6" strokeLinecap="round" />
      <path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" strokeLinecap="round" />
    </svg>
  );
}

function CheckShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.3 2.3 4.7-4.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 12l1.8 1.8L15 10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
