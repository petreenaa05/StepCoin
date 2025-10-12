interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  requirement: string;
  progress?: number;
  maxProgress?: number;
}

interface AchievementBadgeProps {
  achievement: Achievement;
}

export function AchievementBadge({ achievement }: AchievementBadgeProps) {
  const progressPercentage =
    achievement.progress && achievement.maxProgress
      ? (achievement.progress / achievement.maxProgress) * 100
      : 0;

  return (
    <div
      className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
        achievement.earned
          ? "bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50 shadow-lg shadow-yellow-500/25"
          : "bg-white/5 border-gray-500/30 hover:border-gray-400/50"
      }`}
    >
      {achievement.earned && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
          <span className="text-xs">✓</span>
        </div>
      )}

      <div className="text-center">
        <div
          className={`text-3xl mb-2 ${
            achievement.earned ? "grayscale-0" : "grayscale opacity-50"
          }`}
        >
          {achievement.icon}
        </div>
        <h4
          className={`font-bold mb-1 ${
            achievement.earned ? "text-yellow-300" : "text-gray-300"
          }`}
        >
          {achievement.title}
        </h4>
        <p className="text-xs text-gray-400 mb-2">{achievement.description}</p>
        <p className="text-xs text-gray-500">{achievement.requirement}</p>

        {!achievement.earned &&
          achievement.progress !== undefined &&
          achievement.maxProgress && (
            <div className="mt-3">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {achievement.progress}/{achievement.maxProgress}
              </p>
            </div>
          )}
      </div>
    </div>
  );
}

export function AchievementsGrid() {
  const achievements: Achievement[] = [
    {
      id: "1",
      title: "First Steps",
      description: "Complete your first proof",
      icon: "👶",
      earned: false,
      requirement: "Submit 1 proof",
      progress: 0,
      maxProgress: 1,
    },
    {
      id: "2",
      title: "Daily Walker",
      description: "Walk 10,000 steps in a day",
      icon: "🚶‍♀️",
      earned: false,
      requirement: "10,000 steps",
      progress: 0,
      maxProgress: 10000,
    },
    {
      id: "3",
      title: "Step Millionaire",
      description: "Reach 1 million total steps",
      icon: "💎",
      earned: false,
      requirement: "1,000,000 steps",
      progress: 0,
      maxProgress: 1000000,
    },
    {
      id: "4",
      title: "Fitness Streak",
      description: "Maintain a 7-day streak",
      icon: "🔥",
      earned: false,
      requirement: "7 consecutive days",
      progress: 0,
      maxProgress: 7,
    },
    {
      id: "5",
      title: "StepCoin Collector",
      description: "Earn 100 StepCoins",
      icon: "🪙",
      earned: false,
      requirement: "100 StepCoins",
      progress: 0,
      maxProgress: 100,
    },
    {
      id: "6",
      title: "Marathon Master",
      description: "Walk equivalent of a marathon",
      icon: "🏃‍♂️",
      earned: false,
      requirement: "26.2 miles",
      progress: 0,
      maxProgress: 26.2,
    },
  ];

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center">
        <span className="mr-2">🏆</span>
        Achievements
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {achievements.map((achievement) => (
          <AchievementBadge key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </div>
  );
}
