import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

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

const DebugQuestions = () => {
  const [skills, setSkills] = useState<Array<{ id: string; title: string }>>(
    []
  );
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [skillData, setSkillData] = useState<SkillData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterWave, setFilterWave] = useState<string>("all");

  // Load skills
  useEffect(() => {
    const loadSkills = async () => {
      try {
        const response = await fetch("/data/games.json");
        const skillsData = await response.json();
        setSkills(skillsData);
      } catch (error) {
        console.error("Failed to load skills:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSkills();
  }, []);

  // Load skill data when selected
  useEffect(() => {
    if (selectedSkill) {
      const loadSkillData = async () => {
        try {
          const response = await fetch(`/data/skills/${selectedSkill}.json`);
          const data = await response.json();
          setSkillData(data);
        } catch (error) {
          console.error("Failed to load skill data:", error);
        }
      };

      loadSkillData();
    } else {
      setSkillData(null);
    }
  }, [selectedSkill]);

  const filteredQuestions =
    skillData?.questions.filter((q) => {
      if (filterWave === "all") return true;
      return q.wave.toString() === filterWave;
    }) || [];

  const waves = skillData
    ? Array.from(new Set(skillData.questions.map((q) => q.wave))).sort(
        (a, b) => a - b
      )
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 font-cairo flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-600">Loading debug page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 font-cairo p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            🔍 Question Debug Page
          </h1>
          <p className="text-gray-600">
            Temporary page for testing LaTeX equations
          </p>
        </div>

        {/* Controls */}
        <Card className="border-2 border-purple-300 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Select Skill:
                </label>
                <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a skill to debug" />
                  </SelectTrigger>
                  <SelectContent>
                    {skills.map((skill) => (
                      <SelectItem key={skill.id} value={skill.id}>
                        {skill.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {skillData && (
                <div className="flex-1">
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Filter by Wave:
                  </label>
                  <Select value={filterWave} onValueChange={setFilterWave}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Waves</SelectItem>
                      {waves.map((wave) => (
                        <SelectItem key={wave} value={wave.toString()}>
                          Wave {wave}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {skillData && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <div className="font-bold text-purple-600">
                    Total Questions
                  </div>
                  <div className="text-2xl font-bold">
                    {skillData.questions.length}
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <div className="font-bold text-blue-600">Waves</div>
                  <div className="text-2xl font-bold">{skillData.waves}</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <div className="font-bold text-green-600">Filtered</div>
                  <div className="text-2xl font-bold">
                    {filteredQuestions.length}
                  </div>
                </div>
                <div className="bg-orange-50 rounded-lg p-3 text-center">
                  <div className="font-bold text-orange-600">Time/Question</div>
                  <div className="text-2xl font-bold">
                    {skillData.timePerQuestion}s
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Questions List */}
        {skillData && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">
              Questions ({filteredQuestions.length} total)
            </h2>

            {filteredQuestions.map((question, index) => (
              <Card
                key={question.id}
                className="border-2 border-gray-300 bg-white/90 backdrop-blur-sm"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Wave {question.wave}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        ID: {question.id}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {question.points} pts
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">#{index + 1}</div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Question */}
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-2">
                      Question:
                    </div>
                    <div className="text-lg p-3 bg-gray-50 rounded-lg border">
                      {renderMathText(question.question)}
                    </div>
                  </div>

                  {/* Choices */}
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-2">
                      Choices:
                    </div>
                    <div className="grid gap-2">
                      {question.choices.map((choice, choiceIndex) => (
                        <div
                          key={choiceIndex}
                          className={cn(
                            "p-3 rounded-lg border-2 transition-colors",
                            choice === question.answer
                              ? "bg-green-100 border-green-300"
                              : "bg-gray-50 border-gray-200"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                              {String.fromCharCode(65 + choiceIndex)}
                            </div>
                            <div className="flex-1">
                              {renderMathText(choice)}
                            </div>
                            {choice === question.answer && (
                              <Badge className="bg-green-500 text-white text-xs">
                                ✓ Correct
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Raw Data */}
                  <details className="mt-4">
                    <summary className="text-sm font-semibold text-gray-700 cursor-pointer hover:text-gray-900">
                      Raw JSON Data
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-100 rounded-lg text-xs overflow-x-auto">
                      {JSON.stringify(question, null, 2)}
                    </pre>
                  </details>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Skill Selected */}
        {!selectedSkill && (
          <Card className="border-2 border-gray-300 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Select a Skill to Debug
              </h3>
              <p className="text-gray-600">
                Choose a skill from the dropdown above to view and test all its
                questions.
              </p>
            </CardContent>
          </Card>
        )}

        {/* No Questions */}
        {selectedSkill && skillData && filteredQuestions.length === 0 && (
          <Card className="border-2 border-gray-300 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">📭</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                No Questions Found
              </h3>
              <p className="text-gray-600">
                No questions match the current filter. Try selecting "All Waves"
                or a different wave.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DebugQuestions;
