import { Link } from "react-router-dom";
import { useState } from "react";
import OBSWebSocket from "obs-websocket-js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
  DialogContent,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { triggerWebDeckDownload } from "@/api/client";

interface OverlaysDashProps {
  sessionId: string;
  team1DisplayName: string;
  team2DisplayName: string;
  game: string | null;
}

function OverlaysDash({
  sessionId,
  team1DisplayName,
  team2DisplayName,
  game: _game, // Used for game-specific OBS setup (BARL, Draft sites)
}: OverlaysDashProps) {
  const [postImportInfoOpen, setPostImportInfoOpen] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  const [connectedToObs, setConnectedToObs] = useState(false);
  const [obsUrl, setObsUrl] = useState("");
  const [obsPort, setObsPort] = useState("");
  const [obsPassword, setObsPassword] = useState("");

  const [obs] = useState(new OBSWebSocket());

  async function connectToObs() {
    try {
      const { obsWebSocketVersion, negotiatedRpcVersion } = await obs.connect(
        `ws://${obsUrl === "" ? "localhost" : obsUrl}:${obsPort === "" ? "4455" : obsPort}`,
        obsPassword !== "" ? obsPassword : undefined,
        {
          rpcVersion: 1,
        }
      );
      console.log(
        `Connected to server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`
      );

      const domain = window.location.origin;
      const sceneCollectionName = `OverlayScenes - ${sessionId}`;
      const browserSources = [
        {
          name: "Match",
          url: `${domain}/overlays/${sessionId}/match`,
          restartActive: true,
        },
        {
          name: "BRB",
          url: `${domain}/overlays/${sessionId}/brb`,
          restartActive: false,
        },
        {
          name: "Victory Team 1",
          url: `${domain}/overlays/${sessionId}/victory/team1`,
          restartActive: true,
        },
        {
          name: "Victory Team 2",
          url: `${domain}/overlays/${sessionId}/victory/team2`,
          restartActive: true,
        },
        {
          name: "Maps",
          url: `${domain}/overlays/${sessionId}/maps`,
          restartActive: true,
        },
        {
          name: "Starting Soon",
          url: `${domain}/overlays/${sessionId}/starting-soon`,
          restartActive: false,
        },
        {
          name: "Waiting for Next",
          url: `${domain}/overlays/${sessionId}/waiting-for-next`,
          restartActive: false,
        },
        {
          name: "Thanks",
          url: `${domain}/overlays/${sessionId}/thanks`,
          restartActive: false,
        },
        {
          name: "Casters",
          url: `${domain}/overlays/${sessionId}/casters`,
          restartActive: true,
        },
        {
          name: "Casters Single Camera",
          url: `${domain}/overlays/${sessionId}/casters-single-camera`,
          restartActive: true,
        },
        {
          name: "Single Camera",
          url: `${domain}/overlays/${sessionId}/single-camera`,
          restartActive: true,
        },
        {
          name: "Draft",
          url: `${domain}/overlays/${sessionId}/match`,
          restartActive: true,
        },
        {
          name: "Bans",
          url: `${domain}/overlays/${sessionId}/bans`,
          restartActive: true,
        },
      ];

      const { sceneCollections } = await obs.call("GetSceneCollectionList");
      if (sceneCollections.find((collection) => collection === sceneCollectionName)) {
        await obs.call("SetCurrentSceneCollection", { sceneCollectionName });
        setPostImportInfoOpen(true);
        setConnectedToObs(true);
        return;
      }

      await obs.call("CreateSceneCollection", { sceneCollectionName });

      for (const source of browserSources) {
        await obs.call("CreateScene", { sceneName: `${source.name} - Scene` });
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
      }

      await obs.call("SetCurrentProgramScene", {
        sceneName: "Starting Soon - Scene",
      });
      await obs.call("SetCurrentSceneTransition", { transitionName: "Fade" });

      try {
        await obs.call("RemoveScene", { sceneName: "Scene" });
      } catch {
        // Scene might not exist
      }

      setPostImportInfoOpen(true);
      setConnectedToObs(true);
    } catch (error: unknown) {
      const err = error as { code?: number; message?: string };
      console.error("Failed to connect", err.code, err.message);
    }
  }

  function disconnectFromObs() {
    obs.disconnect();
    setConnectedToObs(false);
  }

  return (
    <Card className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Overlays
        </CardTitle>
        <CardDescription>Setup OBS</CardDescription>

        {connectedToObs && (
          <Button onClick={disconnectFromObs}>Disconnect</Button>
        )}
        {!connectedToObs && (
          <Dialog>
            <DialogTrigger asChild>
              <Button>Connect to OBS</Button>
            </DialogTrigger>

            <DialogContent className="flex flex-col gap-4">
              <DialogHeader>Connect to OBS</DialogHeader>
              <DialogDescription>
                Set the URL of your OBS instance below. You can find this in
                Tools -&gt; WebSocket Server Settings -&gt; Show Connect Info.
              </DialogDescription>
              <div className="flex flex-row items-center gap-4">
                <Label htmlFor="obs-url">OBS URL</Label>
                <Input
                  id="obs-url"
                  value={obsUrl}
                  onChange={(e) => setObsUrl(e.target.value)}
                  placeholder="localhost"
                />
              </div>
              <div className="flex flex-row items-center gap-4">
                <Label htmlFor="obs-port">OBS Port</Label>
                <Input
                  id="obs-port"
                  placeholder="4455"
                  onChange={(e) => setObsPort(e.target.value)}
                  value={obsPort}
                />
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
        {!connectedToObs && (
          <Links
            sessionId={sessionId}
            team1DisplayName={team1DisplayName}
            team2DisplayName={team2DisplayName}
          />
        )}
        {connectedToObs && (
          <div className="flex gap-2 justify-center mt-2">
            <Button
              onClick={async () => {
                setIsDownloadingZip(true);
                try {
                  await triggerWebDeckDownload(sessionId);
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
        )}
      </CardContent>
      <Dialog open={postImportInfoOpen} onOpenChange={setPostImportInfoOpen}>
        <DialogContent>
          <DialogHeader>Next Steps</DialogHeader>
          <DialogDescription>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white text-xl">
              <li>Download the WebDeck zip file</li>
              <li>Unzip the file wherever you want WebDeck to live</li>
              <li>In your OBS, the scenes have already been imported</li>
              <li>
                Set the transitions to Stinger. Use the Stinger.webm file from
                the WebDeck zip.
              </li>
              <li>
                Go to the "Inputs" scene and configure all your audio, game,
                video inputs
              </li>
              <li className="font-bold">
                Drag the browser sources above the game or camera sources so
                they are visible
              </li>
            </ul>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </Card>
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
  return (
    <>
      <Button asChild>
        <Link target="_blank" to={`/overlays/${sessionId}/match`}>
          Match
        </Link>
      </Button>
      <Button asChild>
        <Link target="_blank" to={`/overlays/${sessionId}/brb`}>
          Be Right Back
        </Link>
      </Button>
      <Button asChild>
        <Link target="_blank" to={`/overlays/${sessionId}/victory/team1`}>
          Victory {team1DisplayName}
        </Link>
      </Button>
      <Button asChild>
        <Link target="_blank" to={`/overlays/${sessionId}/victory/team2`}>
          Victory {team2DisplayName}
        </Link>
      </Button>
      <Button asChild>
        <Link target="_blank" to={`/overlays/${sessionId}/maps`}>
          Maps
        </Link>
      </Button>
      <Button asChild>
        <Link target="_blank" to={`/overlays/${sessionId}/starting-soon`}>
          Starting Soon
        </Link>
      </Button>
      <Button asChild>
        <Link target="_blank" to={`/overlays/${sessionId}/waiting-for-next`}>
          Waiting For Next
        </Link>
      </Button>
      <Button asChild>
        <Link target="_blank" to={`/overlays/${sessionId}/thanks`}>
          Thanks
        </Link>
      </Button>
      <Button asChild>
        <Link target="_blank" to={`/overlays/${sessionId}/casters`}>
          Casters
        </Link>
      </Button>
      <Button asChild>
        <Link
          target="_blank"
          to={`/overlays/${sessionId}/casters-single-camera`}
        >
          Casters (Single Camera)
        </Link>
      </Button>
      <Button asChild>
        <Link target="_blank" to={`/overlays/${sessionId}/single-camera`}>
          Single Camera Feed
        </Link>
      </Button>
      <Button asChild>
        <Link target="_blank" to={`/overlays/${sessionId}/bans`}>
          Bans
        </Link>
      </Button>
    </>
  );
}

export default OverlaysDash;
