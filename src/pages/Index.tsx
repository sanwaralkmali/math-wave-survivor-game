import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { GameDashboard } from "@/components/GameDashboard";
import { QuizGame } from "@/components/QuizGame";
import { GameOver } from "@/components/GameOver";
import { useToast } from "@/hooks/use-toast";

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

type GameState = "dashboard" | "playing" | "gameover";

// Hardcoded skills list for better performance
const SKILLS: Skill[] = [
  {
    id: "integers",
    title: "Integer Operations",
    description:
      "Master addition, subtraction, multiplication, and division with integers.",
    difficulty: "Easy",
    color: "primary",
  },
  {
    id: "fractions",
    title: "Fraction Fundamentals",
    description:
      "Convert decimals to fractions and practice fraction operations.",
    difficulty: "Medium",
    color: "secondary",
  },
  {
    id: "decimals",
    title: "Decimal Operations",
    description:
      "Convert fractions to decimals and practice decimal operations.",
    difficulty: "Medium",
    color: "secondary",
  },
  {
    id: "mixed-problems",
    title: "Mixed Problems",
    description: "Solve problems that combine multiple operations.",
    difficulty: "Medium",
    color: "secondary",
  },
  {
    id: "order-of-operations",
    title: "Order of Operations",
    description: "Learn and practice the order of operations in math.",
    difficulty: "Medium",
    color: "secondary",
  },
  {
    id: "algebra-basics",
    title: "Algebra Builder",
    description: "Solve simple Algebraic questions",
    difficulty: "Medium",
    color: "secondary",
  },
  {
    id: "fraction-decimal",
    title: "Fraction to Decimal",
    description:
      "Convert fractions into their decimal equivalents and practice related problems.",
    difficulty: "Easy",
    color: "primary",
  },
  {
    id: "fraction-percentage",
    title: "Fraction to Percentage",
    description:
      "Convert fractions into percentages and solve percentage-based questions.",
    difficulty: "Easy",
    color: "primary",
  },
  {
    id: "decimal-percentage",
    title: "Decimal to Percentage",
    description:
      "Convert decimals into percentages and practice percentage calculations.",
    difficulty: "Easy",
    color: "primary",
  },
  {
    id: "mixed-conversion",
    title: "Mixed Conversion",
    description:
      "Practice converting between fractions, decimals, and percentages in a variety of problems.",
    difficulty: "Medium",
    color: "secondary",
  },
  {
    id: "basic-scientific-notation",
    title: "Basic Scientific Notation",
    description:
      "Learn the basics of scientific notation and how to express numbers in this form.",
    difficulty: "Medium",
    color: "secondary",
  },
  {
    id: "classification-numbers",
    title: "Classification of Numbers",
    description:
      "Classify numbers as natural, whole, integers, rational, or irrational.",
    difficulty: "Medium",
    color: "secondary",
  },
  {
    id: "operations-scientific-notation",
    title: "Operations with Scientific Notation",
    description:
      "Practice addition, subtraction, multiplication, and division with numbers in scientific notation.",
    difficulty: "Medium",
    color: "secondary",
  },
  {
    id: "simplify-expressions",
    title: "Simplify Expressions",
    description: "Practice evaluating, distributing, and combining like terms.",
    difficulty: "Medium",
    color: "secondary",
  },
  {
    id: "solving-equations",
    title: "Solving Equations",
    description: "Learn to solve one-step, two-step, and multi-step equations.",
    difficulty: "Medium",
    color: "secondary",
  },
  {
    id: "solving-inequalities",
    title: "Solving Inequalities",
    description: "Practice solving and graphing linear inequalities.",
    difficulty: "Medium",
    color: "secondary",
  },
  {
    id: "gcf-factoring",
    title: "GCF Factoring",
    description: "Find the greatest common factor of two or more numbers.",
    difficulty: "Medium",
    color: "secondary",
  },
  {
    id: "factoring-by-grouping",
    title: "Factoring by Grouping",
    description: "Factorize expressions by grouping terms.",
    difficulty: "Hard",
    color: "primary",
  },
  {
    id: "factoring-trinomials-1",
    title: "Factoring Trinomials (x² + bx + c)",
    description: "Factorize trinomials of the form x² + bx + c.",
    difficulty: "Medium",
    color: "secondary",
  },
  {
    id: "factoring-trinomials-2",
    title: "Factoring Trinomials (ax² + bx + c)",
    description: "Factorize trinomials of the form ax² + bx + c.",
    difficulty: "Hard",
    color: "secondary",
  },
  {
    id: "difference-squares",
    title: "Factoring Difference of Squares",
    description: "Factorize expressions of the form a² - b².",
    difficulty: "Medium",
    color: "secondary",
  },
  {
    id: "difference-sum-of-cubes",
    title: "Factoring Difference of Cubes",
    description: "Factorize expressions of the form a³ - b³ or a³ + b³",
    difficulty: "Hard",
    color: "secondary",
  },
  {
    id: "perfect-squares",
    title: "Factoring Perfect Squares",
    description:
      "Factorize expressions of the form a² + 2ab + b² or a² - 2ab + b²",
    difficulty: "Hard",
    color: "secondary",
  },
  {
    id: "solving-equations-by-factoring",
    title: "Solving Equations by Factoring",
    description: "Solve equations by factoring.",
    difficulty: "Medium",
    color: "secondary",
  },
  {
    id: "quadratic-formula",
    title: "Solving by Quadratic Formula",
    description: "Solve quadratic equations by using the quadratic formula.",
    difficulty: "Hard",
    color: "primary",
  },
  {
    id: "understanding-polynomials",
    title: "Understanding Polynomials",
    description: "Learn about polynomials and their properties.",
    difficulty: "Medium",
    color: "secondary",
  },
  {
    id: "adding-subtracting-polynomials",
    title: "Adding and Subtracting Polynomials",
    description: "Add and subtract polynomials.",
    difficulty: "Medium",
    color: "secondary",
  },
  {
    id: "multiplying-polynomials",
    title: "Multiplying Polynomials",
    description: "Multiply polynomials.",
    difficulty: "Hard",
    color: "primary",
  },
];

