interface Team {
    id: number;
    name: string;
    gamesPlayed: number;
    gamesWon: number;
    deleted: boolean;
}

interface Round {
    id: number;
    teams: Team[];
    deleted: boolean;
}

interface Game {
    id: number;
    created?: string;
    started?: string;
    ended?: string;
    name: string;
    teams: Team[];
    playingRounds: Round[];
    deleted: boolean;
}

