import { AppSidebar } from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (

    <div className="flex min-h-screen"> 
      <aside className="fixed inset-y-0 left-0 z-10 w-64">
        <AppSidebar />
      </aside>
      <main className="ml-64 flex-1">
        {children}
      </main>
    </div>
  );
}
