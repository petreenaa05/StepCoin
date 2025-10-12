interface LeaderboardEntry {
  rank: number;
  address: string;
  stepCoins: number;
  totalSteps: number;
  isCurrentUser?: boolean;
}

export function Leaderboard() {
  // Mock data - replace with real data from your backend
  const leaderboardData: LeaderboardEntry[] = [
    { rank: 1, address: "0x1234...5678", stepCoins: 2500, totalSteps: 125000 },
    { rank: 2, address: "0x2345...6789", stepCoins: 2200, totalSteps: 110000 },
    { rank: 3, address: "0x3456...7890", stepCoins: 1900, totalSteps: 95000 },
    { rank: 4, address: "0x4567...8901", stepCoins: 1600, totalSteps: 80000 },
    { rank: 5, address: "0x5678...9012", stepCoins: 1300, totalSteps: 65000 },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "from-yellow-400 to-yellow-600";
      case 2:
        return "from-gray-300 to-gray-500";
      case 3:
        return "from-orange-400 to-orange-600";
      default:
        return "from-blue-400 to-blue-600";
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center">
        <span className="mr-2">🏆</span>
        Leaderboard
      </h3>

      <div className="space-y-3">
        {leaderboardData.map((entry) => (
          <div
            key={entry.rank}
            className={`p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${
              entry.isCurrentUser
                ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/50"
                : "bg-white/5 border-white/10 hover:bg-white/10"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className={`w-10 h-10 bg-gradient-to-r ${getRankColor(
                    entry.rank
                  )} rounded-full flex items-center justify-center font-bold text-white text-sm`}
                >
                  {getRankIcon(entry.rank)}
                </div>
                <div>
                  <p className="text-white font-medium">
                    {entry.address}
                    {entry.isCurrentUser && (
                      <span className="ml-2 text-xs bg-purple-500 px-2 py-1 rounded-full">
                        You
                      </span>
                    )}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {entry.totalSteps.toLocaleString()} total steps
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold">
                  {entry.stepCoins.toLocaleString()}
                </p>
                <p className="text-gray-400 text-sm">StepCoins</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
          View Full Leaderboard →
        </button>
      </div>
    </div>
  );
}
