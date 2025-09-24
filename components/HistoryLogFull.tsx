import React from 'react';
import { Player, FullRoundHistoryEntry } from '../types';

interface HistoryLogFullProps {
  history: FullRoundHistoryEntry[];
  players: Player[];
}

const HistoryLogFull: React.FC<HistoryLogFullProps> = ({ history, players }) => {
    const getPlayerName = (id: number) => players.find(p => p.id === id)?.name || `ID: ${id}`;

    const handleExport = () => {
        let csvContent = "data:text/csv;charset=utf-s8,";
        csvContent += "Round,Player 1,Player 2\n";

        history.forEach(roundEntry => {
            roundEntry.matchups.forEach(match => {
                const player1Name = getPlayerName(match.player1Id).replace(/,/g, ''); // Basic sanitization for names with commas
                const player2Name = getPlayerName(match.player2Id).replace(/,/g, '');
                csvContent += `${roundEntry.round},${player1Name},${player2Name}\n`;
            });
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "magic_chess_history.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (history.length === 0) {
      return null;
    }

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 shadow-2xl shadow-slate-950/50">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <h3 className="text-2xl font-semibold text-center sm:text-left text-cyan-400">📜 Full Match History</h3>
                <button
                    onClick={handleExport}
                    className="text-xs bg-cyan-600/50 hover:bg-cyan-500/50 text-cyan-200 font-bold py-1 px-3 rounded-md transition-colors"
                >
                    Export to CSV
                </button>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {[...history].reverse().map((roundEntry) => (
                    <div key={roundEntry.round} className="bg-slate-900/50 rounded-lg p-3 border border-slate-700 animate-fade-in">
                        <h4 className="font-bold text-lg text-slate-300 mb-2">Round {roundEntry.round}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                            {roundEntry.matchups.map((match, index) => (
                                <div key={index} className="flex justify-between items-center p-1 rounded">
                                    <span className="text-cyan-300">{getPlayerName(match.player1Id)}</span>
                                    <span className="text-slate-500 text-xs mx-2">vs</span>
                                    <span className="text-violet-300">{getPlayerName(match.player2Id)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HistoryLogFull;