import React from 'react';
import { Player, RoundHistoryEntry } from '../types';

interface HistoryLogProps {
  history: RoundHistoryEntry[];
  players: Player[];
}

const HistoryLog: React.FC<HistoryLogProps> = ({ history, players }) => {
    const getPlayerName = (id: number) => players.find(p => p.id === id)?.name || `ID: ${id}`;

    if (history.length === 0) {
      return null;
    }

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 shadow-2xl shadow-slate-950/50">
            <h3 className="text-2xl font-semibold text-center text-cyan-400 mb-6">📜 Match History</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {[...history].reverse().map((roundEntry) => (
                    <div key={roundEntry.round} className="bg-slate-900/50 rounded-lg p-3 border border-slate-700 animate-fade-in">
                        <h4 className="font-bold text-lg text-slate-300 mb-2">Round {roundEntry.round}</h4>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between items-center">
                               <span className="text-slate-400">Your Opponent:</span>
                               <span className="font-semibold text-cyan-300 bg-slate-700 px-2 py-1 rounded">{getPlayerName(roundEntry.myOpponentId)}</span>
                            </div>
                            {roundEntry.keyMatchup && (
                                <div className="flex justify-between items-center pt-1 border-t border-slate-700/50 mt-2">
                                    <span className="text-slate-400 text-left mr-2">
                                        <span className="font-semibold text-violet-300">{getPlayerName(roundEntry.keyMatchup.player1Id)}</span>'s Opponent:
                                    </span>
                                    <span className="font-semibold text-violet-300 bg-slate-700 px-2 py-1 rounded whitespace-nowrap flex-shrink-0">{getPlayerName(roundEntry.keyMatchup.player2Id)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HistoryLog;