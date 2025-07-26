import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Heart, Timer, Trophy, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: number;
  wave: number;
  question: string;
  choices: string[];
  answer: string;
  points: number;
}

interface SkillData {
  title: string;
  description: string;
  waves: number;
  timePerQuestion: number;
  questions: Question[];
}

interface QuizGameProps {
  skillData: SkillData;
  onGameEnd: (score: number, wave: number) => void;
  onBackToDashboard: () => void;
  initialTimePerQuestion: number;
  difficulty: string;
}

function getRandomSample<T>(arr: T[], n: number): T[] {
  const shuffled = arr.slice().sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function shuffleChoicesAndAnswer(question: Question): Question {
  const choices = question.choices.slice();
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  return {
    ...question,
    choices,
    answer: choices.includes(question.answer) ? question.answer : choices[0],
  };
}

function getQuestionsPerWaveByDifficulty(difficulty: string): Record<number, number> {
  switch (difficulty) {
    case 'easy':
      return {
        1: 6,
        2: 6,
        3: 6,
        4: 2,
        5: 0
      };
    case 'hard':
      return {
        1: 2,
        2: 2,
        3: 8,
        4: 4,
        5: 4
      };
    case 'standard':
    default:
      return {
        1: 4,
        2: 4,
        3: 8,
        4: 3,
        5: 1
      };
  }
}

export function QuizGame({ skillData, onGameEnd, onBackToDashboard, initialTimePerQuestion, difficulty }: QuizGameProps) {
  const [currentWave, setCurrentWave] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(initialTimePerQuestion);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  
  const { toast } = useToast();
  
  // Group and sample questions by wave (memoized)
  const { allWaves, questionsByWaveSampled } = useMemo(() => {
    const questionsByWave: Record<number, Question[]> = {};
    skillData.questions.forEach(q => {
      if (!questionsByWave[q.wave]) questionsByWave[q.wave] = [];
      questionsByWave[q.wave].push(q);
    });
    const allWaves = Array.from(new Set(skillData.questions.map(q => q.wave))).sort((a, b) => a - b);
    const questionsByWaveSampled: Record<number, Question[]> = {};
    const questionsPerWave = getQuestionsPerWaveByDifficulty(difficulty);
    
    allWaves.forEach(wave => {
      const questionsToSample = questionsPerWave[wave] || 0;
      questionsByWaveSampled[wave] = getRandomSample(questionsByWave[wave] || [], questionsToSample).map(shuffleChoicesAndAnswer);
    });
    return { allWaves, questionsByWaveSampled };
  }, [skillData.questions, difficulty]);

  // Use sampled questions for the game
  const currentWaveQuestions = questionsByWaveSampled[currentWave] || [];
  const currentQuestion = currentWaveQuestions[currentQuestionIndex];
  const waveProgress = ((currentQuestionIndex + 1) / currentWaveQuestions.length) * 100;

  // Timer effect
  useEffect(() => {
    if (gameOver || isAnswered) return;
    
    if (timeLeft <= 0) {
      handleTimeUp();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, gameOver, isAnswered]);

  const handleTimeUp = () => {
    setLives(prev => {
      const newLives = prev - 1;
      if (newLives <= 0) {
        setGameOver(true);
        onGameEnd(score, currentWave);
      }
      return newLives;
    });
    
    toast({
      title: "Time's Up!",
      description: "You lost a life. Be faster next time!",
      variant: "destructive"
    });
    
    setStreak(0);
    nextQuestion();
  };

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answer);
    setIsAnswered(true);
    
    const isCorrect = answer === currentQuestion.answer;
    
    if (isCorrect) {
      const timeBonus = Math.floor(timeLeft * 2);
      const streakMultiplier = Math.min(streak + 1, 5);
      const questionPoints = currentQuestion.points * streakMultiplier + timeBonus;
      
      setScore(prev => prev + questionPoints);
      setStreak(prev => prev + 1);
      
      toast({
        title: "Correct! 🎉",
        description: `+${questionPoints} points (${streakMultiplier}x streak bonus)`,
      });
    } else {
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setGameOver(true);
          onGameEnd(score, currentWave);
        }
        return newLives;
      });
      
      setStreak(0);
      
      toast({
        title: "Wrong Answer",
        description: `The correct answer was: ${currentQuestion.answer}`,
        variant: "destructive"
      });
    }
    
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex + 1 < currentWaveQuestions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (currentWave < allWaves.length) {
      setCurrentWave(prev => prev + 1);
      setCurrentQuestionIndex(0);
      toast({
        title: `Wave ${allWaves[currentWave] || currentWave + 1}!`,
        description: "Get ready for harder questions!",
      });
    } else {
      setGameOver(true);
      onGameEnd(score, currentWave);
      return;
    }
    
    setSelectedAnswer(null);
    setIsAnswered(false);
    setTimeLeft(initialTimePerQuestion);
  };

  if (gameOver || !currentQuestion) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background font-cairo p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="outline"
          size="lg"
          onClick={onBackToDashboard}
          className="mb-2 hover:scale-105 transition-transform"
        >
          Back to Dashboard
        </Button>
        {/* Game Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-lg px-4 py-2">
              Wave {currentWave}
            </Badge>
            <div className="flex items-center gap-2">
              {[...Array(3)].map((_, i) => (
                <Heart
                  key={i}
                  className={cn(
                    "h-6 w-6",
                    i < lives ? "text-game-danger fill-game-danger" : "text-muted"
                  )}
                />
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-game-warning" />
              <span className="font-bold text-lg">{streak}x</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-game-secondary" />
              <span className="font-bold text-xl">{score.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Wave Progress</span>
            <span>{currentQuestionIndex + 1} / {currentWaveQuestions.length}</span>
          </div>
          <Progress value={waveProgress} className="h-3" />
        </div>

        {/* Timer */}
        <Card className="border-game-warning bg-gradient-to-r from-game-warning/10 to-transparent">
          <CardContent className="flex items-center justify-center py-4">
            <div className="flex items-center gap-3">
              <Timer className="h-6 w-6 text-game-warning" />
              <span className="text-2xl font-bold text-game-warning">
                {timeLeft}s
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card className="border-2 border-game-primary bg-card/90 backdrop-blur-sm animate-bounce-in">
          <CardHeader>
            <CardTitle className="text-2xl text-center font-bold">
              {currentQuestion.question}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              {currentQuestion.choices.map((choice, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="lg"
                  className={cn(
                    "h-auto p-4 text-lg transition-all duration-300",
                    "hover:scale-105 hover:shadow-card",
                    selectedAnswer === choice && !isAnswered && "bg-game-primary text-primary-foreground",
                    isAnswered && choice === currentQuestion.answer && "bg-game-success text-game-success-foreground",
                    isAnswered && selectedAnswer === choice && choice !== currentQuestion.answer && "bg-game-danger text-game-danger-foreground"
                  )}
                  onClick={() => handleAnswerSelect(choice)}
                  disabled={isAnswered}
                >
                  {choice}
                </Button>
              ))}
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              Question worth: {currentQuestion.points} points
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}