import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SkillCard } from "@/components/SkillCard";
import { GameDashboard } from "@/components/GameDashboard";
import { QuizGame } from "@/components/QuizGame";
import { GameOver } from "@/components/GameOver";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface Skill {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  color: string;
}

interface Question {
  id: number;
  question: string;
  choices: string[];
  answer: string;
  points: number;
  wave: number;
}

interface SkillData {
  title: string;
  description: string;
  waves: number;
  timePerQuestion: number;
  questions: Question[];
}

type GameState = "home" | "dashboard" | "playing" | "gameover" | "error";

const Index = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [skillData, setSkillData] = useState<SkillData | null>(null);
  const [gameState, setGameState] = useState<GameState>("home");
  const [playerName, setPlayerName] = useState("");
  const [gameScore, setGameScore] = useState(0);
  const [gameWave, setGameWave] = useState(0);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState("standard");
  const [adjustedTime, setAdjustedTime] = useState<number | null>(null);
  const [filterSkillIds, setFilterSkillIds] = useState<string[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [searchParams] = useSearchParams();
  const skillParam = searchParams.get("skill");
  const filteredParam = searchParams.get("filtered");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load skills from JSON
  useEffect(() => {
    const loadSkills = async () => {
      try {
        const response = await fetch("/data/games.json");
        const skillsData = await response.json();
        setSkills(skillsData);

        // If there's a filter param, load filters.json and set filterSkillIds
        if (filteredParam) {
          const filterRes = await fetch("/data/filters.json");
          const filters = await filterRes.json();
          if (filters[filteredParam]) {
            setFilterSkillIds(filters[filteredParam]);
          } else {
            setFilterSkillIds([]); // No match, show nothing
          }
        } else {
          setFilterSkillIds(null); // No filter, show all
        }

        // If there's a skill parameter, load that skill directly
        if (skillParam) {
          const skill = skillsData.find((s: Skill) => s.id === skillParam);
          if (skill) {
            await loadSkillData(skill);
          } else {
            // Skill not found - show error
            setErrorMessage(`Skill "${skillParam}" does not exist.`);
            setGameState("error");
          }
        }
      } catch (error) {
        console.error("Failed to load skills:", error);
        toast({
          title: "Error",
          description: "Failed to load skills. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadSkills();
  }, [skillParam, filteredParam, toast]);

  const loadSkillData = async (skill: Skill) => {
    try {
      const response = await fetch(`/data/skills/${skill.id}.json`);
      const data = await response.json();
      setSelectedSkill(skill);
      setSkillData(data);
      setGameState("dashboard");
    } catch (error) {
      console.error("Failed to load skill data:", error);
      toast({
        title: "Error",
        description: "Failed to load skill data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStartGame = (skillId: string) => {
    const skill = skills.find((s) => s.id === skillId);
    if (skill) {
      loadSkillData(skill);
    }
  };

  const handleStartQuiz = (name: string, difficulty: string, time: number) => {
    setPlayerName(name);
    setDifficulty(difficulty);
    setAdjustedTime(time);
    setGameState("playing");
  };

  const handleBackToDashboard = () => {
    setGameState("dashboard");
    // Keep ?skill=... param in URL
  };

  const handleGameEnd = (score: number, wave: number) => {
    setGameScore(score);
    setGameWave(wave);
    setGameState("gameover");
  };

  const handlePlayAgain = () => {
    setGameState("dashboard");
    setGameScore(0);
    setGameWave(0);
  };

  const handleBackToHome = () => {
    setGameState("home");
    setSelectedSkill(null);
    setSkillData(null);
    setPlayerName("");
    setGameScore(0);
    setGameWave(0);

    // Dynamically determine filter group for the skill
    if (selectedSkill) {
      fetch("/data/filters.json")
        .then((res) => res.json())
        .then((filters) => {
          let foundFilter = null;
          for (const [filterName, skillIds] of Object.entries(filters)) {
            if (
              Array.isArray(skillIds) &&
              skillIds.includes(selectedSkill.id)
            ) {
              foundFilter = filterName;
              break;
            }
          }
          if (foundFilter) {
            navigate(`/?filtered=${encodeURIComponent(foundFilter)}`);
          } else {
            navigate("/");
          }
        })
        .catch(() => {
          navigate("/");
        });
    } else {
      navigate("/");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 font-cairo flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-600">Loading your math adventure...</p>
        </div>
      </div>
    );
  }

  // Game Over State
  if (gameState === "gameover" && selectedSkill && skillData) {
    return (
      <GameOver
        score={gameScore}
        wave={gameWave}
        maxWave={skillData.waves}
        playerName={playerName}
        skillTitle={selectedSkill.title}
        onPlayAgain={handlePlayAgain}
        onBackToHome={handleBackToHome}
      />
    );
  }

  // Playing State
  if (gameState === "playing" && skillData) {
    return (
      <QuizGame
        skillData={skillData}
        onGameEnd={handleGameEnd}
        onBackToDashboard={handleBackToDashboard}
        initialTimePerQuestion={adjustedTime ?? skillData.timePerQuestion}
        difficulty={difficulty}
      />
    );
  }

  // Dashboard State
  if (gameState === "dashboard" && selectedSkill && skillData) {
    return (
      <GameDashboard skillData={skillData} onStartGame={handleStartQuiz} />
    );
  }

  // Home State
  if (gameState === "home") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 font-cairo relative overflow-hidden">
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

        <div className="container mx-auto px-4 py-4 relative z-10">
          {/* Compact Hero Section */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="text-3xl">🧠</div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Math Quest
              </h1>
              <div className="text-3xl">⚡</div>
            </div>

            <p className="text-sm text-gray-600 max-w-xs mx-auto">
              Master math skills through epic quiz battles! 🎮
            </p>
          </div>

          {/* Compact Features */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2 text-center border border-purple-200">
              <div className="text-lg mb-1">🎯</div>
              <div className="text-xs font-semibold text-purple-600">
                Skills
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2 text-center border border-pink-200">
              <div className="text-lg mb-1">⚡</div>
              <div className="text-xs font-semibold text-pink-600">Waves</div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2 text-center border border-blue-200">
              <div className="text-lg mb-1">🏆</div>
              <div className="text-xs font-semibold text-blue-600">Score</div>
            </div>
          </div>

          {/* Skills Grid - Compact */}
          <div>
            <h2 className="text-lg font-bold text-center mb-3 text-gray-800">
              Choose Your Challenge! 🚀
            </h2>
            <div className="grid gap-3 max-w-sm mx-auto">
              {(filterSkillIds === null
                ? skills
                : skills.filter((skill) => filterSkillIds.includes(skill.id))
              ).map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          </div>

          {/* Compact Footer */}
          <div className="text-center mt-4 text-gray-600">
            <p className="text-xs">Ready to become a math champion? 💪</p>
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

  // Error State
  if (gameState === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 font-cairo flex items-center justify-center p-4">
        <Card className="w-full max-w-sm border-2 border-red-300 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6 text-center space-y-4">
            <div className="text-4xl">❌</div>
            <div>
              <h1 className="text-xl font-bold text-red-600 mb-2">
                Oops! Skill Not Found
              </h1>
              <p className="text-gray-600 text-sm">{errorMessage}</p>
            </div>
            <Button
              onClick={() => {
                setGameState("home");
                setErrorMessage("");
                navigate("/");
              }}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
};

export default Index;
