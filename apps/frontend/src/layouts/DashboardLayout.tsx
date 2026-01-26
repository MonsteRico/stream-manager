import { Outlet, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function DashboardLayout() {
  const location = useLocation();

  return (
    <main className="bg-background min-h-screen">
      <nav className="flex flex-row justify-between bg-muted mx-auto p-4">
        <div className="flex flex-row gap-4">
          <Link to="/">
            <Button
              variant="link"
              className={location.pathname === "/" ? "underline" : ""}
            >
              Dashboard
            </Button>
          </Link>
          <Link to="/manage-teams">
            <Button
              variant="link"
              className={location.pathname === "/manage-teams" ? "underline" : ""}
            >
              Manage Teams
            </Button>
          </Link>
        </div>
        <Button>Settings</Button>
      </nav>
      <Outlet />
    </main>
  );
}
