import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Link } from "@tanstack/react-router";
import { Button } from "../ui/button";
import { useState } from "react";
import OBSWebSocket, { type OBSRequestTypes } from "obs-websocket-js";
import { Dialog, DialogDescription, DialogHeader, DialogTrigger, DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

const sceneNames = [
    "Match",
    "BRB",
    "Victory Team 1",
    "Victory Team 2",
    "Maps",
    "Starting Soon",
    "Waiting for Next",
    "Thanks",
    "Casters",
    "Casters Single Camera",
    "Single Camera",
];

function OverlaysDash({
    sessionId,
    team1DisplayName,
    team2DisplayName,
}: {
    sessionId: string;
    team1DisplayName: string;
    team2DisplayName: string;
}) {
    const [postImportInfoOpen, setPostImportInfoOpen] = useState(false);

    const [connectedToObs, setConnectedToObs] = useState(false);
    const [obsUrl, setObsUrl] = useState("");
    const [obsPort, setObsPort] = useState("");
    const [obsPassword, setObsPassword] = useState("");

    const [obs, setObs] = useState(new OBSWebSocket());

    async function connectToObs() {
        try {
            const { obsWebSocketVersion, negotiatedRpcVersion } = await obs.connect(
                `ws://${obsUrl == "" ? "localhost" : obsUrl}:${obsPort == "" ? "4455" : obsPort}`,
                obsPassword != "" ? obsPassword : undefined,
                {
                    rpcVersion: 1,
                },
            );
            console.log(`Connected to server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`);
            const domain = window.location.origin;
            // Define your scene collection name and URLs
            const sceneCollectionName = `OverlayScenes - ${sessionId}`;
            const browserSources = [
                { name: "Match", url: `${domain}/overlays/${sessionId}/match`, restartActive: true },
                { name: "BRB", url: `${domain}/overlays/${sessionId}/brb`, restartActive: false },
                { name: "Victory Team 1", url: `${domain}/overlays/${sessionId}/victory/team1`, restartActive: true },
                { name: "Victory Team 2", url: `${domain}/overlays/${sessionId}/victory/team2`, restartActive: true },
                { name: "Maps", url: `${domain}/overlays/${sessionId}/maps`, restartActive: true },
                { name: "Starting Soon", url: `${domain}/overlays/${sessionId}/startingSoon`, restartActive: false },
                { name: "Waiting for Next", url: `${domain}/overlays/${sessionId}/waitingForNext`, restartActive: false },
                { name: "Thanks", url: `${domain}/overlays/${sessionId}/thanks`, restartActive: false },
                { name: "Casters", url: `${domain}/overlays/${sessionId}/casters`, restartActive: true },
                { name: "Casters Single Camera", url: `${domain}/overlays/${sessionId}/castersSingleCamera`, restartActive: true },
                { name: "Single Camera", url: `${domain}/overlays/${sessionId}/singleCamera`, restartActive: true },
            ];

            // check if scene collection already exists
            const { sceneCollections } = await obs.call("GetSceneCollectionList");
            console.log("Existing scene collections:", sceneCollections);
            if (sceneCollections.find((collection) => collection === sceneCollectionName)) {
                // switch to existing scene collection
                await obs.call("SetCurrentSceneCollection", { sceneCollectionName });

                setPostImportInfoOpen(true);

                setConnectedToObs(true);
                return;
            }

            // Create new scene collection
            await obs.call("CreateSceneCollection", { sceneCollectionName });
            console.log(`Scene collection '${sceneCollectionName}' created.`);

            // Create a scene and add a browser source for each URL
            for (const source of browserSources) {
                // Create scene
                await obs.call("CreateScene", { sceneName: `${source.name} - Scene` });
                console.log(`Scene '${source.name}' created.`);

                // Add browser source to the scene
                await obs.call("CreateInput", {
                    sceneName: `${source.name} - Scene`,
                    inputName: source.name,
                    inputKind: "browser_source",
                    inputSettings: {
                        url: source.url,
                        width: 1920, // Set width and height as needed
                        height: 1080,
                        restart_when_active: source.restartActive,
                    },
                });
                console.log(`Browser source '${source.name}' added to scene.`);
            }

            // set scene to starting soon
            await obs.call("SetCurrentProgramScene", { sceneName: "Starting Soon - Scene" });

            // Set current scene transition to fade
            await obs.call("SetCurrentSceneTransition", {
                transitionName: "Fade",
            });

            // Remove "Scene" scene
            await obs.call("RemoveScene", { sceneName: "Scene" });

            console.log("All scenes and sources have been set up.");

            setPostImportInfoOpen(true);

            setConnectedToObs(true);
        } catch (error: any) {
            console.error("Failed to connect", error.code, error.message);
        }
    }

    function disconnectFromObs() {
        obs.disconnect();
        setConnectedToObs(false);
    }

    return (
        <Card className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Overlays</CardTitle>
                <CardDescription>
                    Click the links below to {connectedToObs ? "switch to the corresponding scene." : "open the overlay in a new tab."}
                </CardDescription>
                {connectedToObs && <Button onClick={disconnectFromObs}>Disconnect</Button>}
                {!connectedToObs && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button>Connect to OBS</Button>
                        </DialogTrigger>

                        <DialogContent className="flex flex-col gap-4">
                            <DialogHeader>Connect to OBS</DialogHeader>
                            <DialogDescription>
                                Set the URL of your OBS instance below. You can find this in Tools -&gt; WebSocket Server Settings. -&gt;
                                Show Connect Info. Use the server IP, port, and password shown (if no authentication enabled leave password
                                blank).
                            </DialogDescription>
                            <div className="flex flex-row items-center gap-4">
                                <Label htmlFor="obs-url">OBS URL</Label>
                                <Input id="obs-url" value={obsUrl} onChange={(e) => setObsUrl(e.target.value)} placeholder="localhost" />
                            </div>
                            <div className="flex flex-row items-center gap-4">
                                <Label htmlFor="obs-port">OBS Port</Label>
                                <Input id="obs-port" placeholder="4455" onChange={(e) => setObsPort(e.target.value)} value={obsPort} />
                            </div>
                            <div className="flex flex-row items-center gap-4">
                                <Label htmlFor="obs-password">OBS Password</Label>
                                <Input
                                    id="obs-password"
                                    value={obsPassword}
                                    onChange={(e) => setObsPassword(e.target.value)}
                                    placeholder="*********"
                                />
                            </div>
                            <Button onClick={connectToObs}>Connect</Button>
                        </DialogContent>
                    </Dialog>
                )}
            </CardHeader>
            <CardContent className="flex flex-wrap justify-center gap-4">
                {!connectedToObs && <Links sessionId={sessionId} team1DisplayName={team1DisplayName} team2DisplayName={team2DisplayName} />}
                {connectedToObs && (
                    <OBSButtons sessionId={sessionId} team1DisplayName={team1DisplayName} team2DisplayName={team2DisplayName} obs={obs} />
                )}
            </CardContent>
            <Dialog open={postImportInfoOpen} onOpenChange={setPostImportInfoOpen}>
                <DialogContent>
                    <DialogHeader>Post Import Information</DialogHeader>
                    <DialogDescription>
                        <p>
                            After importing the scenes, you will need to set the transitions to Stinger. Click the + under the transitions,
                            choose Stinger. Download the <a href="/Stinger.webm">Stinger.webm</a> file and use that as the path. Set the
                            Transition Point to 1000ms. Set the Animation Delay on here to 2 seconds.
                        </p>
                        <p>You will also need to set any game inputs and audio inputs to the correct settings!</p>
                        <p>After disconnecting from OBS, you can delete the scene collection and all scenes and sources.</p>
                    </DialogDescription>
                </DialogContent>
            </Dialog>
        </Card>
    );
}

