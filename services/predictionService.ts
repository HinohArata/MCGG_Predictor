import { RoundHistoryEntry } from '../types';

export function predictOpponentId(currentRound: number, history: RoundHistoryEntry[]): number | null {
  // The pattern resets every 7 rounds.
  const effectiveRound = ((currentRound - 1) % 7) + 1;
  
  // No predictions for "random" rounds or rounds that don't follow the pattern.
  if (![3, 5, 6, 7].includes(effectiveRound)) {
    return null;
  }

  const cycleStartRound = Math.floor((currentRound - 1) / 7) * 7;
  const findHistoryEntry = (round: number) => history.find(h => h.round === round);
  
  switch (effectiveRound) {
    case 3: {
      // R3 Opponent = Opponent of (My R1 Opponent) from R2.
      const r1Entry = findHistoryEntry(cycleStartRound + 1);
      const r2Entry = findHistoryEntry(cycleStartRound + 2);

      // We need the R1 entry to know who our key player is.
      // We need the R2 entry which contains the key player's matchup.
      if (r1Entry && r2Entry?.keyMatchup?.player1Id === r1Entry.myOpponentId) {
        return r2Entry.keyMatchup.player2Id;
      }
      break;
    }
    case 5: {
      // R5 Opponent = Opponent of (My R1 Opponent) from R4.
      const r1Entry = findHistoryEntry(cycleStartRound + 1);
      const r4Entry = findHistoryEntry(cycleStartRound + 4);

      if (r1Entry && r4Entry?.keyMatchup?.player1Id === r1Entry.myOpponentId) {
        return r4Entry.keyMatchup.player2Id;
      }
      break;
    }
    case 6: {
      // R6 Opponent = Opponent of (My R3 Opponent) from R5.
      const r3Entry = findHistoryEntry(cycleStartRound + 3);
      const r5Entry = findHistoryEntry(cycleStartRound + 5);

      if (r3Entry && r5Entry?.keyMatchup?.player1Id === r3Entry.myOpponentId) {
        return r5Entry.keyMatchup.player2Id;
      }
      break;
    }
    case 7: {
      // R7 Opponent = Opponent of (My R1 Opponent) from R6.
      const r1Entry = findHistoryEntry(cycleStartRound + 1);
      const r6Entry = findHistoryEntry(cycleStartRound + 6);
      
      if (r1Entry && r6Entry?.keyMatchup?.player1Id === r1Entry.myOpponentId) {
        return r6Entry.keyMatchup.player2Id;
      }
      break;
    }
  }

  return null;
}