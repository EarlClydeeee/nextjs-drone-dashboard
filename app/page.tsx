import { DashboardClient } from "./components/dashboard/DashboardClient";

export default function Home() {
  return (
    <div className="min-h-full flex-1 bg-[var(--dashboard-bg)]">
      <DashboardClient />
    </div>
  );
}
