import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Brain, Play, ArrowLeft, Timer, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

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
  onStartGame: (playerName: string, difficulty: string, timePerQuestion: number) => void;
  onBack?: () => void;
}

function getRandomSample<T>(arr: T[], n: number): T[] {
  const shuffled = arr.slice().sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

export function GameDashboard({ skillData, onStartGame, onBack }: GameDashboardProps) {
  const [playerName, setPlayerName] = useState("");
  const [difficulty, setDifficulty] = useState("standard");

  const getAdjustedTime = () => {
    if (difficulty === "easy") return skillData.timePerQuestion * 2;
    if (difficulty === "hard") return Math.round(skillData.timePerQuestion * 0.75);
    return skillData.timePerQuestion;
  };

  const handleStartGame = () => {
    if (playerName.trim()) {
      // Pass difficulty and adjusted time if needed
      onStartGame(playerName.trim(), difficulty, getAdjustedTime());
    }
  };

  // Sampled questions per wave (same logic as QuizGame)
  const { sampledQuestionsByWave, totalSampledQuestions } = useMemo(() => {
    const questionsByWave: Record<number, Question[]> = {};
    skillData.questions.forEach(q => {
      if (!questionsByWave[q.wave]) questionsByWave[q.wave] = [];
      questionsByWave[q.wave].push(q);
    });
    const sampledQuestionsByWave: Record<number, Question[]> = {};
    let total = 0;
    for (let wave = 1; wave <= skillData.waves; wave++) {
      const sampled = getRandomSample(questionsByWave[wave] || [], 4);
      sampledQuestionsByWave[wave] = sampled;
      total += sampled.length;
    }
    return { sampledQuestionsByWave, totalSampledQuestions: total };
  }, [skillData.questions, skillData.waves]);

  return (
    <div className="min-h-screen bg-background font-cairo p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          {/* Removed back button */}
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-primary">
              <Brain className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{skillData.title}</h1>
              <p className="text-muted-foreground">{skillData.description}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Game Setup */}
          <Card className="border-2 border-game-primary bg-card/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <Play className="h-6 w-6 text-game-primary" />
                Game Setup
              </CardTitle>
              <CardDescription>
                Prepare for your math challenge!
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="playerName" className="text-base font-semibold">
                  Player Name
                </Label>
                <Input
                  id="playerName"
                  placeholder="Enter your name..."
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="text-lg h-12"
                  onKeyDown={(e) => e.key === 'Enter' && handleStartGame()}
                />
              </div>

              {/* Difficulty Selector */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">Difficulty Level</Label>
                <RadioGroup value={difficulty} onValueChange={setDifficulty} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="easy" id="easy" />
                    <Label htmlFor="easy" className="cursor-pointer">Easy <span className="text-xs text-muted-foreground">(+100% time)</span></Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="standard" id="standard" />
                    <Label htmlFor="standard" className="cursor-pointer">Standard <span className="text-xs text-muted-foreground">(standard time)</span></Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="hard" id="hard" />
                    <Label htmlFor="hard" className="cursor-pointer">Hard <span className="text-xs text-muted-foreground">(-25% time)</span></Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Leaderboard Button */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full font-semibold mt-2 text-lg py-3 rounded-lg shadow-sm bg-gradient-to-r from-primary/10 to-secondary/10 font-cairo">🏆 Leaderboard</Button>
                </DialogTrigger>
                <DialogContent className="font-cairo">
                  <DialogHeader>
                    <div className="flex flex-col items-center gap-2 mb-2">
                      <span className="text-5xl">🏆</span>
                      <DialogTitle className="text-2xl font-bold tracking-tight">Leaderboard</DialogTitle>
                      <DialogDescription className="text-base text-muted-foreground">See how you stack up against the best!</DialogDescription>
                    </div>
                  </DialogHeader>
                  <div className="rounded-xl border bg-card/80 p-4 shadow-md w-full max-w-md mx-auto">
                    <table className="w-full text-left font-cairo">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2 px-3 text-lg font-semibold">Rank</th>
                          <th className="py-2 px-3 text-lg font-semibold">Player</th>
                          <th className="py-2 px-3 text-lg font-semibold">Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="py-3 px-3 text-center text-xl text-muted-foreground" colSpan={3}>
                            <span className="block mb-1">Coming soon</span>
                            <span className="text-2xl">🚧</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button
                onClick={handleStartGame}
                disabled={!playerName.trim()}
                className="w-full h-14 text-lg font-bold bg-gradient-primary hover:opacity-90 transition-all duration-300 hover:shadow-glow"
                size="lg"
              >
                <Play className="mr-3 h-6 w-6" />
                Start Challenge
              </Button>
            </CardContent>
          </Card>

          {/* Game Info */}
          <Card className="border-2 border-game-secondary bg-card/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <Target className="h-6 w-6 text-game-secondary" />
                Challenge Details
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-game-warning" />
                    <span className="font-semibold">Total Waves</span>
                  </div>
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {skillData.waves}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Timer className="h-5 w-5 text-game-primary" />
                    <span className="font-semibold">Time per Question</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      {getAdjustedTime()}s
                    </Badge>
                    <span className="text-xs text-muted-foreground mt-1">
                      {difficulty === "easy" && "Easy (+100% time)"}
                      {difficulty === "standard" && "Standard (default time)"}
                      {difficulty === "hard" && "Hard (-25% time)"}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Brain className="h-5 w-5 text-game-success" />
                    <span className="font-semibold">Total Questions</span>
                  </div>
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {totalSampledQuestions}
                  </Badge>
                </div>
              </div>

              {/* Wave Breakdown */}
              <div className="space-y-3">
                <h4 className="font-semibold text-lg">Wave Breakdown:</h4>
                <div className="space-y-2">
                  {Array.from({ length: skillData.waves }, (_, i) => i + 1).map(wave => (
                    <div key={wave} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Wave {wave}</span>
                      <Badge variant="outline" className="text-xs">
                        {sampledQuestionsByWave[wave]?.length || 0} questions
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rules Card */}
        <Card className="border-2 border-game-warning bg-card/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-game-warning">
              🎮 How to Play
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Scoring System:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Base points per correct answer</li>
                  <li>• Time bonus for quick answers</li>
                  <li>• Streak multiplier (up to 5x)</li>
                  <li>• Higher waves = more points</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Lives & Rules:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Start with 3 lives ❤️</li>
                  <li>• Lose a life for wrong answers</li>
                  <li>• Lose a life if time runs out</li>
                  <li>• Game over when lives reach 0</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}