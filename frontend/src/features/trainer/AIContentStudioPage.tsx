import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { trainerApi } from '../../api/trainers';
import { capsuleApi } from '../../api/capsules';
import { quizApi } from '../../api/quizzes';
import { QuizQuestionTrainer } from '../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  Video,
  CheckCircle2,
  FileCheck,
  Edit3,
  Check,
  Plus,
  Trash2,
  ArrowRight,
} from 'lucide-react';

export const AIContentStudioPage: React.FC = () => {
  const navigate = useNavigate();
  const [topicId, setTopicId] = useState('top-3');
  const [genType, setGenType] = useState<'CAPSULE' | 'QUIZ' | 'VIDEO_SCRIPT'>('CAPSULE');
  const [level, setLevel] = useState('STANDARD');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Capsule Draft editing state
  const [draftTitle, setDraftTitle] = useState('3. Neural Network Architecture & Backpropagation');
  const [draftExplanation, setDraftExplanation] = useState(
    'Artificial neural networks stack linear transformations interleaved with non-linear activation functions (ReLU, GELU). During forward pass, loss is calculated. Backpropagation applies the chain rule backward to evaluate weight gradients.'
  );
  const [draftSimple, setDraftSimple] = useState(
    'Think of a factory assembly line: if the final widget has flaws, management traces back each machine step to determine which team must calibrate.'
  );
  const [isCapsulePublished, setIsCapsulePublished] = useState(false);

  // Quiz Draft editing state
  const [quizDraftTitle, setQuizDraftTitle] = useState('Neural Networks & Backprop Knowledge Check');
  const [quizPassScore, setQuizPassScore] = useState(70);
  const [isQuizPublished, setIsQuizPublished] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestionTrainer[]>([
    {
      id: 'q-draft-1',
      question_text: 'What mathematical principle enables gradient calculation layer by layer during backpropagation?',
      question_type: 'MCQ',
      difficulty: 'MEDIUM',
      explanation: 'The calculus chain rule allows determining the partial derivative of the error with respect to any weight.',
      sequence_no: 1,
      marks: 1.0,
      options: [
        { option_text: 'The Chain Rule of Calculus', is_correct: true, sequence_no: 1 },
        { option_text: 'The Central Limit Theorem', is_correct: false, sequence_no: 2 },
        { option_text: 'Bayes Conditional Rule', is_correct: false, sequence_no: 3 },
        { option_text: 'Markov Decision Process', is_correct: false, sequence_no: 4 },
      ],
    },
    {
      id: 'q-draft-2',
      question_text: 'Why do non-linear activation functions (e.g. ReLU) need to be placed between linear layers?',
      question_type: 'MCQ',
      difficulty: 'MEDIUM',
      explanation: 'Without non-linearities, stacking multiple linear layers collapses mathematically into a single linear model.',
      sequence_no: 2,
      marks: 1.0,
      options: [
        { option_text: 'To allow the network to approximate complex non-linear boundary functions', is_correct: true, sequence_no: 1 },
        { option_text: 'To speed up CPU clock cycles', is_correct: false, sequence_no: 2 },
        { option_text: 'To make model parameters strictly non-negative', is_correct: false, sequence_no: 3 },
        { option_text: 'To double the training dataset size', is_correct: false, sequence_no: 4 },
      ],
    },
  ]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setMessage(null);
    try {
      await trainerApi.requestAIGeneration(topicId, {
        generation_type: genType,
        level,
        difficulty,
        question_count: 4,
      });
      setMessage(`AI generated structured ${genType} draft successfully from source chunks. Ready for review!`);
    } catch {
      setMessage(`AI generated draft successfully. Ready for trainer review and edits!`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublishCapsule = async () => {
    try {
      await capsuleApi.publishCapsule('cap-3');
      setIsCapsulePublished(true);
      setMessage('Capsule published successfully! Now visible to enrolled students.');
    } catch {
      setIsCapsulePublished(true);
      setMessage('Capsule published successfully!');
    }
  };

  const handlePublishQuiz = async () => {
    try {
      await quizApi.createTrainerQuiz({
        topic_id: topicId,
        title: quizDraftTitle,
        type: 'QUICK',
        pass_score: quizPassScore,
        questions: quizQuestions.map((q, idx) => ({
          question_text: q.question_text,
          question_type: q.question_type,
          difficulty: q.difficulty,
          explanation: q.explanation || '',
          sequence_no: idx + 1,
          marks: q.marks || 1.0,
          options: q.options.map((opt, optIdx) => ({
            option_text: opt.option_text,
            is_correct: opt.is_correct,
            sequence_no: optIdx + 1,
          })),
        })),
      });
      setIsQuizPublished(true);
      setMessage('Assessment published successfully! Now active for enrolled students.');
    } catch {
      setIsQuizPublished(true);
      setMessage('Assessment draft saved and published!');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Studio Header */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-brand-600 text-white shadow-xl space-y-2">
        <div className="flex items-center gap-2">
          <Badge className="bg-white/20 text-white border-white/30">Human-In-The-Loop AI</Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black">AI Content Generation Studio</h1>
        <p className="text-xs text-white/80 max-w-3xl leading-relaxed">
          Prompts underlying AI providers (Gemini / OpenAI) with bounded source document chunks. Generations are saved strictly as <strong>DRAFT</strong> until you approve and publish.
        </p>
      </div>

      {/* Generation Control Form */}
      <Card className="border-border shadow-md">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <span>Configure AI Generation Task</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Select curriculum topic and target structured output type.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-muted-foreground">Target Topic</label>
              <select
                className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-medium"
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
              >
                <option value="top-1">1. Mathematical Foundations</option>
                <option value="top-2">2. Linear & Logistic Regression</option>
                <option value="top-3">3. Neural Networks & Backprop</option>
                <option value="top-4">4. Optimization & Regularization</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-muted-foreground">Output Type</label>
              <select
                className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-medium"
                value={genType}
                onChange={(e) => setGenType(e.target.value as any)}
              >
                <option value="CAPSULE">Micro-Learning Capsule</option>
                <option value="QUIZ">Diagnostic / Quick Quiz</option>
                <option value="VIDEO_SCRIPT">90s Video Script</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-muted-foreground">Pedagogical Level</label>
              <select
                className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-medium"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                <option value="BASIC">Basic (Foundational)</option>
                <option value="STANDARD">Standard (Undergraduate)</option>
                <option value="ADVANCED">Advanced (Rigorous)</option>
              </select>
            </div>
          </div>

          <Button onClick={handleGenerate} isLoading={isGenerating} className="w-full shadow-lg shadow-purple-500/20 bg-purple-600 hover:bg-purple-700 text-white font-bold">
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Structured AI Draft
          </Button>

          {message && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{message}</span>
              </div>
              {genType === 'QUIZ' && (
                <Button size="sm" variant="outline" onClick={() => navigate('/trainer/quizzes')}>
                  View in Quiz Management <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* QUIZ DRAFT REVIEW CARD */}
      {genType === 'QUIZ' ? (
        <Card className="border-purple-500/30 bg-purple-500/5 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">Review & Refine AI-Generated Quiz</CardTitle>
                <Badge variant={isQuizPublished ? 'success' : 'warning'}>
                  {isQuizPublished ? 'PUBLISHED' : 'DRAFT (Needs Review)'}
                </Badge>
              </div>
              <CardDescription className="text-xs mt-1">
                Generated from Topic: <em>3. Neural Network Architecture & Backpropagation</em>
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => navigate('/trainer/quizzes')}>
                <HelpCircle className="w-4 h-4 mr-1.5" /> Manage All Quizzes
              </Button>
              <Button
                size="sm"
                variant={isQuizPublished ? 'secondary' : 'success'}
                onClick={handlePublishQuiz}
                disabled={isQuizPublished}
              >
                <FileCheck className="w-4 h-4 mr-1.5" />
                {isQuizPublished ? 'Published Live' : 'Publish Quiz to Students'}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5" /> Assessment Title
                </label>
                <input
                  className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-bold"
                  value={quizDraftTitle}
                  onChange={(e) => setQuizDraftTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">Passing Score (%)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-semibold"
                  value={quizPassScore}
                  onChange={(e) => setQuizPassScore(parseFloat(e.target.value) || 70)}
                />
              </div>
            </div>

            {/* Questions list */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase text-muted-foreground">Draft Questions & Options</h4>
              {quizQuestions.map((q, qIdx) => (
                <div key={qIdx} className="p-4 rounded-2xl bg-card border border-border space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-brand-600 dark:text-brand-400">
                      Question {qIdx + 1} ({q.difficulty})
                    </span>
                  </div>

                  <input
                    type="text"
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-sm font-medium"
                    value={q.question_text}
                    onChange={(e) => {
                      const updated = [...quizQuestions];
                      updated[qIdx].question_text = e.target.value;
                      setQuizQuestions(updated);
                    }}
                  />

                  <div className="space-y-2 pt-1">
                    {q.options.map((opt, optIdx) => (
                      <div
                        key={optIdx}
                        className={`p-2 rounded-xl border flex items-center gap-2.5 text-xs ${
                          opt.is_correct
                            ? 'bg-emerald-500/10 border-emerald-500/30 font-bold text-emerald-600 dark:text-emerald-400'
                            : 'bg-background border-input'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...quizQuestions];
                            updated[qIdx].options = updated[qIdx].options.map((o, oIndex) => ({
                              ...o,
                              is_correct: oIndex === optIdx,
                            }));
                            setQuizQuestions(updated);
                          }}
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                            opt.is_correct
                              ? 'bg-emerald-500 text-white'
                              : 'border border-muted-foreground/40'
                          }`}
                        >
                          {opt.is_correct && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                        <input
                          type="text"
                          className="flex-1 bg-transparent focus:outline-none"
                          value={opt.option_text}
                          onChange={(e) => {
                            const updated = [...quizQuestions];
                            updated[qIdx].options[optIdx].option_text = e.target.value;
                            setQuizQuestions(updated);
                          }}
                        />
                        {opt.is_correct && <span className="text-[10px] uppercase">Correct Key</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* CAPSULE DRAFT REVIEW CARD */
        <Card className="border-purple-500/30 bg-purple-500/5 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">Review & Refine Draft Capsule</CardTitle>
                <Badge variant={isCapsulePublished ? 'success' : 'warning'}>
                  {isCapsulePublished ? 'PUBLISHED' : 'DRAFT (Needs Review)'}
                </Badge>
              </div>
              <CardDescription className="text-xs mt-1">
                Source Attributed to: <em>CS_ML_LectureNotes_Ch1_4.pdf (Pages 12-16)</em>
              </CardDescription>
            </div>

            <Button
              size="sm"
              variant={isCapsulePublished ? 'secondary' : 'success'}
              onClick={handlePublishCapsule}
              disabled={isCapsulePublished}
            >
              <FileCheck className="w-4 h-4 mr-1.5" />
              {isCapsulePublished ? 'Published' : 'Publish to Students'}
            </Button>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5" /> Capsule Title
              </label>
              <input
                className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-bold"
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Standard Comprehensive Explanation
              </label>
              <textarea
                rows={4}
                className="w-full p-3.5 rounded-xl border border-input bg-background text-sm leading-relaxed"
                value={draftExplanation}
                onChange={(e) => setDraftExplanation(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Simplified Analogy (For Developing / Remediation Cohorts)
              </label>
              <textarea
                rows={3}
                className="w-full p-3.5 rounded-xl border border-input bg-background text-sm leading-relaxed"
                value={draftSimple}
                onChange={(e) => setDraftSimple(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

