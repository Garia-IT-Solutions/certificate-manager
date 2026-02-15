import { AppSidebar } from "@/components/Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AuthCheck from "@/components/AuthCheck";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthCheck>
      <SidebarProvider>
        <div className="flex min-h-screen w-full relative">
          <AppSidebar />

          <main className="flex-1 flex flex-col min-w-0 w-full md:pl-64">
            <div className="md:hidden flex items-center px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
              <SidebarTrigger className="text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 p-2 rounded-md transition-colors" />
              <span className="ml-3 text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-white">
                Menu
              </span>
            </div>

            <div className="flex-1 w-full max-w-[100vw]">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </AuthCheck>
  );
}