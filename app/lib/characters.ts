export type CharacterInfo = {
    id: number;
    name: string;
    image: string;
    role: "Tank" | "Damage" | "Support";
}

export const OverwatchCharacters: CharacterInfo[] = [
    // Tank heroes
    {
        id: 1,
        name: "D.Va",
        image: "/characterImages/overwatch/dva.png",
        role: "Tank",
    },
    {
        id: 2,
        name: "Doomfist",
        image: "/characterImages/overwatch/doomfist.png",
        role: "Tank",
    },
    {
        id: 3,
        name: "Junker Queen",
        image: "/characterImages/overwatch/junker_queen.png",
        role: "Tank",
    },
    {
        id: 4,
        name: "Mauga",
        image: "/characterImages/overwatch/mauga.png",
        role: "Tank",
    },
    {
        id: 5,
        name: "Orisa",
        image: "/characterImages/overwatch/orisa.png",
        role: "Tank",
    },
    {
        id: 6,
        name: "Ramattra",
        image: "/characterImages/overwatch/ramattra.png",
        role: "Tank",
    },
    {
        id: 7,
        name: "Reinhardt",
        image: "/characterImages/overwatch/reinhardt.png",
        role: "Tank",
    },
    {
        id: 8,
        name: "Roadhog",
        image: "/characterImages/overwatch/roadhog.png",
        role: "Tank",
    },
    {
        id: 9,
        name: "Sigma",
        image: "/characterImages/overwatch/sigma.png",
        role: "Tank",
    },
    {
        id: 10,
        name: "Winston",
        image: "/characterImages/overwatch/winston.png",
        role: "Tank",
    },
    {
        id: 11,
        name: "Wrecking Ball",
        image: "/characterImages/overwatch/wrecking_ball.png",
        role: "Tank",
    },
    {
        id: 12,
        name: "Zarya",
        image: "/characterImages/overwatch/zarya.png",
        role: "Tank",
    },
    {
        id: 13,
        name: "Hazard",
        image: "/characterImages/overwatch/hazard.png",
        role: "Tank",
    },
    // Damage heroes
    {
        id: 14,
        name: "Ashe",
        image: "/characterImages/overwatch/ashe.png",
        role: "Damage",
    },
    {
        id: 15,
        name: "Bastion",
        image: "/characterImages/overwatch/bastion.png",
        role: "Damage",
    },
    {
        id: 16,
        name: "Cassidy",
        image: "/characterImages/overwatch/cassidy.png",
        role: "Damage",
    },
    {
        id: 17,
        name: "Echo",
        image: "/characterImages/overwatch/echo.png",
        role: "Damage",
    },
    {
        id: 18,
        name: "Genji",
        image: "/characterImages/overwatch/genji.png",
        role: "Damage",
    },
    {
        id: 19,
        name: "Hanzo",
        image: "/characterImages/overwatch/hanzo.png",
        role: "Damage",
    },
    {
        id: 20,
        name: "Junkrat",
        image: "/characterImages/overwatch/junkrat.png",
        role: "Damage",
    },
    {
        id: 21,
        name: "Mei",
        image: "/characterImages/overwatch/mei.png",
        role: "Damage",
    },
    {
        id: 22,
        name: "Pharah",
        image: "/characterImages/overwatch/pharah.png",
        role: "Damage",
    },
    {
        id: 23,
        name: "Reaper",
        image: "/characterImages/overwatch/reaper.png",
        role: "Damage",
    },
    {
        id: 24,
        name: "Sojourn",
        image: "/characterImages/overwatch/sojourn.png",
        role: "Damage",
    },
    {
        id: 25,
        name: "Soldier: 76",
        image: "/characterImages/overwatch/soldier_76.png",
        role: "Damage",
    },
    {
        id: 26,
        name: "Sombra",
        image: "/characterImages/overwatch/sombra.png",
        role: "Damage",
    },
    {
        id: 27,
        name: "Symmetra",
        image: "/characterImages/overwatch/symmetra.png",
        role: "Damage",
    },
    {
        id: 28,
        name: "Torbjorn",
        image: "/characterImages/overwatch/torbjorn.png",
        role: "Damage",
    },
    {
        id: 29,
        name: "Tracer",
        image: "/characterImages/overwatch/tracer.png",
        role: "Damage",
    },
    {
        id: 30,
        name: "Venture",
        image: "/characterImages/overwatch/venture.png",
        role: "Damage",
    },
    {
        id: 31,
        name: "Widowmaker",
        image: "/characterImages/overwatch/widowmaker.png",
        role: "Damage",
    },
    // Support heroes
    {
        id: 32,
        name: "Ana",
        image: "/characterImages/overwatch/ana.png",
        role: "Support",
    },
    {
        id: 33,
        name: "Baptiste",
        image: "/characterImages/overwatch/baptiste.png",
        role: "Support",
    },
    {
        id: 34,
        name: "Brigitte",
        image: "/characterImages/overwatch/brigitte.png",
        role: "Support",
    },
    {
        id: 35,
        name: "Freja",
        image: "/characterImages/overwatch/freja.png",
        role: "Support",
    },
    {
        id: 36,
        name: "Illari",
        image: "/characterImages/overwatch/illari.png",
        role: "Support",
    },
    {
        id: 37,
        name: "Juno",
        image: "/characterImages/overwatch/juno.png",
        role: "Support",
    },
    {
        id: 38,
        name: "Kiriko",
        image: "/characterImages/overwatch/kiriko.png",
        role: "Support",
    },
    {
        id: 39,
        name: "Lifeweaver",
        image: "/characterImages/overwatch/lifeweaver.png",
        role: "Support",
    },
    {
        id: 40,
        name: "Lucio",
        image: "/characterImages/overwatch/lucio.png",
        role: "Support",
    },
    {
        id: 41,
        name: "Mercy",
        image: "/characterImages/overwatch/mercy.png",
        role: "Support",
    },
    {
        id: 42,
        name: "Moira",
        image: "/characterImages/overwatch/moira.png",
        role: "Support",
    },
    {
        id: 43,
        name: "Wuyang",
        image: "/characterImages/overwatch/wuyang.png",
        role: "Support",
    },
    {
        id: 44,
        name: "Zenyatta",
        image: "/characterImages/overwatch/zenyatta.png",
        role: "Support",
    },
];

