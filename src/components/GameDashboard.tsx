import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Play,
  ArrowLeft,
  Timer,
  Target,
  Zap,
  Star,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

interface Question {
  wave: number;
  // Add other properties as needed
}

interface SkillData {
  title: string;
  description: string;
  waves: number;
  timePerQuestion: number;
  questions: Question[];
}

interface GameDashboardProps {
  skillData: SkillData;
  onStartGame: (
    playerName: string,
    difficulty: string,
    timePerQuestion: number
  ) => void;
  onBack?: () => void;
}

function getRandomSample<T>(arr: T[], n: number): T[] {
  const shuffled = arr.slice().sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function getQuestionsPerWaveByDifficulty(
  difficulty: string
): Record<number, number> {
  switch (difficulty) {
    case "easy":
      return {
        1: 6,
        2: 6,
        3: 6,
        4: 2,
        5: 0,
      };
    case "hard":
      return {
        1: 2,
        2: 2,
        3: 8,
        4: 4,
        5: 4,
      };
    case "standard":
    default:
      return {
        1: 4,
        2: 4,
        3: 8,
        4: 3,
        5: 1,
      };
  }
}

// Helper function to render text with LaTeX expressions
const renderMathText = (text: string) => {
  // Split text by LaTeX delimiters
  const parts = text.split(/(\$[^$]*\$|\\\([^)]*\\\)|\\\[[^\]]*\\\])/);

  return parts.map((part, index) => {
    if (part.startsWith("$") && part.endsWith("$")) {
      // Inline math
      const math = part.slice(1, -1);
      return <InlineMath key={index} math={math} />;
    } else if (part.startsWith("\\(") && part.endsWith("\\)")) {
      // Inline math with \( \)
      const math = part.slice(2, -2);
      return <InlineMath key={index} math={math} />;
    } else if (part.startsWith("\\[") && part.endsWith("\\]")) {
      // Block math with \[ \]
      const math = part.slice(2, -2);
      return <BlockMath key={index} math={math} />;
    } else {
      // Regular text
      return <span key={index}>{part}</span>;
    }
  });
};

