import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchSessions,
  createSession,
  deleteSession,
  Session,
} from "./api/client";
import { useState } from "react";

function App() {
  const [name, setName] = useState("");
  const queryClient = useQueryClient();

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: fetchSessions,
  });

  const createMutation = useMutation({
    mutationFn: createSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      setName("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      createMutation.mutate({ name });
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Sessions</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New session name"
        />
        <button type="submit">Add Session</button>
      </form>
      <ul>
        {sessions?.map((session: Session) => (
          <li key={session.id}>
            {session.name} - {session.game ?? "No game"}
            <button onClick={() => deleteMutation.mutate(session.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
