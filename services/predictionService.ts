import { RoundHistoryEntry } from '../types';

// Two different opponent patterns have been observed.
type Pattern = 'PATTERN_1' | 'PATTERN_2' | 'UNKNOWN';

/**
 * Gets the history entries for the current 7-round cycle, up to the previous round.
 */
function getCompletedCycleHistory(currentRound: number, history: RoundHistoryEntry[]): RoundHistoryEntry[] {
    const cycleStartRound = Math.floor((currentRound - 1) / 7) * 7 + 1;
    return history.filter(h => h.round >= cycleStartRound && h.round < currentRound);
}

/**
 * Tries to determine the active pattern based on completed rounds in the cycle.
 * The earliest we can detect the pattern is after Round 4 is complete.
 */
function detectPattern(completedCycleHistory: RoundHistoryEntry[]): Pattern {
    const findEntry = (effectiveRound: number) => 
        completedCycleHistory.find(h => ((h.round - 1) % 7) + 1 === effectiveRound);

    const r1Entry = findEntry(1);
    const r4Entry = findEntry(4);

    // Check if R4 opponent was the same as R1 opponent. This is the key differentiator.
    if (r1Entry && r4Entry) {
        if (r4Entry.myOpponentId === r1Entry.myOpponentId) {
            return 'PATTERN_1'; // Classic Pattern confirmed
        } else {
            return 'PATTERN_2'; // New Pattern confirmed
        }
    }
    
    // Not enough data to determine the pattern yet.
    return 'UNKNOWN';
}

/**
 * Prediction logic for the "Classic" pattern (Pattern 1).
 * Predicts R4 and R5.
 */
function predictWithPattern1(effectiveRound: number, completedCycleHistory: RoundHistoryEntry[]): number | null {
    const findEntry = (effRound: number) => 
        completedCycleHistory.find(h => ((h.round - 1) % 7) + 1 === effRound);

    switch (effectiveRound) {
        case 4: {
            // R4 Opponent = My R1 Opponent
            const r1Entry = findEntry(1);
            return r1Entry ? r1Entry.myOpponentId : null;
        }
        case 5: {
            // R5 Opponent = My R3 Opponent
            const r3Entry = findEntry(3);
            return r3Entry ? r3Entry.myOpponentId : null;
        }
        default:
            return null;
    }
}

/**
 * Prediction logic for the "New" pattern (Pattern 2).
 * This was the logic from the last update. Predicts R5, R6, and R7.
 */
function predictWithPattern2(effectiveRound: number, completedCycleHistory: RoundHistoryEntry[]): number | null {
    const findEntry = (effRound: number) => 
        completedCycleHistory.find(h => ((h.round - 1) % 7) + 1 === effRound);

    if (![5, 6, 7].includes(effectiveRound)) {
        return null;
    }

    const r1Entry = findEntry(1);
    if (!r1Entry) return null;

    switch (effectiveRound) {
        case 5: {
            // R5 Opponent = Opponent of (My R1 Opponent) from R4.
            const r4Entry = findEntry(4);
            if (r4Entry?.keyMatchup?.player1Id === r1Entry.myOpponentId) {
                return r4Entry.keyMatchup.player2Id;
            }
            break;
        }
        case 6: {
            // R6 Opponent = Opponent of (My R1 Opponent) from R2.
            const r2Entry = findEntry(2);
            if (r2Entry?.keyMatchup?.player1Id === r1Entry.myOpponentId) {
                return r2Entry.keyMatchup.player2Id;
            }
            break;
        }
        case 7: {
            // R7 Opponent = Opponent of (My R1 Opponent) from R3.
            const r3Entry = findEntry(3);
            if (r3Entry?.keyMatchup?.player1Id === r1Entry.myOpponentId) {
                return r3Entry.keyMatchup.player2Id;
            }
            break;
        }
    }
    return null;
}

/**
 * Main prediction function. It detects the active pattern for the current cycle
 * and uses the appropriate logic to predict the next opponent.
 */
export function predictOpponentId(currentRound: number, history: RoundHistoryEntry[]): number | null {
    const effectiveRound = ((currentRound - 1) % 7) + 1;
    const completedCycleHistory = getCompletedCycleHistory(currentRound, history);
    const pattern = detectPattern(completedCycleHistory);

    switch (pattern) {
        case 'PATTERN_1':
            return predictWithPattern1(effectiveRound, completedCycleHistory);
        case 'PATTERN_2':
            return predictWithPattern2(effectiveRound, completedCycleHistory);
        case 'UNKNOWN':
            // If the pattern is unknown, we can make a tentative prediction for Round 4,
            // as it's the first predictable round in the classic pattern. We assume
            // Pattern 1 until the result of R4 proves otherwise.
            if (effectiveRound === 4) {
                return predictWithPattern1(effectiveRound, completedCycleHistory);
            }
            // For other rounds, we cannot predict without knowing the pattern.
            return null;
    }
}