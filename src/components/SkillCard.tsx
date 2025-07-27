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
  Easy: "bg-green-100 text-green-700 border-green-200",
  Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Hard: "bg-red-100 text-red-700 border-red-200"
};

const difficultyEmojis = {
  Easy: "😊",
  Medium: "😎", 
  Hard: "🔥"
};

const cardColors = {
  primary: "border-purple-300 hover:shadow-[0_0_20px_hsl(270_50%_60%/0.3)] hover:border-purple-400",
  secondary: "border-pink-300 hover:shadow-[0_0_20px_hsl(330_50%_60%/0.3)] hover:border-pink-400",
  warning: "border-yellow-300 hover:shadow-[0_0_20px_hsl(45_50%_60%/0.3)] hover:border-yellow-400",
  success: "border-green-300 hover:shadow-[0_0_20px_hsl(150_50%_60%/0.3)] hover:border-green-400"
};

export function SkillCard({ skill }: SkillCardProps) {
  const navigate = useNavigate();
  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300 hover:scale-105",
      "bg-white/90 backdrop-blur-sm border-2 shadow-lg",
      cardColors[skill.color as keyof typeof cardColors] || cardColors.primary
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base font-bold text-gray-800 leading-tight">
                {skill.title}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  className={cn(
                    "text-xs font-medium border",
                    difficultyColors[skill.difficulty as keyof typeof difficultyColors]
                  )}
                >
                  <span className="mr-1">{difficultyEmojis[skill.difficulty as keyof typeof difficultyEmojis]}</span>
                  {skill.difficulty}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <CardDescription className="text-xs text-gray-600 leading-relaxed">
          {skill.description}
        </CardDescription>
        
        <Button 
          onClick={() => navigate(`/?skill=${encodeURIComponent(skill.id)}`)}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg h-10"
          size="lg"
        >
          <div className="text-base mr-2">🚀</div>
          Start Challenge
        </Button>
      </CardContent>
    </Card>
  );
}