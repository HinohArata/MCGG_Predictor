import React, { useState, useMemo, useEffect } from 'react';
import { Player, RoundHistoryEntry } from '../types';
import HistoryLog from './HistoryLog';

interface GameScreenProps {
  players: Player[];
  currentRound: number;
  history: RoundHistoryEntry[];
  predictedOpponent: Player | null;
  onNextRound: (roundData: { myOpponentName: string, keyOpponent?: { keyPlayerId: number, opponentName: string } }) => void;
}

interface PlayerInputProps {
    id: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    disabled?: boolean;
    "aria-label": string;
    excludedNames?: string[];
    availablePlayers: Player[];
}

const PlayerInput: React.FC<PlayerInputProps> = ({ 
    id, 
    value, 
    onChange, 
    placeholder, 
    disabled = false, 
    "aria-label": ariaLabel, 
    excludedNames = [], 
    availablePlayers 
}) => (
    <>
        <input
            id={id}
            list={`${id}-list`}
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            aria-label={ariaLabel}
            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <datalist id={`${id}-list`}>
            {availablePlayers
                .filter(p => !excludedNames.includes(p.name))
                .map(p => <option key={p.id} value={p.name} />)
            }
        </datalist>
    </>
);

const GameScreen: React.FC<GameScreenProps> = ({ players, currentRound, history, predictedOpponent, onNextRound }) => {
  const [myOpponentName, setMyOpponentName] = useState<string>('');
  const [keyOpponentOpponentName, setKeyOpponentOpponentName] = useState<string>('');

  const myId = 1;
  const otherPlayers = useMemo(() => players.filter(p => p.id !== myId), [players]);
  const effectiveRound = useMemo(() => ((currentRound - 1) % 7) + 1, [currentRound]);
  
  const getPlayerNameById = (id: number | null | undefined): string | null => {
      if (!id) return null;
      return players.find(p => p.id === id)?.name || null;
  }

  const keyPlayerForThisRound = useMemo(() => {
    const cycleStartRound = Math.floor((currentRound - 1) / 7) * 7;
    let keyPlayerId: number | null | undefined = null;

    // Based on the new prediction logic, we need the matchup of our R1 opponent
    // in rounds 2, 3, and 4 for future predictions (R6, R7, and R5 respectively).
    if ([2, 3, 4].includes(effectiveRound)) {
        const r1EquivalentRound = cycleStartRound + 1;
        keyPlayerId = history.find(h => h.round === r1EquivalentRound)?.myOpponentId;
    } else {
        return null;
    }

    if (!keyPlayerId) return null;
    return { id: keyPlayerId, name: getPlayerNameById(keyPlayerId) || 'Unknown Player' };

  }, [currentRound, effectiveRound, history, players]);


  useEffect(() => {
    setMyOpponentName('');
    setKeyOpponentOpponentName('');
  }, [currentRound]);
  
  const canConfirm = myOpponentName.trim() && (!keyPlayerForThisRound || keyOpponentOpponentName.trim());

  const handleConfirmRound = () => {
    if (!canConfirm) return;
    
    onNextRound({
      myOpponentName: myOpponentName.trim(),
      keyOpponent: keyPlayerForThisRound ? {
        keyPlayerId: keyPlayerForThisRound.id,
        opponentName: keyOpponentOpponentName.trim()
      } : undefined
    });
  };
  
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
        <h3 className="text-2xl font-semibold text-center text-cyan-400 mb-6">Enter Round {currentRound} Info</h3>
        
        <div className="max-w-sm mx-auto space-y-4">
            <div>
                <label htmlFor="my-opponent" className="block text-sm font-medium text-slate-400 mb-1">
                    Who is your opponent?
                </label>
                <PlayerInput
                    id="my-opponent"
                    value={myOpponentName}
                    onChange={(e) => setMyOpponentName(e.target.value)}
                    placeholder="Enter opponent's name..."
                    aria-label="Your opponent's name"
                    availablePlayers={otherPlayers}
                />
            </div>

            {keyPlayerForThisRound && (
                <div className="pt-2 animate-fade-in">
                    <label htmlFor="key-opponent" className="block text-sm font-medium text-slate-400 mb-1">
                        Who is <span className="font-bold text-cyan-300">{keyPlayerForThisRound.name}</span>'s opponent?
                    </label>
                    <PlayerInput
                        id="key-opponent"
                        value={keyOpponentOpponentName}
                        onChange={(e) => setKeyOpponentOpponentName(e.target.value)}
                        placeholder="Enter their opponent's name..."
                        aria-label={`${keyPlayerForThisRound.name}'s opponent's name`}
                        disabled={!myOpponentName.trim()}
                        excludedNames={[myOpponentName.trim(), keyPlayerForThisRound.name]}
                        availablePlayers={otherPlayers}
                    />
                    <p className="text-xs text-slate-500 mt-1">This information is needed for a future prediction.</p>
                </div>
            )}
        </div>
        
        <div className="text-center mt-8">
          <button
            onClick={handleConfirmRound}
            disabled={!canConfirm}
            className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg disabled:from-slate-600 disabled:to-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed disabled:scale-100"
          >
            Confirm & Start Next Round
          </button>
        </div>
      </div>
      
      {history.length > 0 && (
          <HistoryLog history={history} players={players} />
      )}
    </div>
  );
};

export default GameScreen;