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

export function QuizGame({
  skillData,
  onGameEnd,
  onBackToDashboard,
  initialTimePerQuestion,
  difficulty,
}: QuizGameProps) {
  const [currentWave, setCurrentWave] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(initialTimePerQuestion);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [shakeAnimation, setShakeAnimation] = useState(false);
  const [pulseAnimation, setPulseAnimation] = useState(false);
  const [scoreAnimation, setScoreAnimation] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  const { toast } = useToast();

  // Group and sample questions by wave (memoized)
  const { allWaves, questionsByWaveSampled } = useMemo(() => {
    const questionsByWave: Record<number, Question[]> = {};
    skillData.questions.forEach((q) => {
      if (!questionsByWave[q.wave]) questionsByWave[q.wave] = [];
      questionsByWave[q.wave].push(q);
    });
    const allWaves = Array.from(
      new Set(skillData.questions.map((q) => q.wave))
    ).sort((a, b) => a - b);
    const questionsByWaveSampled: Record<number, Question[]> = {};
    const questionsPerWave = getQuestionsPerWaveByDifficulty(difficulty);

    allWaves.forEach((wave) => {
      const questionsToSample = questionsPerWave[wave] || 0;
      questionsByWaveSampled[wave] = getRandomSample(
        questionsByWave[wave] || [],
        questionsToSample
      ).map(shuffleChoicesAndAnswer);
    });
    return { allWaves, questionsByWaveSampled };
  }, [skillData.questions, difficulty]);

  const currentWaveQuestions = questionsByWaveSampled[currentWave] || [];
  const currentQuestion = currentWaveQuestions[currentQuestionIndex];
  const waveProgress =
    ((currentQuestionIndex + 1) / currentWaveQuestions.length) * 100;

  // Timer effect
  useEffect(() => {
    if (gameOver || isAnswered) return;

    if (timeLeft <= 0) {
      handleTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, gameOver, isAnswered]);

  const handleTimeUp = () => {
    setLives((prev) => {
      const newLives = prev - 1;
      if (newLives <= 0) {
        setGameOver(true);
        onGameEnd(score, currentWave);
        return 0;
      }
      return newLives;
    });

    // Show heart loss animation
    setShowHeartAnimation(true);
    setTimeout(() => setShowHeartAnimation(false), 1000);

    toast({
      title: "⏰ Time's Up!",
      description: "You lost a life! Be faster next time! 💔",
      variant: "destructive",
      duration: 3000,
    });

    setStreak(0);
    nextQuestion();
  };

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);
    setCorrectAnswer(currentQuestion.answer);

    const isCorrect = answer === currentQuestion.answer;

    if (isCorrect) {
      // Correct answer animation
      setPulseAnimation(true);
      setTimeout(() => setPulseAnimation(false), 600);

      const timeBonus = Math.floor(timeLeft * 2);
      const streakMultiplier = Math.min(streak + 1, 5);
      const questionPoints =
        currentQuestion.points * streakMultiplier + timeBonus;

      setScore((prev) => prev + questionPoints);
      setStreak((prev) => prev + 1);

      // Score animation
      setScoreAnimation(true);
      setTimeout(() => setScoreAnimation(false), 1000);

      // Show particles for correct answer
      setShowParticles(true);
      setTimeout(() => setShowParticles(false), 1000);

      // Fun success toast
      const emojis = ["🎉", "🎊", "🔥", "⭐", "💯", "🚀"];
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

      toast({
        title: `${randomEmoji} Correct! ${randomEmoji}`,
        description: `+${questionPoints} points (${streakMultiplier}x streak!)`,
        duration: 2000,
        className:
          "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-600",
      });
    } else {
      // Wrong answer animation
      setShakeAnimation(true);
      setTimeout(() => setShakeAnimation(false), 600);

      setLives((prev) => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setGameOver(true);
          onGameEnd(score, currentWave);
          return 0;
        }
        return newLives;
      });

      // Show heart loss animation
      setShowHeartAnimation(true);
      setTimeout(() => setShowHeartAnimation(false), 1000);

      setStreak(0);

      // Fun failure toast
      const emojis = ["💔", "😅", "🤔", "😬", "💪"];
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

      toast({
        title: `${randomEmoji} Wrong Answer`,
        description: `Correct: ${currentQuestion.answer}`,
        variant: "destructive",
        duration: 3000,
        className:
          "bg-gradient-to-r from-red-500 to-pink-500 text-white border-red-600",
      });
    }

    setTimeout(() => {
      nextQuestion();
    }, 1500);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex + 1 < currentWaveQuestions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else if (currentWave < allWaves.length) {
      setCurrentWave((prev) => prev + 1);
      setCurrentQuestionIndex(0);

      // Fun wave completion toast
      toast({
        title: "🌊 Wave Complete!",
        description: "Get ready for harder questions! 💪",
        duration: 3000,
        className:
          "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-blue-600",
      });
    } else {
      setGameOver(true);
      onGameEnd(score, currentWave);
      return;
    }

    setSelectedAnswer(null);
    setIsAnswered(false);
    setCorrectAnswer(null);
    setTimeLeft(initialTimePerQuestion);
  };

  if (gameOver || !currentQuestion) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 font-cairo p-3 relative overflow-hidden">
      {/* Floating Math Symbols - Background Decorations */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Top left symbols */}
        <div
          className="absolute top-8 left-8 text-2xl opacity-20 animate-float"
          style={{ animationDelay: "0s" }}
        >
          ➗
        </div>
        <div
          className="absolute top-16 left-16 text-xl opacity-20 animate-float"
          style={{ animationDelay: "1s" }}
        >
          ×
        </div>

        {/* Top right symbols */}
        <div
          className="absolute top-12 right-12 text-xl opacity-20 animate-float"
          style={{ animationDelay: "2s" }}
        >
          π
        </div>
        <div
          className="absolute top-20 right-8 text-lg opacity-20 animate-float"
          style={{ animationDelay: "3s" }}
        >
          √
        </div>

        {/* Middle left symbols */}
        <div
          className="absolute top-1/3 left-4 text-xl opacity-20 animate-float"
          style={{ animationDelay: "0.5s" }}
        >
          +
        </div>
        <div
          className="absolute top-1/2 left-12 text-lg opacity-20 animate-float"
          style={{ animationDelay: "1.5s" }}
        >
          =
        </div>

        {/* Middle right symbols */}
        <div
          className="absolute top-1/3 right-6 text-lg opacity-20 animate-float"
          style={{ animationDelay: "2.5s" }}
        >
          %
        </div>
        <div
          className="absolute top-1/2 right-4 text-xl opacity-20 animate-float"
          style={{ animationDelay: "0.8s" }}
        >
          ∞
        </div>

        {/* Bottom left symbols */}
        <div
          className="absolute bottom-20 left-8 text-lg opacity-20 animate-float"
          style={{ animationDelay: "1.2s" }}
        >
          ∑
        </div>
        <div
          className="absolute bottom-12 left-16 text-xl opacity-20 animate-float"
          style={{ animationDelay: "2.8s" }}
        >
          ∫
        </div>

        {/* Bottom right symbols */}
        <div
          className="absolute bottom-16 right-12 text-lg opacity-20 animate-float"
          style={{ animationDelay: "0.3s" }}
        >
          ∆
        </div>
        <div
          className="absolute bottom-8 right-8 text-xl opacity-20 animate-float"
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

      <div className="max-w-md mx-auto space-y-3 relative z-10">
        {/* Back Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onBackToDashboard}
          className="mb-1 hover:scale-105 transition-transform border-2 border-purple-200 text-purple-600 hover:bg-purple-50 h-8"
        >
          ← Back
        </Button>

        {/* Game Header - Compact */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-sm px-2 py-1 border-2 border-purple-300 bg-purple-50 text-purple-700"
              >
                📈 Wave {currentWave}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "text-xl transition-all duration-300",
                    i < lives ? "text-red-500" : "text-gray-300",
                    showHeartAnimation &&
                      i === lives &&
                      "animate-bounce text-red-400 scale-125",
                    i < lives && "animate-pulse"
                  )}
                >
                  {i < lives ? "❤️" : "🖤"}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-lg p-2 border border-purple-200">
            <div className="flex items-center gap-2">
              <div className="text-lg">⚡</div>
              <span className="font-bold text-base text-yellow-600">
                {streak}x
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-lg">🏆</div>
              <span
                className={cn(
                  "font-bold text-lg text-purple-600 transition-all duration-300",
                  scoreAnimation && "scale-125 text-yellow-500"
                )}
              >
                {score.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Progress</span>
            <span>
              {currentQuestionIndex + 1} / {currentWaveQuestions.length}
            </span>
          </div>
          <Progress value={waveProgress} className="h-1.5" />
        </div>

        {/* Timer */}
        <Card
          className={cn(
            "border-2 bg-gradient-to-r from-yellow-50 to-orange-50 transition-all duration-300",
            timeLeft <= 5 ? "border-red-300 animate-pulse" : "border-yellow-300"
          )}
        >
          <CardContent className="flex items-center justify-center py-2">
            <div className="flex items-center gap-2">
              <div className="text-xl">⏱️</div>
              <span
                className={cn(
                  "text-xl font-bold transition-all duration-300",
                  timeLeft <= 5 ? "text-red-700" : "text-yellow-700"
                )}
              >
                {timeLeft}s
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card className="border-2 border-purple-300 bg-white/90 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-center font-bold text-gray-800 leading-relaxed">
              {currentQuestion.question}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-2">
            <div className="grid gap-2">
              {currentQuestion.choices.map((choice, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-12 p-3 text-sm transition-all duration-300 border-2 rounded-lg relative overflow-hidden",
                    "hover:scale-105 hover:shadow-lg",
                    // Selected but not answered
                    selectedAnswer === choice &&
                      !isAnswered &&
                      "bg-purple-500 text-white border-purple-500",
                    // Correct answer (shown after answering)
                    isAnswered &&
                      choice === currentQuestion.answer &&
                      "bg-green-500 text-white border-green-500 animate-pulse",
                    // Wrong selected answer
                    isAnswered &&
                      selectedAnswer === choice &&
                      choice !== currentQuestion.answer &&
                      "bg-red-500 text-white border-red-500 animate-shake",
                    // Default state
                    !isAnswered &&
                      !selectedAnswer &&
                      "border-gray-300 hover:border-purple-300 bg-white",
                    // Shake animation for wrong answer
                    shakeAnimation &&
                      selectedAnswer === choice &&
                      choice !== currentQuestion.answer &&
                      "animate-shake",
                    // Pulse animation for correct answer
                    pulseAnimation &&
                      choice === currentQuestion.answer &&
                      "animate-pulse"
                  )}
                  onClick={() => handleAnswerSelect(choice)}
                  disabled={isAnswered}
                >
                  {choice}
                  {/* Success checkmark for correct answer */}
                  {isAnswered && choice === currentQuestion.answer && (
                    <div className="absolute right-2 text-white text-lg">
                      ✅
                    </div>
                  )}
                  {/* X mark for wrong selected answer */}
                  {isAnswered &&
                    selectedAnswer === choice &&
                    choice !== currentQuestion.answer && (
                      <div className="absolute right-2 text-white text-lg">
                        ❌
                      </div>
                    )}
                </Button>
              ))}
            </div>

            <div className="text-center text-xs text-gray-600 bg-gray-50 rounded-lg p-1.5">
              💎 Question worth: {currentQuestion.points} points
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Particles for correct answers */}
      {showParticles && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${1 + Math.random()}s`,
              }}
            >
              {["🎉", "⭐", "💎", "🔥", "✨"][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      )}

      {/* Custom CSS for animations */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes shake {
              0%, 100% { transform: translateX(0); }
              25% { transform: translateX(-5px); }
              75% { transform: translateX(5px); }
            }
            .animate-shake {
              animation: shake 0.3s ease-in-out;
            }
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