function OBSButtons({
    sessionId,
    team1DisplayName,
    team2DisplayName,
    obs,
}: {
    sessionId: string;
    team1DisplayName: string;
    team2DisplayName: string;
    obs: OBSWebSocket;
}) {
    return (
        <>
            {sceneNames.map((sceneName, index) => (
                <Button key={index} onClick={() => obs.call("SetCurrentProgramScene", { sceneName: `${sceneName} - Scene` })}>
                    {sceneName === "Team 1" || sceneName === "Team 2"
                        ? `${sceneName} - ${sceneName === "Team 1" ? team1DisplayName : team2DisplayName}`
                        : sceneName}
                </Button>
            ))}
        </>
    );
}

function Links({
    sessionId,
    team1DisplayName,
    team2DisplayName,
}: {
    sessionId: string;
    team1DisplayName: string;
    team2DisplayName: string;
}) {
    const singleCameraWidth = Math.round(window.innerWidth * 0.9);
    const singleCameraHeight = Math.round(window.innerHeight * 0.9);
    const casterCameraWidth = Math.round(window.innerWidth * 0.33);
    const casterCameraHeight = Math.round(window.innerHeight * 0.7);

    return (
        <>
            <Button>
                <Link target="_blank" to={`/overlays/${sessionId}/match`}>
                    Match
                </Link>
            </Button>
            <Button>
                <Link target="_blank" to={`/overlays/${sessionId}/brb`}>
                    Be Right Back
                </Link>
            </Button>
            <Button>
                <Link target="_blank" to={`/overlays/${sessionId}/victory/team1`}>
                    Victory {team1DisplayName}
                </Link>
            </Button>
            <Button>
                <Link target="_blank" to={`/overlays/${sessionId}/victory/team2`}>
                    Victory {team2DisplayName}
                </Link>
            </Button>
            <Button>
                <Link target="_blank" to={`/overlays/${sessionId}/maps`}>
                    Maps
                </Link>
            </Button>
            <Button>
                <Link target="_blank" to={`/overlays/${sessionId}/startingSoon`}>
                    Starting Soon
                </Link>
            </Button>
            <Button>
                <Link target="_blank" to={`/overlays/${sessionId}/waitingForNext`}>
                    Waiting For Next
                </Link>
            </Button>
            <Button>
                <Link target="_blank" to={`/overlays/${sessionId}/thanks`}>
                    Thanks
                </Link>
            </Button>
            <Button>
                <Link target="_blank" to={`/overlays/${sessionId}/casters`}>
                    Casters [{casterCameraWidth}x{casterCameraHeight}]
                </Link>
            </Button>
            <Button>
                <Link target="_blank" to={`/overlays/${sessionId}/castersSingleCamera`}>
                    Casters (Single Camera) [{singleCameraWidth}x{singleCameraHeight}]
                </Link>
            </Button>
            <Button>
                <Link target="_blank" to={`/overlays/${sessionId}/singleCamera`}>
                    Single Camera Feed (Add "?text=[insert text here]" to the URL to change the text)
                </Link>
            </Button>
        </>
    );
}

export default OverlaysDash;