const Index = () => {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [skillData, setSkillData] = useState<SkillData | null>(null);
  const [gameState, setGameState] = useState<GameState>("dashboard");
  const [playerName, setPlayerName] = useState("");
  const [gameScore, setGameScore] = useState(0);
  const [gameWave, setGameWave] = useState(0);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState("standard");
  const [adjustedTime, setAdjustedTime] = useState<number | null>(null);

  const [searchParams] = useSearchParams();
  const skillParam = searchParams.get("skill");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load skill data
  useEffect(() => {
    const loadSkill = async () => {
      try {
        // If there's a skill parameter, load that skill directly
        if (skillParam) {
          const skill = SKILLS.find((s) => s.id === skillParam);

          if (skill) {
            await loadSkillData(skill);
          } else {
            // Skill not found - redirect to 404
            navigate("/404");
            return;
          }
        } else {
          // No skill parameter provided - redirect to 404
          navigate("/404");
          return;
        }
      } catch (error) {
        console.error("Failed to load skill data:", error);
        toast({
          title: "Error",
          description: "Failed to load skill data. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadSkill();
  }, [skillParam, toast]);

  const loadSkillData = async (skill: Skill) => {
    try {
      // Get the correct file name from filters.json
      const filtersResponse = await fetch("/data/filters.json");
      const filters = await filtersResponse.json();

      if (!filters[skill.id] || !filters[skill.id][0]) {
        throw new Error(`No file mapping found for skill: ${skill.id}`);
      }

      const fileName = filters[skill.id][0];
      const response = await fetch(`/data/skills/${fileName}`);
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
    setGameState("dashboard");
    setSelectedSkill(null);
    setSkillData(null);
    setPlayerName("");
    setGameScore(0);
    setGameWave(0);

    // Navigate to 404 since no skill is specified
    navigate("/404");
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
};

export default Index;
