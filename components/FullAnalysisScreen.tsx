import React, { useState, useMemo, useEffect } from 'react';
import { Player, FullRoundHistoryEntry, Matchup } from '../types';
import HistoryLogFull from './HistoryLogFull';

interface FullAnalysisScreenProps {
  players: Player[];
  currentRound: number;
  history: FullRoundHistoryEntry[];
  onConfirmRound: (matchups: Matchup[]) => void;
  predictedOpponent: Player | null;
}

const FullAnalysisScreen: React.FC<FullAnalysisScreenProps> = ({ players, currentRound, history, onConfirmRound, predictedOpponent }) => {
  const [matchups, setMatchups] = useState<Record<number, number | null>>({});

  useEffect(() => {
    // Reset matchups when the round changes
    setMatchups({});
  }, [currentRound]);

  const pairedPlayerIds = useMemo(() => {
    const paired = new Set<number>();
    Object.values(matchups).forEach(val => {
        if(val) paired.add(val);
    });
    Object.keys(matchups).forEach(key => paired.add(Number(key)));
    return paired;
  }, [matchups]);

  const unpairedPlayers = useMemo(() => players.filter(p => !pairedPlayerIds.has(p.id)), [players, pairedPlayerIds]);
  
  const handleSelectOpponent = (player1Id: number, player2Id: number) => {
    setMatchups(prev => ({
      ...prev,
      [player1Id]: player2Id,
      [player2Id]: player1Id,
    }));
  };
  
  const canConfirm = unpairedPlayers.length === 0 && players.length > 0;

  const handleConfirm = () => {
    if (!canConfirm) return;
    
    const confirmedMatchups: Matchup[] = [];
    const processedIds = new Set<number>();

    for (const p of players) {
      if (processedIds.has(p.id)) continue;
      
      const opponentId = matchups[p.id];
      if (opponentId) {
        confirmedMatchups.push({ player1Id: p.id, player2Id: opponentId });
        processedIds.add(p.id);
        processedIds.add(opponentId);
      }
    }
    onConfirmRound(confirmedMatchups);
  };

  const handleResetMatchups = () => {
      setMatchups({});
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 shadow-2xl shadow-slate-950/50 text-center">
            <h2 className="text-3xl font-bold text-slate-200">Round {currentRound}</h2>
            <div className="mt-4 text-lg sm:text-xl flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2">
            <span className="text-cyan-400">🔮 Predicted Opponent:</span>
            <span className="font-semibold text-white bg-violet-600 px-3 py-1 rounded-md">
                {predictedOpponent ? predictedOpponent.name : 'Random / Unknown'}
            </span>
            </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 shadow-2xl shadow-slate-950/50">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <h3 className="text-2xl font-semibold text-center sm:text-left text-cyan-400">Enter Round {currentRound} Matchups</h3>
                <button 
                    onClick={handleResetMatchups}
                    className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-1 px-3 rounded-md transition-colors"
                >
                    Reset Matchups
                </button>
            </div>
            <div className="space-y-4">
                {players.map(player => {
                    const opponentId = matchups[player.id];
                    if (opponentId && player.id > opponentId) return null; // Render matchup only once

                    if (opponentId) {
                        const opponent = players.find(p => p.id === opponentId);
                        return (
                            <div key={player.id} className="flex items-center justify-center p-2 bg-slate-700/50 rounded-md">
                                <span className="font-semibold text-cyan-300">{player.name}</span>
                                <span className="mx-4 text-slate-400">vs</span>
                                <span className="font-semibold text-violet-300">{opponent?.name}</span>
                            </div>
                        )
                    }

                    if (unpairedPlayers.some(p => p.id === player.id)) {
                       const availableOpponents = unpairedPlayers.filter(p => p.id !== player.id);
                       return (
                           <div key={player.id} className="flex items-center justify-between gap-4 p-2 bg-slate-900/30 rounded-md">
                               <label htmlFor={`player-${player.id}-opponent`} className="font-semibold text-slate-300">{player.name}</label>
                               <select
                                   id={`player-${player.id}-opponent`}
                                   value=""
                                   onChange={(e) => handleSelectOpponent(player.id, Number(e.target.value))}
                                   className="bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition w-1/2"
                               >
                                   <option value="" disabled>Select opponent...</option>
                                   {availableOpponents.map(opp => (
                                       <option key={opp.id} value={opp.id}>{opp.name}</option>
                                   ))}
                               </select>
                           </div>
                       )
                    }
                    return null;
                })}
            </div>

            <div className="text-center mt-8">
                <button
                    onClick={handleConfirm}
                    disabled={!canConfirm}
                    className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg disabled:from-slate-600 disabled:to-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed disabled:scale-100"
                >
                    Confirm Round {currentRound}
                </button>
            </div>
        </div>
        {history.length > 0 && (
            <HistoryLogFull history={history} players={players} />
        )}
    </div>
  );
};

export default FullAnalysisScreen;