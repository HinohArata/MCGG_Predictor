import React, { useState } from 'react';

interface SetupScreenProps {
  onStartGame: (playerNames: string[]) => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStartGame }) => {
  const [otherPlayerNames, setOtherPlayerNames] = useState<string[]>(Array(7).fill(''));

  const handleNameChange = (index: number, name: string) => {
    const newNames = [...otherPlayerNames];
    newNames[index] = name;
    setOtherPlayerNames(newNames);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedNames = otherPlayerNames.map(name => name.trim());
    if (trimmedNames.some(name => name === '')) {
        alert("Please enter a name for all 7 other players.");
        return;
    }
    onStartGame(trimmedNames);
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 sm:p-8 shadow-2xl shadow-slate-950/50 animate-fade-in">
      <h2 className="text-2xl font-semibold text-center text-cyan-400 mb-6">Enter All Player Names</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="player-0" className="block text-sm font-medium text-slate-400 mb-1">
              Player 1
            </label>
            <input
              id="player-0"
              type="text"
              value="You"
              disabled
              className="w-full bg-slate-700/50 border border-slate-600 rounded-md px-3 py-2 text-slate-200 placeholder-slate-500 cursor-not-allowed"
            />
          </div>
          {otherPlayerNames.map((name, index) => (
            <div key={index}>
              <label htmlFor={`player-${index + 1}`} className="block text-sm font-medium text-slate-400 mb-1">
                Player {index + 2}
              </label>
              <input
                id={`player-${index + 1}`}
                type="text"
                value={name}
                onChange={(e) => handleNameChange(index, e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                placeholder={`Player ${index + 2}`}
                required
              />
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <button
            type="submit"
            className="bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-bold py-3 px-8 rounded-lg hover:from-cyan-600 hover:to-violet-700 transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-cyan-500/50"
          >
            Start Analysis
          </button>
        </div>
      </form>
    </div>
  );
};

export default SetupScreen;