import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Home, RotateCcw, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameOverProps {
  score: number;
  wave: number;
  maxWave: number;
  playerName: string;
  skillTitle: string;
  onPlayAgain: () => void;
  onBackToHome: () => void;
}

export function GameOver({
  score,
  wave,
  maxWave,
  playerName,
  skillTitle,
  onPlayAgain,
  onBackToHome,
}: GameOverProps) {
  // Calculate performance based on multiple factors
  const getPerformanceLevel = () => {
    const waveCompletion = wave / maxWave;
    const scorePerWave = score / Math.max(wave, 1); // Avoid division by zero
    const completionPercentage = Math.round((wave / maxWave) * 100);

    // Calculate a performance score based on completion and score
    let performanceScore = 0;

    // Completion percentage (60% weight)
    performanceScore += waveCompletion * 60;

    // Score performance (40% weight) - assuming good score is 100+ per wave
    const scorePerformance = Math.min(scorePerWave / 100, 1);
    performanceScore += scorePerformance * 40;

    // Determine performance level based on actual performance
    if (performanceScore >= 85) {
      // Excellent performance - 3 stars
      return {
        level: "MASTER!",
        color: "text-purple-600",
        stars: 3,
        emoji: "👑",
        message: "You're a math master! Incredible performance!",
        bgColor: "from-purple-100 to-pink-100",
        borderColor: "border-purple-300",
      };
    } else if (performanceScore >= 70) {
      // Good performance - 2 stars
      return {
        level: "EXCELLENT!",
        color: "text-green-600",
        stars: 2,
        emoji: "🌟",
        message: "Excellent work! You're really getting it!",
        bgColor: "from-green-100 to-blue-100",
        borderColor: "border-green-300",
      };
    } else if (performanceScore >= 50) {
      // Decent performance - 1 star
      return {
        level: "GOOD START!",
        color: "text-blue-600",
        stars: 1,
        emoji: "👍",
        message: "Good start! Keep practicing to improve!",
        bgColor: "from-blue-100 to-cyan-100",
        borderColor: "border-blue-300",
      };
    } else if (performanceScore >= 25) {
      // Poor performance - 0 stars but encouraging
      return {
        level: "KEEP TRYING!",
        color: "text-orange-600",
        stars: 0,
        emoji: "💪",
        message: "Keep trying! Practice makes perfect!",
        bgColor: "from-orange-100 to-red-100",
        borderColor: "border-orange-300",
      };
    } else {
      // Very poor performance - 0 stars
      return {
        level: "NEEDS PRACTICE",
        color: "text-red-600",
        stars: 0,
        emoji: "📚",
        message: "This skill needs more practice. Don't give up!",
        bgColor: "from-red-100 to-pink-100",
        borderColor: "border-red-300",
      };
    }
  };

  // Calculate performance score for educational tips
  const waveCompletion = wave / maxWave;
  const scorePerWave = score / Math.max(wave, 1);
  const performanceScore =
    waveCompletion * 60 + Math.min(scorePerWave / 100, 1) * 40;

  const performance = getPerformanceLevel();

  // Calculate additional metrics
  const averageScorePerWave = Math.round(score / Math.max(wave, 1));
  const completionPercentage = Math.round((wave / maxWave) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 font-cairo flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating Math Symbols - Background Decorations */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Top left symbols */}
        <div
          className="absolute top-16 left-16 text-2xl opacity-20 animate-float"
          style={{ animationDelay: "0s" }}
        >
          ➗
        </div>
        <div
          className="absolute top-24 left-24 text-xl opacity-20 animate-float"
          style={{ animationDelay: "1s" }}
        >
          ×
        </div>

        {/* Top right symbols */}
        <div
          className="absolute top-20 right-20 text-xl opacity-20 animate-float"
          style={{ animationDelay: "2s" }}
        >
          π
        </div>
        <div
          className="absolute top-28 right-16 text-lg opacity-20 animate-float"
          style={{ animationDelay: "3s" }}
        >
          √
        </div>

        {/* Middle left symbols */}
        <div
          className="absolute top-1/3 left-12 text-xl opacity-20 animate-float"
          style={{ animationDelay: "0.5s" }}
        >
          +
        </div>
        <div
          className="absolute top-1/2 left-20 text-lg opacity-20 animate-float"
          style={{ animationDelay: "1.5s" }}
        >
          =
        </div>

        {/* Middle right symbols */}
        <div
          className="absolute top-1/3 right-14 text-lg opacity-20 animate-float"
          style={{ animationDelay: "2.5s" }}
        >
          %
        </div>
        <div
          className="absolute top-1/2 right-12 text-xl opacity-20 animate-float"
          style={{ animationDelay: "0.8s" }}
        >
          ∞
        </div>

        {/* Bottom left symbols */}
        <div
          className="absolute bottom-28 left-16 text-lg opacity-20 animate-float"
          style={{ animationDelay: "1.2s" }}
        >
          ∑
        </div>
        <div
          className="absolute bottom-20 left-24 text-xl opacity-20 animate-float"
          style={{ animationDelay: "2.8s" }}
        >
          ∫
        </div>

        {/* Bottom right symbols */}
        <div
          className="absolute bottom-24 right-20 text-lg opacity-20 animate-float"
          style={{ animationDelay: "0.3s" }}
        >
          ∆
        </div>
        <div
          className="absolute bottom-16 right-16 text-xl opacity-20 animate-float"
          style={{ animationDelay: "1.8s" }}
        >
          θ
        </div>

        {/* Fun elements scattered around */}
        <div
          className="absolute top-1/4 left-1/4 text-lg opacity-20 animate-float"
          style={{ animationDelay: "0.7s" }}
        >
          ⭐
        </div>
        <div
          className="absolute top-3/4 right-1/4 text-lg opacity-20 animate-float"
          style={{ animationDelay: "1.3s" }}
        >
          💎
        </div>
        <div
          className="absolute bottom-1/4 left-1/3 text-lg opacity-20 animate-float"
          style={{ animationDelay: "2.1s" }}
        >
          🔥
        </div>
        <div
          className="absolute top-1/2 left-1/3 text-lg opacity-20 animate-float"
          style={{ animationDelay: "0.9s" }}
        >
          ✨
        </div>
      </div>

      <Card
        className={cn(
          "w-full max-w-sm border-2 bg-white/90 backdrop-blur-sm shadow-lg relative z-10",
          performance.borderColor
        )}
      >
        <CardHeader className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="text-4xl">{performance.emoji}</div>
          </div>

          <div>
            <CardTitle className="text-xl font-bold mb-1 text-gray-800">
              Game Over!
            </CardTitle>
            <p className="text-sm text-gray-600">
              Great effort,{" "}
              <span className="text-purple-600 font-semibold">
                {playerName}
              </span>
              !
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Performance Badge */}
          <div
            className={cn(
              "text-center p-3 rounded-lg bg-gradient-to-r",
              performance.bgColor,
              performance.borderColor
            )}
          >
            <div className={cn("text-lg font-bold mb-1", performance.color)}>
              {performance.emoji} {performance.level}
            </div>
            <div className="flex justify-center gap-1 mb-2">
              {Array.from({ length: 3 }, (_, i) => (
                <div
                  key={i}
                  className={cn(
                    "text-xl transition-all duration-300",
                    i < performance.stars
                      ? "text-yellow-500 scale-110"
                      : "text-gray-300"
                  )}
                >
                  ⭐
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-700 font-medium">
              {performance.message}
            </p>
          </div>

          {/* Compact Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
              <div className="text-lg font-bold text-purple-700 mb-1">
                {score.toLocaleString()}
              </div>
              <div className="text-xs text-purple-600">Score</div>
            </div>

            <div className="text-center p-2 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200">
              <div className="text-lg font-bold text-blue-700 mb-1">{wave}</div>
              <div className="text-xs text-blue-600">Waves</div>
            </div>

            <div className="text-center p-2 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
              <div className="text-lg font-bold text-green-700 mb-1">
                {averageScorePerWave}
              </div>
              <div className="text-xs text-green-600">Avg/Wave</div>
            </div>
          </div>

          {/* Skill Info */}
          <div className="text-center">
            <Badge
              variant="outline"
              className="text-xs px-2 py-1 mb-1 border-2 border-purple-300 bg-purple-50 text-purple-700"
            >
              🎯 {skillTitle}
            </Badge>
            <p className="text-xs text-gray-600">
              {wave} out of {maxWave} waves completed
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              onClick={onPlayAgain}
              className="w-full h-10 text-sm font-bold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
            >
              <div className="text-base mr-2">🔄</div>
              Try Again
            </Button>

            <Button
              onClick={onBackToHome}
              variant="outline"
              className="w-full h-10 text-sm font-bold border-2 border-purple-200 text-purple-600 hover:bg-purple-50 hover:scale-105 transition-transform"
              size="lg"
            >
              <div className="text-base mr-2">🏠</div>
              Back to Skills
            </Button>
          </div>

          {/* Educational Feedback */}
          <div
            className={cn(
              "text-center p-2 rounded-lg bg-gradient-to-r border",
              performance.bgColor,
              performance.borderColor
            )}
          >
            <p className="text-xs text-gray-700 font-medium">
              {performanceScore >= 85
                ? "💡 Tip: Amazing! You've mastered this skill!"
                : performanceScore >= 70
                ? "💡 Tip: Great work! Focus on speed to reach mastery!"
                : performanceScore >= 50
                ? "💡 Tip: Good progress! Practice more to improve accuracy!"
                : performanceScore >= 25
                ? "💡 Tip: Keep practicing! Focus on understanding the basics!"
                : "💡 Tip: Take your time to read questions carefully!"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Custom CSS for floating animation */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
            }
            .animate-float {
              animation: float 3s ease-in-out infinite;
            }
          `,
        }}
      />
    </div>
  );
}
