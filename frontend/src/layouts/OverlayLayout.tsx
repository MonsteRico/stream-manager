import { useEffect } from "react";
import { Outlet } from "react-router-dom";

export function OverlayLayout() {
  useEffect(() => {
    // Ensure body, html, and root are transparent for overlay routes
    document.body.style.backgroundColor = "transparent";
    document.documentElement.style.backgroundColor = "transparent";
    const root = document.getElementById("root");
    if (root) {
      root.style.backgroundColor = "transparent";
    }
    
    return () => {
      // Restore default background when leaving overlay routes
      document.body.style.backgroundColor = "";
      document.documentElement.style.backgroundColor = "";
      if (root) {
        root.style.backgroundColor = "";
      }
    };
  }, []);

  return (
    <main className="bg-transparent">
      <Outlet />
    </main>
  );
}
