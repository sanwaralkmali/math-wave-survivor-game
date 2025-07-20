import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SkillCard } from "@/components/SkillCard";
import { GameDashboard } from "@/components/GameDashboard";
import { QuizGame } from "@/components/QuizGame";
import { GameOver } from "@/components/GameOver";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Skill {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  color: string;
}

interface SkillData {
  title: string;
  description: string;
  waves: number;
  timePerQuestion: number;
  questions: any[];
}

type GameState = 'home' | 'dashboard' | 'playing' | 'gameover';

const Index = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [skillData, setSkillData] = useState<SkillData | null>(null);
  const [gameState, setGameState] = useState<GameState>('home');
  const [playerName, setPlayerName] = useState('');
  const [gameScore, setGameScore] = useState(0);
  const [gameWave, setGameWave] = useState(0);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState('standard');
  const [adjustedTime, setAdjustedTime] = useState<number | null>(null);
  const [filterSkillIds, setFilterSkillIds] = useState<string[] | null>(null);
  
  const [searchParams] = useSearchParams();
  const skillParam = searchParams.get('skill');
  const filteredParam = searchParams.get('filtered');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load skills from JSON
  useEffect(() => {
    const loadSkills = async () => {
      try {
        const response = await fetch('/data/games.json');
        const skillsData = await response.json();
        setSkills(skillsData);

        // If there's a filter param, load filters.json and set filterSkillIds
        if (filteredParam) {
          const filterRes = await fetch('/data/filters.json');
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
          }
        }
      } catch (error) {
        console.error('Failed to load skills:', error);
        toast({
          title: "Error",
          description: "Failed to load skills. Please refresh the page.",
          variant: "destructive"
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
      setGameState('dashboard');
    } catch (error) {
      console.error('Failed to load skill data:', error);
      toast({
        title: "Error",
        description: "Failed to load skill data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleStartGame = (skillId: string) => {
    const skill = skills.find(s => s.id === skillId);
    if (skill) {
      loadSkillData(skill);
    }
  };

  const handleStartQuiz = (name: string, difficulty: string, time: number) => {
    setPlayerName(name);
    setDifficulty(difficulty);
    setAdjustedTime(time);
    setGameState('playing');
  };

  const handleBackToDashboard = () => {
    setGameState('dashboard');
    // Keep ?skill=... param in URL
  };

  const handleGameEnd = (score: number, wave: number) => {
    setGameScore(score);
    setGameWave(wave);
    setGameState('gameover');
  };

  const handlePlayAgain = () => {
    setGameState('dashboard');
    setGameScore(0);
    setGameWave(0);
  };

  const handleBackToHome = () => {
    setGameState('home');
    setSelectedSkill(null);
    setSkillData(null);
    setPlayerName('');
    setGameScore(0);
    setGameWave(0);
    navigate('/?filtered=basic-operations');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background font-cairo flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-12 w-12 border-4 border-game-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Loading skills...</p>
        </div>
      </div>
    );
  }

  // Game Over State
  if (gameState === 'gameover' && selectedSkill && skillData) {
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
  if (gameState === 'playing' && skillData) {
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
  if (gameState === 'dashboard' && selectedSkill && skillData) {
    return (
      <GameDashboard
        skillData={skillData}
        onStartGame={handleStartQuiz}
      />
    );
  }

  // Home State
  return (
    <div className="min-h-screen bg-background font-cairo">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-primary">
              <Brain className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-5xl font-bold text-foreground">
              Math Quest
            </h1>
            <Sparkles className="h-8 w-8 text-game-warning animate-pulse" />
          </div>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Master math skills through engaging quiz gameplay. Choose your challenge and 
            survive waves of increasingly difficult questions!
          </p>
        </div>

        {/* Features */}
        <div className="grid gap-4 md:grid-cols-3 mb-12">
          <Card className="bg-gradient-to-br from-game-primary/10 to-transparent border-game-primary/20">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-game-primary mb-2">🎯</div>
              <h3 className="font-semibold mb-2">Skill-Based Learning</h3>
              <p className="text-sm text-muted-foreground">Focus on specific math topics</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-game-secondary/10 to-transparent border-game-secondary/20">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-game-secondary mb-2">⚡</div>
              <h3 className="font-semibold mb-2">Wave Survival</h3>
              <p className="text-sm text-muted-foreground">Survive increasing difficulty</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-game-warning/10 to-transparent border-game-warning/20">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-game-warning mb-2">🏆</div>
              <h3 className="font-semibold mb-2">Score & Streaks</h3>
              <p className="text-sm text-muted-foreground">Earn points and multipliers</p>
            </CardContent>
          </Card>
        </div>

        {/* Skills Grid */}
        <div>
          <h2 className="text-3xl font-bold text-center mb-8">Choose Your Challenge</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto">
            {(filterSkillIds === null
              ? skills
              : skills.filter(skill => filterSkillIds.includes(skill.id))
            ).map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-muted-foreground">
          <p>Ready to test your math skills? Pick a challenge above and start your quest!</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
