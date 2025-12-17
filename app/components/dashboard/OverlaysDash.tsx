import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Link } from "@tanstack/react-router";
import { Button } from "../ui/button";
import { useState } from "react";
import OBSWebSocket, { type OBSRequestTypes } from "obs-websocket-js";
import { Dialog, DialogDescription, DialogHeader, DialogTrigger, DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Loader2 } from "lucide-react";

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
    "Draft",
    "Bans"
];

function OverlaysDash({
    sessionId,
    team1DisplayName,
    team2DisplayName,
    game,
}: {
    sessionId: string;
    team1DisplayName: string;
    team2DisplayName: string;
    game: string | null;
}) {
    const [postImportInfoOpen, setPostImportInfoOpen] = useState(false);
    const [isDownloadingZip, setIsDownloadingZip] = useState(false);

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
                { name: "Draft", url: `${domain}/overlays/${sessionId}/match`, restartActive: true },
                { name: "Bans", url: `${domain}/overlays/${sessionId}/bans`, restartActive: true },
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
                console.log(`Scene '${source.name} - Scene' created.`);

                // Add browser source to the scene
                await obs.call("CreateInput", {
                    sceneName: `${source.name} - Scene`,
                    inputName: source.name,
                    inputKind: "browser_source",
                    inputSettings: {
                        url: source.url,
                        width: 1920,
                        height: 1080,
                        restart_when_active: source.restartActive,
                    },
                });
                console.log(`Browser source '${source.name}' added to scene.`);
            }

            // Add BARL to Match scene only if game is Rocket League
            if (game === "Rocket League") {
                await obs.call("CreateInput", {
                    sceneName: "Match - Scene",
                    inputName: "BARL",
                    inputKind: "browser_source",
                    inputSettings: {
                        url: "https://barl-overlay.web.app/",
                        width: 1920,
                        height: 1080,
                    },
                });
                console.log("BARL added to Match scene (Rocket League only).");
            }

            // Add Draft Site to Draft scene only if game is League of Legends or Deadlock
            if (game === "League of Legends" || game === "Deadlock") {
                await obs.call("CreateInput", {
                    sceneName: "Draft - Scene",
                    inputName: "Draft Site",
                    inputKind: "browser_source",
                    inputSettings: {
                        url: "",
                        width: 1920,
                        height: 1080,
                    },
                });
                console.log("Draft Site added to Draft scene (League of Legends/Deadlock only).");
            }

            // Create Inputs scene to hold all input references
            await obs.call("CreateScene", { sceneName: "Inputs" });
            console.log("Inputs scene created.");

            // Create all inputs in the Inputs scene
            // Game Audio
            await obs.call("CreateInput", {
                sceneName: "Inputs",
                inputName: "Game Audio",
                inputKind: "wasapi_process_output_capture",
                inputSettings: {
                    window: "Videos - File Explorer:CabinetWClass:explorer.exe",
                },
            });
            console.log("Game Audio input created in Inputs scene.");

            // Game Capture
            await obs.call("CreateInput", {
                sceneName: "Inputs",
                inputName: "Game Capture",
                inputKind: "game_capture",
            });
            console.log("Game Capture input created in Inputs scene.");

            // Caster Audio Input (audio output capture for Discord or audio device output)
            await obs.call("CreateInput", {
                sceneName: "Inputs",
                inputName: "Caster Audio Input",
                inputKind: "wasapi_output_capture",
            });
            console.log("Caster Audio Input created in Inputs scene (audio output capture).");

            // Producer Mic Input (will be muted and hidden by default)
            await obs.call("CreateInput", {
                sceneName: "Inputs",
                inputName: "Producer Mic Input",
                inputKind: "wasapi_input_capture",
            });
            // Mute Producer Mic globally by default
            await obs.call("SetInputMute", {
                inputName: "Producer Mic Input",
                inputMuted: true,
            });
            console.log("Producer Mic Input created in Inputs scene (muted by default).");

            // Waiting Music Audio Input
            await obs.call("CreateInput", {
                sceneName: "Inputs",
                inputName: "Waiting Music Audio Input",
                inputKind: "wasapi_input_capture",
            });
            console.log("Waiting Music Audio Input created in Inputs scene.");

            // Reference inputs in appropriate scenes
            // Game Audio: Match, Victory Team 1, Victory Team 2, Bans, Maps
            const gameAudioScenes = ["Match - Scene", "Victory Team 1 - Scene", "Victory Team 2 - Scene", "Bans - Scene", "Maps - Scene"];
            for (const sceneName of gameAudioScenes) {
                await obs.call("CreateSceneItem", {
                    sceneName: sceneName,
                    sourceName: "Game Audio",
                });
                console.log(`Game Audio referenced in ${sceneName}.`);
            }

            // Game Capture: Match, Victory Team 1, Victory Team 2
            const gameCaptureScenes = ["Match - Scene", "Victory Team 1 - Scene", "Victory Team 2 - Scene"];
            for (const sceneName of gameCaptureScenes) {
                await obs.call("CreateSceneItem", {
                    sceneName: sceneName,
                    sourceName: "Game Capture",
                });
                console.log(`Game Capture referenced in ${sceneName}.`);
            }

            // Caster Audio Input: Maps, Victory Team 1, Victory Team 2, Match, Casters, Casters Single Camera, Single Camera, Draft, Bans
            const casterAudioScenes = [
                "Maps - Scene",
                "Victory Team 1 - Scene",
                "Victory Team 2 - Scene",
                "Match - Scene",
                "Casters - Scene",
                "Casters Single Camera - Scene",
                "Single Camera - Scene",
                "Draft - Scene",
                "Bans - Scene",
            ];
            for (const sceneName of casterAudioScenes) {
                await obs.call("CreateSceneItem", {
                    sceneName: sceneName,
                    sourceName: "Caster Audio Input",
                });
                console.log(`Caster Audio Input referenced in ${sceneName}.`);
            }

            // Producer Mic Input: Maps, Victory Team 1, Victory Team 2, Match, Casters, Casters Single Camera, Single Camera, Draft, Bans
            // Note: Producer Mic is muted globally by default. To enable it, unmute it in the Inputs scene or use SetInputMute API.
            const producerMicScenes = [
                "Maps - Scene",
                "Victory Team 1 - Scene",
                "Victory Team 2 - Scene",
                "Match - Scene",
                "Casters - Scene",
                "Casters Single Camera - Scene",
                "Single Camera - Scene",
                "Draft - Scene",
                "Bans - Scene",
            ];
            for (const sceneName of producerMicScenes) {
                const { sceneItemId } = await obs.call("CreateSceneItem", {
                    sceneName: sceneName,
                    sourceName: "Producer Mic Input",
                });
                // Hide Producer Mic in each scene by default (muted globally, but also hidden for visual clarity)
                await obs.call("SetSceneItemEnabled", {
                    sceneName: sceneName,
                    sceneItemId: sceneItemId,
                    sceneItemEnabled: false,
                });
                console.log(`Producer Mic Input referenced in ${sceneName} (hidden by default).`);
            }

            // Waiting Music Audio Input: BRB, Waiting for Next, Starting Soon, Thanks
            const waitingMusicScenes = ["BRB - Scene", "Waiting for Next - Scene", "Starting Soon - Scene", "Thanks - Scene"];
            for (const sceneName of waitingMusicScenes) {
                await obs.call("CreateSceneItem", {
                    sceneName: sceneName,
                    sourceName: "Waiting Music Audio Input",
                });
                console.log(`Waiting Music Audio Input referenced in ${sceneName}.`);
            }

            // set scene to starting soon
            await obs.call("SetCurrentProgramScene", { sceneName: "Starting Soon - Scene" });

            // Set current scene transition to fade
            await obs.call("SetCurrentSceneTransition", {
                transitionName: "Fade",
            });

            // Remove "Scene" scene
            await obs.call("RemoveScene", { sceneName: "Scene" });


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
                <div className="flex gap-2 justify-center mt-2">
                    <Button
                        onClick={async () => {
                            setIsDownloadingZip(true);
                            try {
                                const response = await fetch(`/api/${sessionId}/download-webdeck-zip`);
                                if (!response.ok) {
                                    throw new Error("Failed to download zip file");
                                }
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const link = document.createElement("a");
                                link.href = url;
                                link.download = `WebDeck-${sessionId}.zip`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                window.URL.revokeObjectURL(url);
                            } catch (error) {
                                console.error("Error downloading zip:", error);
                                alert("Failed to download zip file. Please try again.");
                            } finally {
                                setIsDownloadingZip(false);
                            }
                        }}
                        variant="outline"
                        disabled={isDownloadingZip}
                    >
                        {isDownloadingZip ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating Zip...
                            </>
                        ) : (
                            "Download WebDeck Zip"
                        )}
                    </Button>
                </div>
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
                            choose Stinger. Download the{" "}
                            <a href="/Stinger.webm" className="text-blue-500" download={true}>
                                Stinger.webm
                            </a>{" "}
                            file and use that as the path. Set the Transition Point to 1000ms. Set the Animation Delay on here to 2 seconds.
                        </p>
                        <p>You will also need to set any game inputs and audio inputs to the correct settings!</p>
                        <p>
                            <strong>Important:</strong> Go to the "Inputs" scene and configure all audio inputs:
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li><strong>Game Audio:</strong> Set to capture game audio output</li>
                                <li><strong>Caster Audio Input:</strong> Set to capture Discord or your caster audio output channel</li>
                                <li><strong>Producer Mic Input:</strong> Set to your producer microphone. It is muted and hidden by default. To enable it, go to the Inputs scene, show the Producer Mic Input, and unmute it. This will enable it across all scenes.</li>
                                <li><strong>Waiting Music Audio Input:</strong> Set to capture your waiting music audio source</li>
                            </ul>
                        </p>
                        <p>After disconnecting from OBS, you can delete the scene collection and all scenes and sources.</p>
                        <p>DRAG THE BROWSER SOURCES ABOVE THE GAME AND CAMERAS PLEASE</p>
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
                    {sceneName === "Victory Team 1" || sceneName === "Victory Team 2"
                        ? `${sceneName} - ${sceneName === "Victory Team 1" ? team1DisplayName : team2DisplayName}`
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
            <Button>
                <Link target="_blank" to={`/overlays/${sessionId}/match`}>
                    Draft (same as Match overlay)
                </Link>
            </Button>
            <Button>
                <Link target="_blank" to={`/overlays/${sessionId}/bans`}>
                    Bans
                </Link>
            </Button>
        </>
    );
}

export default OverlaysDash;
