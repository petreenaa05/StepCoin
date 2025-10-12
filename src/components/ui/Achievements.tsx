export function AchievementsGrid() {
  const achievements = [
    {
      id: 1,
      title: "First Steps",
      description: "Complete your first workout",
      icon: "🚶",
      completed: true,
      points: 100,
    },
    {
      id: 2,
      title: "Week Warrior",
      description: "Workout for 7 consecutive days",
      icon: "⚡",
      completed: true,
      points: 500,
    },
    {
      id: 3,
      title: "Distance Destroyer",
      description: "Walk 10,000 steps in a day",
      icon: "🏃",
      completed: false,
      points: 750,
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Achievements</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`p-4 rounded-lg border transition-all ${
              achievement.completed
                ? "bg-green-900/20 border-green-500/30"
                : "bg-gray-900/50 border-gray-700"
            }`}
          >
            <div className="flex items-center space-x-4">
              <span className="text-3xl">{achievement.icon}</span>
              <div className="flex-1">
                <h3 className="text-white font-semibold">
                  {achievement.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {achievement.description}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-pink-400 font-medium">
                    +{achievement.points} STEP
                  </span>
                  {achievement.completed && (
                    <span className="text-green-400 text-sm">✓ Completed</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
