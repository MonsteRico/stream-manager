// app/routes/index.tsx
import { Button } from '@/components/ui/button';
import { db } from '@/db';
import { sessionsTable } from '@/db/schema';
import { startSession } from '@/lib/serverFunctions';
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/start'
import { eq } from 'drizzle-orm';
import { useEffect } from 'react';


const getSession = createServerFn('GET', async (id:string) => {
  return await db.query.sessionsTable.findFirst({
    where: eq(sessionsTable.id, id)
  })
})

// const updateCount = createServerFn('POST', async (addBy: number) => {
//   const count = await readCount()
//   await fs.promises.writeFile(filePath, `${count + addBy}`)
// })

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const router = useRouter()
  
  useEffect(() => {
    if (localStorage.getItem("sessionId")) {
        const sessionId = localStorage.getItem("sessionId");
        router.navigate({
            to: `/session/${sessionId}`
        });
    }
  });

  return (
    <div>
        THE HOME PAGE
        <Button onClick={async () => {
            const newSession = await startSession();
            localStorage.setItem("sessionId", newSession.id);
            router.navigate({
                to: `/session/${newSession.id}`
            })
        }}>Start Session</Button>
    </div>
  )
}