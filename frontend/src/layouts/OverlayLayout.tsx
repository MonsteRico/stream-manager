import { Outlet } from "react-router-dom";

export function OverlayLayout() {
  return (
    <main className="bg-transparent">
      <Outlet />
    </main>
  );
}
