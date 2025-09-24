export interface Player {
  id: number;
  name: string;
}

export interface RoundHistoryEntry {
  round: number;
  myOpponentId: number;
  // This will store the matchup of a key player (e.g., my R1 opponent)
  // that is needed for a future prediction.
  keyMatchup?: {
    player1Id: number; // The key player
    player2Id: number; // Their opponent
  };
}

// New types for Full Analysis Mode
export interface Matchup {
  player1Id: number;
  player2Id: number;
}

export interface FullRoundHistoryEntry {
  round: number;
  matchups: Matchup[];
}
