import { createBrowserRouter } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { OverlayLayout } from "@/layouts/OverlayLayout";

// Dashboard routes
import { HomePage } from "@/routes/index";
import { SessionPage } from "@/routes/session";
import { ManageTeamsPage } from "@/routes/manage-teams";

// Overlay routes
import { MatchOverlayPage } from "@/routes/overlays/match";
import { BansOverlayPage } from "@/routes/overlays/bans";
import { MapsOverlayPage } from "@/routes/overlays/maps";
import { BrbOverlayPage } from "@/routes/overlays/brb";
import { CastersOverlayPage } from "@/routes/overlays/casters";
import { CastersSingleCameraPage } from "@/routes/overlays/castersSingleCamera";
import { SingleCameraPage } from "@/routes/overlays/singleCamera";
import { StartingSoonPage } from "@/routes/overlays/startingSoon";
import { ThanksPage } from "@/routes/overlays/thanks";
import { VictoryPage } from "@/routes/overlays/victory";
import { WaitingForNextPage } from "@/routes/overlays/waitingForNext";
import { BlankPage } from "@/routes/overlays/blank";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "session/:sessionId",
        element: <SessionPage />,
      },
      {
        path: "manage-teams",
        element: <ManageTeamsPage />,
      },
    ],
  },
  {
    path: "/overlays",
    element: <OverlayLayout />,
    children: [
      {
        path: ":sessionId/match",
        element: <MatchOverlayPage />,
      },
      {
        path: ":sessionId/bans",
        element: <BansOverlayPage />,
      },
      {
        path: ":sessionId/maps",
        element: <MapsOverlayPage />,
      },
      {
        path: ":sessionId/brb",
        element: <BrbOverlayPage />,
      },
      {
        path: ":sessionId/casters",
        element: <CastersOverlayPage />,
      },
      {
        path: ":sessionId/casters-single-camera",
        element: <CastersSingleCameraPage />,
      },
      {
        path: ":sessionId/single-camera",
        element: <SingleCameraPage />,
      },
      {
        path: ":sessionId/starting-soon",
        element: <StartingSoonPage />,
      },
      {
        path: ":sessionId/thanks",
        element: <ThanksPage />,
      },
      {
        path: ":sessionId/victory/:winner",
        element: <VictoryPage />,
      },
      {
        path: ":sessionId/waiting-for-next",
        element: <WaitingForNextPage />,
      },
      {
        path: ":sessionId/blank",
        element: <BlankPage />,
      },
    ],
  },
]);