export function GameDashboard({
  skillData,
  onStartGame,
  onBack,
}: GameDashboardProps) {
  const [playerName, setPlayerName] = useState("");
  const [difficulty, setDifficulty] = useState("standard");

  const getAdjustedTime = () => {
    if (difficulty === "easy") return skillData.timePerQuestion * 2;
    if (difficulty === "hard")
      return Math.round(skillData.timePerQuestion * 0.75);
    return skillData.timePerQuestion;
  };

  const handleStartGame = () => {
    if (playerName.trim()) {
      onStartGame(playerName.trim(), difficulty, getAdjustedTime());
    }
  };

  // Sampled questions per wave (same logic as QuizGame)
  const { sampledQuestionsByWave, totalSampledQuestions } = useMemo(() => {
    const questionsByWave: Record<number, Question[]> = {};
    skillData.questions.forEach((q) => {
      if (!questionsByWave[q.wave]) questionsByWave[q.wave] = [];
      questionsByWave[q.wave].push(q);
    });
    const sampledQuestionsByWave: Record<number, Question[]> = {};
    let total = 0;
    const questionsPerWave = getQuestionsPerWaveByDifficulty(difficulty);

    for (let wave = 1; wave <= skillData.waves; wave++) {
      const questionsToSample = questionsPerWave[wave] || 0;
      const sampled = getRandomSample(
        questionsByWave[wave] || [],
        questionsToSample
      );
      sampledQuestionsByWave[wave] = sampled;
      total += sampled.length;
    }
    return { sampledQuestionsByWave, totalSampledQuestions: total };
  }, [skillData.questions, skillData.waves, difficulty]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 font-cairo p-4 relative overflow-hidden">
      {/* Floating Math Symbols - Background Decorations */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Top left symbols */}
        <div
          className="absolute top-12 left-12 text-2xl opacity-20 animate-float"
          style={{ animationDelay: "0s" }}
        >
          ➗
        </div>
        <div
          className="absolute top-20 left-20 text-xl opacity-20 animate-float"
          style={{ animationDelay: "1s" }}
        >
          ×
        </div>

        {/* Top right symbols */}
        <div
          className="absolute top-16 right-16 text-xl opacity-20 animate-float"
          style={{ animationDelay: "2s" }}
        >
          π
        </div>
        <div
          className="absolute top-24 right-12 text-lg opacity-20 animate-float"
          style={{ animationDelay: "3s" }}
        >
          √
        </div>

        {/* Middle left symbols */}
        <div
          className="absolute top-1/3 left-8 text-xl opacity-20 animate-float"
          style={{ animationDelay: "0.5s" }}
        >
          +
        </div>
        <div
          className="absolute top-1/2 left-16 text-lg opacity-20 animate-float"
          style={{ animationDelay: "1.5s" }}
        >
          =
        </div>

        {/* Middle right symbols */}
        <div
          className="absolute top-1/3 right-10 text-lg opacity-20 animate-float"
          style={{ animationDelay: "2.5s" }}
        >
          %
        </div>
        <div
          className="absolute top-1/2 right-8 text-xl opacity-20 animate-float"
          style={{ animationDelay: "0.8s" }}
        >
          ∞
        </div>

        {/* Bottom left symbols */}
        <div
          className="absolute bottom-24 left-12 text-lg opacity-20 animate-float"
          style={{ animationDelay: "1.2s" }}
        >
          ∑
        </div>
        <div
          className="absolute bottom-16 left-20 text-xl opacity-20 animate-float"
          style={{ animationDelay: "2.8s" }}
        >
          ∫
        </div>

        {/* Bottom right symbols */}
        <div
          className="absolute bottom-20 right-16 text-lg opacity-20 animate-float"
          style={{ animationDelay: "0.3s" }}
        >
          ∆
        </div>
        <div
          className="absolute bottom-12 right-12 text-xl opacity-20 animate-float"
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

      <div className="max-w-md mx-auto space-y-6 relative z-10">
        {/* Compact Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <div className="text-3xl">🧠</div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {skillData.title}
            </h1>
            <div className="text-3xl">⚡</div>
          </div>
        </div>

        {/* Quick Stats - Compact */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 text-center border border-purple-200">
            <div className="text-xl mb-1">📈</div>
            <div className="text-base font-bold text-purple-600">
              {skillData.waves}
            </div>
            <div className="text-xs text-gray-500">Waves</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 text-center border border-pink-200">
            <div className="text-xl mb-1">⏱️</div>
            <div className="text-base font-bold text-pink-600">
              {getAdjustedTime()}s
            </div>
            <div className="text-xs text-gray-500">Per Q</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 text-center border border-blue-200">
            <div className="text-xl mb-1">🎯</div>
            <div className="text-base font-bold text-blue-600">
              {totalSampledQuestions}
            </div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
        </div>

        {/* Game Setup - Compact */}
        <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-300 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-purple-700">
              <div className="text-xl">🎮</div>
              Ready to Play?
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Player Name */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-700">
                What's your name, champion? 🏆
              </Label>
              <Input
                placeholder="Enter your name..."
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="h-10 text-base border-2 border-purple-200 focus:border-purple-400"
                onKeyDown={(e) => e.key === "Enter" && handleStartGame()}
              />
            </div>

            {/* Difficulty - Compact */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-700">
                Choose your challenge level! 💪
              </Label>
              <RadioGroup
                value={difficulty}
                onValueChange={setDifficulty}
                className="grid grid-cols-3 gap-2"
              >
                <div className="relative">
                  <RadioGroupItem value="easy" id="easy" className="sr-only" />
                  <Label
                    htmlFor="easy"
                    className={cn(
                      "block p-2 text-center rounded-lg border-2 cursor-pointer transition-all text-xs",
                      difficulty === "easy"
                        ? "border-green-400 bg-green-50 text-green-700"
                        : "border-gray-200 bg-white text-gray-600 hover:border-green-300"
                    )}
                  >
                    <div className="text-sm mb-1">😊</div>
                    <div className="font-semibold">Easy</div>
                    <div className="text-xs opacity-75">+100% time</div>
                  </Label>
                </div>

                <div className="relative">
                  <RadioGroupItem
                    value="standard"
                    id="standard"
                    className="sr-only"
                  />
                  <Label
                    htmlFor="standard"
                    className={cn(
                      "block p-2 text-center rounded-lg border-2 cursor-pointer transition-all text-xs",
                      difficulty === "standard"
                        ? "border-blue-400 bg-blue-50 text-blue-700"
                        : "border-gray-200 bg-white text-gray-600 hover:border-blue-300"
                    )}
                  >
                    <div className="text-sm mb-1">😎</div>
                    <div className="font-semibold">Normal</div>
                    <div className="text-xs opacity-75">Standard</div>
                  </Label>
                </div>

                <div className="relative">
                  <RadioGroupItem value="hard" id="hard" className="sr-only" />
                  <Label
                    htmlFor="hard"
                    className={cn(
                      "block p-2 text-center rounded-lg border-2 cursor-pointer transition-all text-xs",
                      difficulty === "hard"
                        ? "border-red-400 bg-red-50 text-red-700"
                        : "border-gray-200 bg-white text-gray-600 hover:border-red-300"
                    )}
                  >
                    <div className="text-sm mb-1">🔥</div>
                    <div className="font-semibold">Hard</div>
                    <div className="text-xs opacity-75">-25% time</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Start Button */}
            <Button
              onClick={handleStartGame}
              disabled={!playerName.trim()}
              className="w-full h-12 text-base font-bold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
              size="lg"
            >
              <div className="text-xl mr-2">🚀</div>
              Start Adventure!
            </Button>
          </CardContent>
        </Card>

        {/* Compact Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="h-10 text-purple-600 border-2 border-purple-200 hover:bg-purple-50 font-semibold text-sm"
              >
                <div className="text-lg mr-1">📖</div>
                How to Play
              </Button>
            </DialogTrigger>
            <DialogContent className="font-cairo max-w-sm mx-4">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-center text-purple-700">
                  <div className="text-2xl mb-1">🎮</div>
                  How to Play
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg border border-green-200">
                  <div className="font-semibold text-green-700 mb-1">
                    💚 You have 3 lives
                  </div>
                  <div className="text-gray-600 space-y-1 text-xs">
                    <div>• Wrong answer = lose 1 life</div>
                    <div>• Time runs out = lose 1 life</div>
                    <div>• No lives left = game over!</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-lg border border-yellow-200">
                  <div className="font-semibold text-orange-700 mb-1">
                    ⭐ Score Points
                  </div>
                  <div className="text-gray-600 space-y-1 text-xs">
                    <div>• Correct answer = base points</div>
                    <div>• Quick answer = time bonus</div>
                    <div>• Streak = up to 5x multiplier!</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-200">
                  <div className="font-semibold text-purple-700 mb-1">
                    📈 Survive All Waves
                  </div>
                  <div className="text-gray-600 space-y-1 text-xs">
                    <div>• Each wave gets harder</div>
                    <div>• Higher waves = more points</div>
                    <div>• Survive all waves to win!</div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="h-10 text-yellow-600 border-2 border-yellow-200 hover:bg-yellow-50 font-semibold text-sm"
              >
                <div className="text-lg mr-1">🏆</div>
                Leaderboard
              </Button>
            </DialogTrigger>
            <DialogContent className="font-cairo max-w-sm mx-4">
              <DialogHeader>
                <div className="text-center">
                  <div className="text-3xl mb-1">🏆</div>
                  <DialogTitle className="text-lg font-bold text-yellow-700">
                    Leaderboard
                  </DialogTitle>
                  <DialogDescription className="text-xs text-gray-600">
                    See how you stack up against the best!
                  </DialogDescription>
                </div>
              </DialogHeader>
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 p-3">
                <div className="text-center space-y-1">
                  <div className="text-2xl">🚧</div>
                  <div className="font-semibold text-gray-700 text-sm">
                    Coming Soon!
                  </div>
                  <div className="text-xs text-gray-500">
                    Leaderboards will be available soon
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

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
