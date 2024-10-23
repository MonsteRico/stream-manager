import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { NotFound } from './NotFound';
import { sessionQueryOptions } from '@/lib/serverFunctions';
import { Button } from './ui/button';

function OverlaysCard({sessionId}: { sessionId: string }) {
        const sessionQuery = useSuspenseQuery({
            ...sessionQueryOptions(sessionId),
        });

        if (!sessionQuery.data) {
            return <NotFound>Session not found</NotFound>;
        }

        const session = sessionQuery.data;

  return (
      <div className="container mx-auto p-4">
          <Card className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
              <CardHeader>
                  <CardTitle className="text-2xl font-bold text-center">Overlay Links</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap justify-center gap-4">
                    <Button><Link target="_blank" to={`/overlays/${sessionId}/match`}>Match</Link></Button>
                    <Button><Link target="_blank" to={`/overlays/${sessionId}/brb`}>Be Right Back</Link></Button>
                    <Button><Link target="_blank" to={`/overlays/${sessionId}/victory/team1`}>Victory {session.team1DisplayName}</Link></Button>
                    <Button><Link target="_blank" to={`/overlays/${sessionId}/victory/team2`}>Victory {session.team2DisplayName}</Link></Button>
                    <Button><Link target="_blank" to={`/overlays/${sessionId}/maps`}>Maps</Link></Button>
                    <Button><Link target="_blank" to={`/overlays/${sessionId}/startingSoon`}>Starting Soon</Link></Button>
                    <Button><Link target="_blank" to={`/overlays/${sessionId}/waitingForNext`}>Waiting For Next</Link></Button>
                    <Button><Link target="_blank" to={`/overlays/${sessionId}/thanks`}>Thanks</Link></Button>
              </CardContent>
          </Card>
      </div>
  );
}

export default OverlaysCard