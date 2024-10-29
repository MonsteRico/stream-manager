// app/routes/index.tsx
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { sessionsTable } from "@/db/schema";
import { startSession } from "@/lib/serverFunctions";
import { createFileRoute, Link, redirect, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { eq } from "drizzle-orm";
import { useEffect } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Tv, Users, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
    component: Home,
});

function Home() {
    const router = useRouter();

    useEffect(() => {
        if (localStorage.getItem("sessionId")) {
            const sessionId = localStorage.getItem("sessionId");
            router.navigate({
                to: `/session/${sessionId}`,
            });
        }
    });

    return (
        <div className="min-h-screen bg-background">
            <header className="container mx-auto px-4 py-6">
                <nav className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">StreamManager</h1>
                </nav>
            </header>

            <main>
                <section className="container mx-auto px-4 py-12 text-center">
                    <h2 className="text-4xl font-extrabold mb-4">Manage Your Match Streams with Ease</h2>
                    <p className="text-xl text-muted-foreground mb-8">
                        Making it easier than ever to spin up a match stream with just a few clicks.
                    </p>
                    <Button
                        onClick={async () => {
                            const newSession = await startSession();
                            localStorage.setItem("sessionId", newSession.id);
                            router.navigate({
                                to: `/session/${newSession.id}`,
                            });
                        }}
                    >
                        Start Session
                    </Button>
                </section>

                <section className="bg-muted py-16">
                    <div className="container mx-auto px-4">
                        <h3 className="text-3xl font-bold text-center mb-12">How It Works</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <Card>
                                <CardHeader>
                                    <Tv className="w-10 h-10 mb-2 text-primary" />
                                    <CardTitle>Manage Match Information</CardTitle>
                                </CardHeader>
                                <CardContent>Manage team name, colors, logo, score and more with a simple dashboard.</CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <Zap className="w-10 h-10 mb-2 text-primary" />
                                    <CardTitle>Add Overlays to OBS</CardTitle>
                                </CardHeader>
                                <CardContent>Quickly add all the overlays to OBS with a single click.</CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <Users className="w-10 h-10 mb-2 text-primary" />
                                    <CardTitle>Easily Run Your Stream</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    You can easily run your stream now with the dashboard, from switching scenes to updating scores!
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-muted py-6">
                <div className="container mx-auto px-4 text-center text-muted-foreground">
                    <p>&copy; 2024 Matthew Gardner. All rights reserved.</p>
                    <div className="mt-2">
                        <Link href="#" className="hover:underline">
                            Terms of Service
                        </Link>
                        {" | "}
                        <Link href="#" className="hover:underline">
                            Privacy Policy
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
