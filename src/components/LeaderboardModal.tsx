import React, { useState } from 'react';
import { LeaderboardEntry } from '../types/game';
import { getLeaderboard } from '../game/leaderboards';
import { X, Trophy, Medal, Award } from 'lucide-react';
import { audio } from '../audio/synthwave';

interface LeaderboardModalProps {
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onClose }) => {
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score' | 'words' | 'length'>('score');

  const entries = getLeaderboard();

  // Filter
  const filtered = entries.filter((e) => {
    if (filterDifficulty === 'all') return true;
    return e.difficulty === filterDifficulty;
  });

  // Sort
  filtered.sort((a, b) => {
    if (sortBy === 'score') return b.score - a.score;
    if (sortBy === 'words') return b.wordsSpelled - a.wordsSpelled;
    return b.length - a.length;
  });

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/85 select-none overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-yellow-500/40 rounded-2xl p-6 sm:p-8 shadow-[0_0_35px_rgba(234,179,8,0.2)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h2 className="font-pixel text-xl sm:text-2xl text-yellow-400 text-glow-amber tracking-wider">
              GLOBAL RANKINGS
            </h2>
          </div>

          <button
            onClick={() => {
              audio.playClick();
              onClose();
            }}
            aria-label="Close"
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          {/* Metric Sort Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 w-full sm:w-auto">
            <button
              onClick={() => {
                audio.playClick();
                setSortBy('score');
              }}
              className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-cyber rounded transition-colors ${
                sortBy === 'score' ? 'bg-yellow-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              High Score
            </button>
            <button
              onClick={() => {
                audio.playClick();
                setSortBy('words');
              }}
              className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-cyber rounded transition-colors ${
                sortBy === 'words' ? 'bg-yellow-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Words Spelled
            </button>
            <button
              onClick={() => {
                audio.playClick();
                setSortBy('length');
              }}
              className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-cyber rounded transition-colors ${
                sortBy === 'length' ? 'bg-yellow-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Max Length
            </button>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1.5 text-xs font-cyber">
            <span className="text-slate-400">DIFF:</span>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 font-cyber focus:outline-none focus:border-yellow-400"
            >
              <option value="all">All Modes</option>
              <option value="casual">Casual</option>
              <option value="standard">Standard</option>
              <option value="hardcore">Hardcore</option>
              <option value="chaos">Chaos</option>
            </select>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 overflow-hidden max-h-80 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-cyber text-slate-400 uppercase bg-slate-950/90 sticky top-0">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Pilot</th>
                <th className="py-2.5 px-3 text-right">Score</th>
                <th className="py-2.5 px-3 text-right">Words</th>
                <th className="py-2.5 px-3 text-right">Len</th>
                <th className="py-2.5 px-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-cyber text-xs">
              {filtered.map((item, index) => {
                const rank = index + 1;
                const isTop1 = rank === 1;
                const isTop3 = rank <= 3;

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      item.isSelf
                        ? 'bg-cyan-500/15 border-l-2 border-cyan-400 text-cyan-200'
                        : 'hover:bg-slate-900/60 text-slate-300'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-pixel text-[10px]">
                      {isTop1 ? (
                        <span className="text-yellow-400 flex items-center gap-1">
                          <Trophy className="w-3.5 h-3.5 fill-current" /> 1
                        </span>
                      ) : rank === 2 ? (
                        <span className="text-slate-300 flex items-center gap-1">
                          <Medal className="w-3.5 h-3.5 fill-current" /> 2
                        </span>
                      ) : rank === 3 ? (
                        <span className="text-amber-500 flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 fill-current" /> 3
                        </span>
                      ) : (
                        <span className="text-slate-500">{rank}</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 font-semibold flex items-center gap-2">
                      <span className="truncate max-w-[120px] sm:max-w-none">{item.playerName}</span>
                      {item.isSelf && (
                        <span className="px-1.5 py-0.2 rounded text-[8px] font-pixel bg-cyan-500 text-slate-950 font-bold">
                          YOU
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-right font-pixel text-[11px] text-cyan-400 tabular-nums">
                      {item.score.toLocaleString()}
                    </td>

                    <td className="py-2.5 px-3 text-right text-emerald-400 tabular-nums font-mono">
                      {item.wordsSpelled}
                    </td>

                    <td className="py-2.5 px-3 text-right text-pink-400 tabular-nums font-mono">
                      {item.length}
                    </td>

                    <td className="py-2.5 px-3 text-right text-slate-500 text-[11px]">
                      {item.date}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
