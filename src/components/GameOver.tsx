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
  onBackToHome 
}: GameOverProps) {
  const getPerformanceLevel = () => {
    const completion = wave / maxWave;
    if (completion >= 1) return { level: "PERFECT!", color: "text-game-secondary", stars: 3 };
    if (completion >= 0.8) return { level: "EXCELLENT!", color: "text-game-warning", stars: 3 };
    if (completion >= 0.6) return { level: "GOOD JOB!", color: "text-game-primary", stars: 2 };
    if (completion >= 0.4) return { level: "NOT BAD!", color: "text-blue-400", stars: 2 };
    return { level: "KEEP TRYING!", color: "text-muted-foreground", stars: 1 };
  };

  const performance = getPerformanceLevel();

  return (
    <div className="min-h-screen bg-background font-cairo flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-2 border-game-primary bg-card/90 backdrop-blur-sm animate-bounce-in">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-gradient-primary">
              <Trophy className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          
          <div>
            <CardTitle className="text-4xl font-bold mb-2">
              Game Over!
            </CardTitle>
            <p className="text-xl text-muted-foreground">
              Well done, <span className="text-foreground font-semibold">{playerName}</span>!
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Performance Badge */}
          <div className="text-center">
            <div className={cn("text-2xl font-bold mb-2", performance.color)}>
              {performance.level}
            </div>
            <div className="flex justify-center gap-1 mb-4">
              {Array.from({ length: 3 }, (_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-8 w-8",
                    i < performance.stars 
                      ? "text-game-warning fill-game-warning" 
                      : "text-muted"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-6 rounded-lg bg-gradient-primary">
              <div className="text-3xl font-bold text-primary-foreground mb-1">
                {score.toLocaleString()}
              </div>
              <div className="text-primary-foreground/80 font-medium">
                Final Score
              </div>
            </div>
            
            <div className="text-center p-6 rounded-lg bg-gradient-secondary">
              <div className="text-3xl font-bold text-foreground mb-1">
                {wave}
              </div>
              <div className="text-foreground/80 font-medium">
                Waves Completed
              </div>
            </div>
            
            <div className="text-center p-6 rounded-lg bg-gradient-danger">
              <div className="text-3xl font-bold text-game-danger-foreground mb-1">
                {Math.round((wave / maxWave) * 100)}%
              </div>
              <div className="text-game-danger-foreground/80 font-medium">
                Completion
              </div>
            </div>
          </div>

          {/* Skill Info */}
          <div className="text-center">
            <Badge variant="outline" className="text-lg px-4 py-2 mb-2">
              <Target className="mr-2 h-4 w-4" />
              {skillTitle}
            </Badge>
            <p className="text-muted-foreground">
              Challenge completed with {wave} out of {maxWave} waves!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid gap-4 md:grid-cols-2">
            <Button
              onClick={onPlayAgain}
              className="h-14 text-lg font-bold bg-gradient-primary hover:opacity-90 transition-all duration-300 hover:shadow-glow"
              size="lg"
            >
              <RotateCcw className="mr-3 h-6 w-6" />
              Play Again
            </Button>
            
            <Button
              onClick={onBackToHome}
              variant="outline"
              className="h-14 text-lg font-bold hover:scale-105 transition-transform"
              size="lg"
            >
              <Home className="mr-3 h-6 w-6" />
              Back to Skills
            </Button>
          </div>

          {/* Encouragement Message */}
          <div className="text-center p-4 rounded-lg bg-muted/30">
            <p className="text-sm text-muted-foreground">
              {wave === maxWave 
                ? "🎉 Perfect! You've mastered this skill!" 
                : wave >= maxWave * 0.8
                ? "🌟 Amazing progress! You're almost there!"
                : wave >= maxWave * 0.5
                ? "📈 Good work! Keep practicing to improve!"
                : "💪 Every attempt makes you stronger! Try again!"
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}