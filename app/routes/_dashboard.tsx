import { Button } from '@/components/ui/button'
import { createFileRoute, Link, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute("/_dashboard")({
    component: () => (
        <main className="bg-background min-h-screen">
            <nav className="flex flex-row justify-between bg-muted mx-auto p-4">
                <div className="flex flex-row gap-4">
                    <Link to="/">
                        <Button variant="link">Dashboard</Button>
                    </Link>
                    <Link to="/manageTeams">
                        <Button variant="link">Manage Teams</Button>
                    </Link>
                </div>
                <Button>Settings</Button>
            </nav>
            <Outlet />
        </main>
    ),
});
