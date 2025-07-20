import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface SkillCardProps {
  skill: {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    color: string;
  };
}

const difficultyColors = {
  Easy: "bg-game-success text-game-success-foreground",
  Medium: "bg-game-warning text-foreground",
  Hard: "bg-game-danger text-game-danger-foreground"
};

const cardColors = {
  primary: "border-game-primary hover:shadow-[0_0_30px_hsl(var(--game-primary)/0.3)]",
  secondary: "border-game-secondary hover:shadow-[0_0_30px_hsl(var(--game-secondary)/0.3)]",
  warning: "border-game-warning hover:shadow-[0_0_30px_hsl(var(--game-warning)/0.3)]",
  success: "border-game-success hover:shadow-[0_0_30px_hsl(var(--game-success)/0.3)]"
};

export function SkillCard({ skill }: SkillCardProps) {
  const navigate = useNavigate();
  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300 hover:scale-105",
      "bg-card/90 backdrop-blur-sm border-2",
      cardColors[skill.color as keyof typeof cardColors] || cardColors.primary
    )}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <Brain className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-xl font-cairo font-bold text-foreground">
                {skill.title}
              </CardTitle>
              <Badge 
                className={cn(
                  "mt-2 font-medium",
                  difficultyColors[skill.difficulty as keyof typeof difficultyColors]
                )}
              >
                {skill.difficulty}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <CardDescription className="text-muted-foreground leading-relaxed">
          {skill.description}
        </CardDescription>
        
        <Button 
          onClick={() => navigate(`/?skill=${encodeURIComponent(skill.id)}`)}
          className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-300 group-hover:shadow-glow font-cairo font-semibold"
          size="lg"
        >
          <Play className="mr-2 h-5 w-5" />
          Start Game
        </Button>
      </CardContent>
    </Card>
  );
}