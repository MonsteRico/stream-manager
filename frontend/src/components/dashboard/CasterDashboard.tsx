import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { fetchSession } from "@/api/client";
import type { CasterInfo, Session } from "@stream-manager/shared";

interface CasterDashboardProps {
  sessionId: string;
  mutateFn: (data: Partial<Session>) => void;
}

export default function CasterDashboard({
  sessionId,
  mutateFn,
}: CasterDashboardProps) {
  const sessionQuery = useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => fetchSession(sessionId),
  });

  const session = sessionQuery.data;

  const [casters, setCasters] = useState<CasterInfo[]>(
    (session?.casters as CasterInfo[]) || []
  );
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (sessionQuery.data) {
      setCasters((sessionQuery.data.casters as CasterInfo[]) || []);
    }
  }, [sessionQuery.data]);

  const addCaster = () => {
    const newCaster: CasterInfo = {
      id: Date.now(),
      name: "",
      pronouns: "",
      twitter: "",
      twitch: "",
      youtube: "",
      instagram: "",
    };
    setCasters([...casters, newCaster]);
    setHasChanges(true);
  };

  const removeCaster = (id: number) => {
    const newCasters = casters.filter((caster) => caster.id !== id);
    setCasters(newCasters);
    setHasChanges(true);
  };

  const updateCaster = (
    id: number,
    field: keyof CasterInfo,
    value: string
  ) => {
    const newCasters = casters.map((caster) =>
      caster.id === id ? { ...caster, [field]: value } : caster
    );
    setCasters(newCasters);
    setHasChanges(true);
  };

  const handleSave = useCallback(() => {
    mutateFn({
      casters: casters,
    });
    setHasChanges(false);
  }, [casters, mutateFn]);

  useEffect(() => {
    function handle(event: KeyboardEvent) {
      if (event.key === "s" && event.ctrlKey) {
        event.preventDefault();
        handleSave();
      }
    }

    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [handleSave]);

  if (!session) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Casters Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Label>Number of Casters: {casters.length}</Label>
            <Button
              type="button"
              onClick={addCaster}
              className="bg-green-600 hover:bg-green-700"
            >
              Add Caster
            </Button>
          </div>
          {casters.map((caster, index) => (
            <div key={caster.id} className="space-y-4 p-4 bg-gray-700 rounded-lg">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Caster {index + 1}</h3>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => removeCaster(caster.id)}
                  className="h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove caster</span>
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`name-${caster.id}`}>Name</Label>
                  <Input
                    id={`name-${caster.id}`}
                    value={caster.name}
                    onChange={(e) =>
                      updateCaster(caster.id, "name", e.target.value)
                    }
                    className="bg-gray-600 border-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`pronouns-${caster.id}`}>Pronouns</Label>
                  <Input
                    id={`pronouns-${caster.id}`}
                    value={caster.pronouns}
                    onChange={(e) =>
                      updateCaster(caster.id, "pronouns", e.target.value)
                    }
                    className="bg-gray-600 border-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`twitter-${caster.id}`}>Twitter</Label>
                  <Input
                    id={`twitter-${caster.id}`}
                    value={caster.twitter}
                    onChange={(e) =>
                      updateCaster(caster.id, "twitter", e.target.value)
                    }
                    className="bg-gray-600 border-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`twitch-${caster.id}`}>Twitch</Label>
                  <Input
                    id={`twitch-${caster.id}`}
                    value={caster.twitch}
                    onChange={(e) =>
                      updateCaster(caster.id, "twitch", e.target.value)
                    }
                    className="bg-gray-600 border-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`youtube-${caster.id}`}>YouTube</Label>
                  <Input
                    id={`youtube-${caster.id}`}
                    value={caster.youtube}
                    onChange={(e) =>
                      updateCaster(caster.id, "youtube", e.target.value)
                    }
                    className="bg-gray-600 border-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`instagram-${caster.id}`}>Instagram</Label>
                  <Input
                    id={`instagram-${caster.id}`}
                    value={caster.instagram}
                    onChange={(e) =>
                      updateCaster(caster.id, "instagram", e.target.value)
                    }
                    className="bg-gray-600 border-gray-500"
                  />
                </div>
              </div>
            </div>
          ))}
          <Button
            type="button"
            onClick={handleSave}
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={!hasChanges}
          >
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
