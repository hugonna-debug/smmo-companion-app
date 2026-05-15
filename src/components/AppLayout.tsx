import { Outlet } from "react-router-dom";
import { useLayout } from "../contexts/LayoutContext";
import { AppSidebar } from "./AppSidebar";
import { LShapeLayout } from "./LShapeLayout";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "./ui/sidebar";

function NormalLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 items-center px-4 md:hidden">
          <SidebarTrigger />
        </header>
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export function AppLayout() {
  const { isLShape } = useLayout();

  if (isLShape) {
    return <LShapeLayout />;
  }

  return <NormalLayout />;
}
