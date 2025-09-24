import React, { useState, useCallback, useEffect } from 'react';
import { Player, RoundHistoryEntry, FullRoundHistoryEntry, Matchup } from './types';
import GameScreen from './components/GameScreen';
import SetupScreen from './components/SetupScreen';
import FullAnalysisScreen from './components/FullAnalysisScreen';
import { predictOpponentId } from './services/predictionService';

type GameMode = 'simple' | 'full';

const App: React.FC = () => {
  // Common state
  const [players, setPlayers] = useState<Player[]>([{ id: 1, name: 'You' }]);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [gameMode, setGameMode] = useState<GameMode>('simple');

  // Simple mode state
  const [simpleHistory, setSimpleHistory] = useState<RoundHistoryEntry[]>([]);
  const [predictedOpponent, setPredictedOpponent] = useState<Player | null>(null);

  // Full analysis mode state
  const [fullHistory, setFullHistory] = useState<FullRoundHistoryEntry[]>([]);
  const [isSetupComplete, setIsSetupComplete] = useState(false);


  const handleModeChange = (newMode: GameMode) => {
    if (newMode !== gameMode) {
      setGameMode(newMode);
      handleResetGame(newMode); // Reset state when switching modes
    }
  };

  // --- SIMPLE MODE LOGIC ---
  const handleNextSimpleRound = useCallback((roundData: { myOpponentName: string, keyOpponent?: { keyPlayerId: number, opponentName: string } }) => {
    const updatedPlayers = [...players];
    let nextPlayerId = players.reduce((maxId, p) => Math.max(p.id, maxId), 0) + 1;

    const getOrCreatePlayer = (name: string): Player => {
        const trimmedName = name.trim();
        const existingPlayer = updatedPlayers.find(p => p.name.toLowerCase() === trimmedName.toLowerCase());
        if (existingPlayer) return existingPlayer;
        const newPlayer = { id: nextPlayerId++, name: trimmedName };
        updatedPlayers.push(newPlayer);
        return newPlayer;
    };
    
    const myOpponent = getOrCreatePlayer(roundData.myOpponentName);
    const entry: RoundHistoryEntry = { round: currentRound, myOpponentId: myOpponent.id };

    if (roundData.keyOpponent) {
        const keyOpponentOpponent = getOrCreatePlayer(roundData.keyOpponent.opponentName);
        entry.keyMatchup = { player1Id: roundData.keyOpponent.keyPlayerId, player2Id: keyOpponentOpponent.id };
    }

    setPlayers(updatedPlayers);
    setSimpleHistory(prevHistory => [...prevHistory, entry]);
    setCurrentRound(prev => prev + 1);
  }, [players, currentRound]);

  // --- PREDICTION LOGIC (FOR BOTH MODES) ---
  useEffect(() => {
    let historyForPrediction: RoundHistoryEntry[] = [];

    if (gameMode === 'simple') {
        historyForPrediction = simpleHistory;
    } else if (gameMode === 'full' && fullHistory.length > 0) {
        // Transform full history to simple history for prediction
        historyForPrediction = fullHistory.map(fullRound => {
            const myId = 1;
            const myMatchup = fullRound.matchups.find(m => m.player1Id === myId || m.player2Id === myId);
            const myOpponentId = myMatchup ? (myMatchup.player1Id === myId ? myMatchup.player2Id : myMatchup.player1Id) : -1;

            const simpleEntry: RoundHistoryEntry = { round: fullRound.round, myOpponentId };

            const effectiveRound = ((fullRound.round - 1) % 7) + 1;
            const cycleStartRound = Math.floor((fullRound.round - 1) / 7) * 7;
            
            let keyPlayerId: number | null = null;
            
            // Determine whose matchup we need to find based on the round number
            if ([2, 4, 6].includes(effectiveRound)) { // Need R1 Opponent's matchup
                const r1Full = fullHistory.find(h => h.round === cycleStartRound + 1);
                const r1MyMatch = r1Full?.matchups.find(m => m.player1Id === myId || m.player2Id === myId);
                if (r1MyMatch) keyPlayerId = r1MyMatch.player1Id === myId ? r1MyMatch.player2Id : r1MyMatch.player1Id;
            } else if (effectiveRound === 5) { // Need R3 Opponent's matchup
                const r3Full = fullHistory.find(h => h.round === cycleStartRound + 3);
                const r3MyMatch = r3Full?.matchups.find(m => m.player1Id === myId || m.player2Id === myId);
                if (r3MyMatch) keyPlayerId = r3MyMatch.player1Id === myId ? r3MyMatch.player2Id : r3MyMatch.player1Id;
            }

            if (keyPlayerId) {
                const keyPlayerMatchup = fullRound.matchups.find(m => m.player1Id === keyPlayerId || m.player2Id === keyPlayerId);
                if (keyPlayerMatchup) {
                    const keyPlayerOpponentId = keyPlayerMatchup.player1Id === keyPlayerId ? keyPlayerMatchup.player2Id : keyPlayerMatchup.player1Id;
                    simpleEntry.keyMatchup = { player1Id: keyPlayerId, player2Id: keyPlayerOpponentId };
                }
            }
            return simpleEntry;
        });
    }

    const predictedId = predictOpponentId(currentRound, historyForPrediction);
    if (predictedId) {
        const opponent = players.find(p => p.id === predictedId);
        setPredictedOpponent(opponent || null);
    } else {
        setPredictedOpponent(null);
    }
    
  }, [currentRound, simpleHistory, fullHistory, players, gameMode]);

  // --- FULL ANALYSIS MODE LOGIC ---
  const handleStartFullGame = (playerNames: string[]) => {
    // Player 1 is always 'You'
    const newPlayers = [{ id: 1, name: 'You' }, ...playerNames.map((name, index) => ({ id: index + 2, name: name.trim() }))];
    setPlayers(newPlayers);
    setIsSetupComplete(true);
  };
  
  const handleConfirmFullRound = (matchups: Matchup[]) => {
    setFullHistory(prev => [...prev, { round: currentRound, matchups }]);
    setCurrentRound(prev => prev + 1);
  };

  // --- GENERAL LOGIC ---
  const handleResetGame = (mode: GameMode = gameMode) => {
    if (mode === 'simple') {
      setPlayers([{ id: 1, name: 'You' }]);
    } else {
      setPlayers([]);
    }
    setSimpleHistory([]);
    setFullHistory([]);
    setCurrentRound(1);
    setPredictedOpponent(null);
    setIsSetupComplete(false);
  };
  
  const TabButton: React.FC<{mode: GameMode, children: React.ReactNode}> = ({ mode, children }) => (
    <button
      onClick={() => handleModeChange(mode)}
      className={`px-4 py-2 text-sm sm:text-base font-bold rounded-t-lg transition-colors focus:outline-none ${
        gameMode === mode
          ? 'bg-slate-800 text-cyan-400 border-b-2 border-cyan-400'
          : 'bg-slate-900 text-slate-400 hover:bg-slate-800/50'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-900 font-sans p-4 sm:p-6 md:p-8">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <div className="text-center sm:text-left">
            <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">
            Magic Chess Predictor
            </h1>
            <p className="text-slate-400 mt-2">Predict your next foe or analyze the full game.</p>
        </div>
        <button 
          onClick={() => handleResetGame()}
          className="bg-red-600/80 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm flex-shrink-0"
          aria-label="Reset Game"
        >
          Reset
        </button>
      </header>
      
      <div className="flex border-b border-slate-700 mb-8">
        <TabButton mode="simple">🔮 Simple Prediction</TabButton>
        <TabButton mode="full">📊 Full Analysis</TabButton>
      </div>

      <main className="max-w-4xl mx-auto">
        {gameMode === 'simple' && (
          <GameScreen
            players={players}
            currentRound={currentRound}
            history={simpleHistory}
            predictedOpponent={predictedOpponent}
            onNextRound={handleNextSimpleRound}
          />
        )}
        {gameMode === 'full' && !isSetupComplete && (
          <SetupScreen onStartGame={handleStartFullGame} />
        )}
        {gameMode === 'full' && isSetupComplete && (
          <FullAnalysisScreen
            players={players}
            currentRound={currentRound}
            history={fullHistory}
            onConfirmRound={handleConfirmFullRound}
            predictedOpponent={predictedOpponent}
          />
        )}
      </main>
    </div>
  );
};

export default App;