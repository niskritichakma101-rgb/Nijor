import React, { useState } from 'react';
import { useNews } from '../context/NewsContext';
import { BarChart2, CheckCircle2 } from 'lucide-react';

export const PollWidget: React.FC = () => {
  const { polls, votePoll } = useNews();
  const poll = polls[0]; // Active poll
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [voted, setVoted] = useState(false);

  if (!poll) return null;

  const handleVote = () => {
    if (!selectedOption) return;
    votePoll(poll.id, selectedOption);
    setVoted(true);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
        <BarChart2 className="w-5 h-5 text-emerald-700" />
        <h3 className="font-serif font-bold text-base text-slate-900">অনলাইন পোল (পাঠক মতামত)</h3>
      </div>

      <p className="font-serif font-bold text-sm text-slate-800 leading-snug">
        {poll.question}
      </p>

      <div className="space-y-2.5">
        {poll.options.map(opt => {
          const percentage = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;
          return (
            <div key={opt.id} className="space-y-1">
              {voted ? (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{opt.text}</span>
                    <span className="text-emerald-700">{percentage}% ({opt.votes} ভোট)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              ) : (
                <label className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-200 hover:bg-emerald-50/50 cursor-pointer transition text-xs font-medium text-slate-800">
                  <input 
                    type="radio" 
                    name="poll-option" 
                    value={opt.id}
                    checked={selectedOption === opt.id}
                    onChange={() => setSelectedOption(opt.id)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  {opt.text}
                </label>
              )}
            </div>
          );
        })}
      </div>

      {!voted ? (
        <button 
          onClick={handleVote}
          disabled={!selectedOption}
          className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white py-2 rounded-lg text-xs font-bold transition shadow-xs"
        >
          ভোট দিন
        </button>
      ) : (
        <div className="flex items-center justify-center gap-1.5 text-emerald-700 text-xs font-bold bg-emerald-50 py-2 rounded-lg">
          <CheckCircle2 className="w-4 h-4" /> আপনার ভোট সফলভাবে গ্রহণ করা হয়েছে! মোট ভোট: {poll.totalVotes}
        </div>
      )}
    </div>
  );
};
