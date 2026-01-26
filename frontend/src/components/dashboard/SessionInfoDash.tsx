import { useNavigate } from "react-router-dom";
import { useCallback, useState } from "react";
import type { Session } from "@stream-manager/shared";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Edit2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { deleteSession } from "@/api/client";

interface SessionInfoDashProps {
  session: Session;
  mutateFn: (data: Partial<Session>) => void;
}

function SessionInfoDash({ session, mutateFn }: SessionInfoDashProps) {
  const [editingSession, setEditingSession] = useState(false);
  const [sessionName, setSessionName] = useState(session.name);
  const [animationDelay, setAnimationDelay] = useState(session.animationDelay?.toString() || "0");
  const navigate = useNavigate();

  const handleSelectChange = (name: string, value: string) => {
    mutateFn({
      [name]: value,
    });
  };

  const handleSessionNameBlur = useCallback(() => {
    mutateFn({ name: sessionName });
    setEditingSession(false);
  }, [sessionName, mutateFn]);

  const handleAnimationDelayBlur = useCallback(() => {
    mutateFn({ animationDelay: parseInt(animationDelay) || 0 });
  }, [animationDelay, mutateFn]);

  const handleEndSession = async () => {
    try {
      await deleteSession(session.id);
      localStorage.removeItem("sessionId");
      navigate("/");
    } catch (error) {
      console.error("Failed to end session:", error);
    }
  };

  return (
    <Card className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
      <CardHeader>
        {editingSession ? (
          <Input
            className="text-3xl font-bold bg-transparent border-b border-white w-full"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            onBlur={handleSessionNameBlur}
            autoFocus
          />
        ) : (
          <h1
            className="text-3xl font-bold text-center cursor-pointer hover:text-gray-300 transition-colors duration-200"
            onClick={() => setEditingSession(true)}
          >
            {session.name} <Edit2 className="inline-block w-6 h-6 ml-2" />
          </h1>
        )}
      </CardHeader>
      <CardContent className="flex flex-row justify-between gap-2">
        <div className="flex flex-row items-center gap-2">
          <Label htmlFor="game">Game</Label>
          <Select
            name="game"
            value={session.game as string}
            onValueChange={(value) => handleSelectChange("game", value)}
          >
            <SelectTrigger className="bg-gray-700 border-gray-600 min-w-32">
              <SelectValue placeholder="Select a game" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Overwatch">Overwatch</SelectItem>
              <SelectItem value="Marvel Rivals">Marvel Rivals</SelectItem>
              <SelectItem value="Rocket League">Rocket League</SelectItem>
              <SelectItem value="Smash">Smash</SelectItem>
              <SelectItem value="Valorant">Valorant</SelectItem>
              <SelectItem value="CS">CS</SelectItem>
              <SelectItem value="League of Legends">League of Legends</SelectItem>
              <SelectItem value="Deadlock">Deadlock</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-row items-center gap-2">
          <Label htmlFor="animationDelay">Animation Delay (in seconds)</Label>
          <Input
            className="text-xl font-bold bg-transparent border-b border-white w-full"
            value={animationDelay}
            onChange={(e) => setAnimationDelay(e.target.value)}
            onBlur={handleAnimationDelayBlur}
          />
        </div>
        <div className="flex flex-row items-center gap-2">
          <Button variant="destructive" onClick={handleEndSession}>
            End Session
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default SessionInfoDash;
