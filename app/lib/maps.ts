import type { MapInfo } from "@/db/schema";

export const OverwatchMaps: MapInfo[] = [
    {
        id: 1,
        name: "Watchpoint: Gibraltar",
        image: "https://oyster.ignimgs.com/mediawiki/apis.ign.com/overwatch-2/7/72/OW2_Midtown_3.jpg?width=1280",
        mode: "Escort",
        winner: null,
    },
    {
        id: 2,
        name: "Lijiang Tower",
        image: "https://miro.medium.com/v2/resize:fit:1400/1*095nn4RXH6t1PQgTJjNoPA.jpeg",
        mode: "Control",
        winner: null,
    },
    {
        id: 3,
        name: "King's Row",
        image: "https://miro.medium.com/v2/resize:fit:1400/1*095nn4RXH6t1PQgTJjNoPA.jpeg",
        mode: "Hybrid",
        winner: null,
    },
    {
        id: 4,
        name: "New Queens Street",
        image: "https://estnn.com/wp-content/uploads/2022/11/eichenwalde-screenshot-003-e1667289026109.jpg",
        mode: "Push",
        winner: null,
    },
];

export const SplatoonMaps: MapInfo[] = [
]

export const ValorantMaps: MapInfo[] = [
]

export const CSMaps: MapInfo[] = [
]
