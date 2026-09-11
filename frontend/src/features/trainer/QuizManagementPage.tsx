import React, { useEffect, useState } from 'react';
import { quizApi } from '../../api/quizzes';
import { trainerApi } from '../../api/trainers';
import { QuizTrainer, QuizQuestionTrainer, QuizType, CourseStatus, Course, Topic } from '../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  HelpCircle,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  BookOpen,
  Sparkles,
  Search,
  Filter,
  AlertCircle,
  Eye,
  Check,
  Save,
  Send,
  Layers,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

export const QuizManagementPage: React.FC = () => {
  const [quizzes, setQuizzes] = useState<QuizTrainer[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals state
  const [editingQuiz, setEditingQuiz] = useState<QuizTrainer | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<QuizTrainer | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchQuizzes = async () => {
    setIsLoading(true);
    try {
      const [quizData, courseData, topicData] = await Promise.all([
        quizApi.getTrainerQuizzes(),
        trainerApi.getCourses(),
        trainerApi.getCourseTopics('crs-ml-101'),
      ]);
      setQuizzes(quizData);
      setCourses(courseData);
      setTopics(topicData);
    } catch {
      setNotification({ type: 'error', message: 'Failed to load quizzes from server.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const handlePublish = async (quiz: QuizTrainer) => {
    try {
      const updated = await quizApi.publishQuiz(quiz.id);
      setQuizzes((prev) => prev.map((q) => (q.id === quiz.id ? updated : q)));
      showToast('success', `"${quiz.title}" has been published! It is now live for students.`);
    } catch {
      showToast('error', 'Failed to publish quiz. Please try again.');
    }
  };

  const handleUnpublish = async (quiz: QuizTrainer) => {
    try {
      const updated = await quizApi.unpublishQuiz(quiz.id);
      setQuizzes((prev) => prev.map((q) => (q.id === quiz.id ? updated : q)));
      showToast('success', `"${quiz.title}" is now back in DRAFT state.`);
    } catch {
      showToast('error', 'Failed to unpublish quiz.');
    }
  };

  const handleDelete = async () => {
    if (!quizToDelete) return;
    try {
      await quizApi.deleteQuiz(quizToDelete.id);
      setQuizzes((prev) => prev.filter((q) => q.id !== quizToDelete.id));
      showToast('success', `Quiz "${quizToDelete.title}" deleted.`);
      setQuizToDelete(null);
    } catch {
      showToast('error', 'Failed to delete quiz.');
    }
  };

  const handleSaveQuiz = async (updatedData: Partial<QuizTrainer>, publishAfterSave = false) => {
    if (!editingQuiz) return;
    setIsSaving(true);
    try {
      // Validate that each question has at least one correct option
      const questionsToSave = updatedData.questions || editingQuiz.questions;
      for (let i = 0; i < questionsToSave.length; i++) {
        const q = questionsToSave[i];
        if (!q.question_text.trim()) {
          showToast('error', `Question #${i + 1} text cannot be empty.`);
          setIsSaving(false);
          return;
        }
        const hasCorrect = q.options.some((opt) => opt.is_correct);
        if (!hasCorrect) {
          showToast('error', `Question #${i + 1} must have at least one correct answer selected.`);
          setIsSaving(false);
          return;
        }
      }

      let res = await quizApi.updateTrainerQuiz(editingQuiz.id, {
        title: updatedData.title ?? editingQuiz.title,
        pass_score: updatedData.pass_score ?? editingQuiz.pass_score,
        status: publishAfterSave ? 'PUBLISHED' : (updatedData.status ?? editingQuiz.status),
        questions: questionsToSave.map((q, idx) => ({
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

      if (publishAfterSave && res.status !== 'PUBLISHED') {
        res = await quizApi.publishQuiz(editingQuiz.id);
      }

      setQuizzes((prev) => prev.map((q) => (q.id === editingQuiz.id ? res : q)));
      showToast(
        'success',
        publishAfterSave
          ? `Quiz "${res.title}" updated and published successfully!`
          : `Quiz "${res.title}" saved successfully!`
      );
      setEditingQuiz(null);
    } catch {
      showToast('error', 'Failed to update quiz. Please check fields.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNewQuiz = async (
    topicId: string,
    title: string,
    type: QuizType,
    passScore: number,
    questions: QuizQuestionTrainer[],
    publishDirectly: boolean
  ) => {
    setIsSaving(true);
    try {
      let created = await quizApi.createTrainerQuiz({
        topic_id: topicId,
        title,
        type,
        pass_score: passScore,
        questions: questions.map((q, idx) => ({
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

      if (publishDirectly) {
        created = await quizApi.publishQuiz(created.id);
      }

      setQuizzes((prev) => [created, ...prev]);
      showToast(
        'success',
        publishDirectly
          ? `Assessment "${created.title}" created and published!`
          : `Assessment "${created.title}" saved as DRAFT!`
      );
      setIsCreateModalOpen(false);
    } catch {
      showToast('error', 'Failed to create assessment.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredQuizzes = quizzes.filter((q) => {
    if (statusFilter !== 'ALL' && q.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase();
      const matchTitle = q.title.toLowerCase().includes(term);
      const matchTopic = (q.topic_title || '').toLowerCase().includes(term);
      const matchQuestion = q.questions.some((qu) => qu.question_text.toLowerCase().includes(term));
      return matchTitle || matchTopic || matchQuestion;
    }
    return true;
  });

  const publishedCount = quizzes.filter((q) => q.status === 'PUBLISHED').length;
  const draftCount = quizzes.filter((q) => q.status === 'DRAFT').length;
  const totalQuestions = quizzes.reduce((acc, q) => acc + (q.questions?.length || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-sm font-semibold animate-in fade-in slide-in-from-top-4 shadow-lg ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-500" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs hover:opacity-75 p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            <HelpCircle className="w-7 h-7 text-brand-600 dark:text-brand-400" />
            Quiz & Question Bank Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Author checkpoint assessments, edit questions and answer keys, and manage publishing states.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="shadow-md shadow-brand-500/20 bg-brand-600 hover:bg-brand-700 text-white"
          >
            <Plus className="w-4 h-4 mr-1.5" /> New Assessment
          </Button>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase">Total Quizzes</span>
              <h3 className="text-2xl font-black text-foreground mt-0.5">{quizzes.length}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <Layers className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase">Live (Published)</span>
              <h3 className="text-2xl font-black text-emerald-500 mt-0.5">{publishedCount}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase">Drafts (In Review)</span>
              <h3 className="text-2xl font-black text-amber-500 mt-0.5">{draftCount}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
              <Edit3 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase">Total Questions</span>
              <h3 className="text-2xl font-black text-purple-500 mt-0.5">{totalQuestions}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
              <Sparkles className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Controls */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, topic, or question..."
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-input bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <div className="flex rounded-xl bg-muted p-1 border border-border">
              {(['ALL', 'PUBLISHED', 'DRAFT'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    statusFilter === st
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {st === 'ALL' ? 'All' : st === 'PUBLISHED' ? 'Published' : 'Drafts'}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quizzes List */}
      {isLoading ? (
        <div className="p-12 text-center text-sm text-muted-foreground">
          Loading assessments and question banks...
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <Card className="border-border p-12 text-center space-y-3">
          <HelpCircle className="w-10 h-10 text-muted-foreground mx-auto" />
          <h3 className="text-base font-bold text-foreground">No Assessments Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'ALL'
              ? 'No quizzes match your active filters. Try adjusting your search query.'
              : 'Create your first topic quiz or generate one using the AI Content Studio.'}
          </p>
          <Button onClick={() => setIsCreateModalOpen(true)} size="sm">
            <Plus className="w-4 h-4 mr-1.5" /> Create New Assessment
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredQuizzes.map((quiz) => (
            <Card
              key={quiz.id}
              className="border-border hover:border-brand-500/40 transition-all shadow-sm hover:shadow-md"
            >
              <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-base text-foreground">{quiz.title}</h3>
                    <Badge variant={quiz.status === 'PUBLISHED' ? 'success' : 'warning'}>
                      {quiz.status}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] uppercase">
                      {quiz.type}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/80 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-brand-500" />
                      {quiz.topic_title || 'Topic Assessment'}
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-brand-600 dark:text-brand-400">
                      {quiz.questions?.length || 0} Questions
                    </span>
                    <span>•</span>
                    <span>Passing Criteria: <strong>{quiz.pass_score}%</strong></span>
                    {quiz.course_title && (
                      <>
                        <span>•</span>
                        <span className="text-xs text-muted-foreground/80 truncate max-w-xs">
                          {quiz.course_title}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingQuiz(JSON.parse(JSON.stringify(quiz)))}
                    className="border-brand-500/30 hover:bg-brand-500/10 text-brand-600 dark:text-brand-400"
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                    Edit Questions & Keys
                  </Button>

                  {quiz.status === 'DRAFT' ? (
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handlePublish(quiz)}
                      className="shadow-sm shadow-emerald-500/20"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                      Publish
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleUnpublish(quiz)}
                      title="Move back to DRAFT state"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1.5" />
                      Unpublish
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setQuizToDelete(quiz)}
                    className="text-rose-500 hover:bg-rose-500/10 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* QUESTION EDITOR MODAL */}
      {editingQuiz && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/40">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={editingQuiz.status === 'PUBLISHED' ? 'success' : 'warning'}>
                    {editingQuiz.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">ID: {editingQuiz.id.slice(0, 8)}...</span>
                </div>
                <h2 className="text-xl font-black text-foreground mt-1">
                  Edit Assessment & Question Bank
                </h2>
              </div>
              <button
                onClick={() => setEditingQuiz(null)}
                className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Quiz Meta Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-muted/30 border border-border">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Assessment Title</label>
                  <input
                    type="text"
                    className="w-full h-10 px-3.5 rounded-xl border border-input bg-background text-sm font-semibold"
                    value={editingQuiz.title}
                    onChange={(e) => setEditingQuiz({ ...editingQuiz, title: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Passing Score (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    className="w-full h-10 px-3.5 rounded-xl border border-input bg-background text-sm font-semibold"
                    value={editingQuiz.pass_score}
                    onChange={(e) =>
                      setEditingQuiz({ ...editingQuiz, pass_score: parseFloat(e.target.value) || 70 })
                    }
                  />
                </div>
              </div>

              {/* Questions Section Header */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-500" />
                    Questions & Correct Answers ({editingQuiz.questions.length})
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Click on the green radio button next to an option to mark it as the correct answer key.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    const newQ: QuizQuestionTrainer = {
                      id: 'new-q-' + Date.now(),
                      question_text: '',
                      question_type: 'MCQ',
                      difficulty: 'MEDIUM',
                      explanation: '',
                      sequence_no: editingQuiz.questions.length + 1,
                      marks: 1.0,
                      options: [
                        { option_text: '', is_correct: true, sequence_no: 1 },
                        { option_text: '', is_correct: false, sequence_no: 2 },
                        { option_text: '', is_correct: false, sequence_no: 3 },
                        { option_text: '', is_correct: false, sequence_no: 4 },
                      ],
                    };
                    setEditingQuiz({
                      ...editingQuiz,
                      questions: [...editingQuiz.questions, newQ],
                    });
                  }}
                  className="bg-brand-600 hover:bg-brand-700 text-white"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Question
                </Button>
              </div>

              {/* Questions List */}
              <div className="space-y-6">
                {editingQuiz.questions.map((question, qIdx) => (
                  <Card key={qIdx} className="border-border/80 shadow-sm relative overflow-hidden">
                    <div className="p-4 bg-muted/40 border-b border-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-black flex items-center justify-center">
                          {qIdx + 1}
                        </span>
                        <span className="font-bold text-sm text-foreground">Question {qIdx + 1}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          className="h-8 px-2 rounded-lg border border-input bg-background text-xs font-semibold"
                          value={question.difficulty}
                          onChange={(e) => {
                            const updatedQuestions = [...editingQuiz.questions];
                            updatedQuestions[qIdx].difficulty = e.target.value as any;
                            setEditingQuiz({ ...editingQuiz, questions: updatedQuestions });
                          }}
                        >
                          <option value="EASY">EASY</option>
                          <option value="MEDIUM">MEDIUM</option>
                          <option value="HARD">HARD</option>
                        </select>

                        {editingQuiz.questions.length > 1 && (
                          <button
                            onClick={() => {
                              const updatedQuestions = editingQuiz.questions.filter((_, idx) => idx !== qIdx);
                              setEditingQuiz({ ...editingQuiz, questions: updatedQuestions });
                            }}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10"
                            title="Delete this question"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <CardContent className="p-5 space-y-4">
                      {/* Question Text */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-muted-foreground">
                          Question Prompt / Problem Statement
                        </label>
                        <textarea
                          rows={2}
                          className="w-full p-3 rounded-xl border border-input bg-background text-sm font-medium focus:ring-2 focus:ring-brand-500/20"
                          placeholder="Enter question text..."
                          value={question.question_text}
                          onChange={(e) => {
                            const updatedQuestions = [...editingQuiz.questions];
                            updatedQuestions[qIdx].question_text = e.target.value;
                            setEditingQuiz({ ...editingQuiz, questions: updatedQuestions });
                          }}
                        />
                      </div>

                      {/* Options List */}
                      <div className="space-y-2.5">
                        <label className="text-xs font-bold uppercase text-muted-foreground flex items-center justify-between">
                          <span>Options & Answer Key</span>
                          <span className="text-[11px] font-normal lowercase text-muted-foreground">
                            (select the radio button of the correct answer)
                          </span>
                        </label>

                        <div className="space-y-2">
                          {question.options.map((opt, optIdx) => (
                            <div
                              key={optIdx}
                              className={`p-2.5 rounded-xl border flex items-center gap-3 transition-all ${
                                opt.is_correct
                                  ? 'bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/30'
                                  : 'bg-background border-input'
                              }`}
                            >
                              {/* Correct toggle button */}
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedQuestions = [...editingQuiz.questions];
                                  updatedQuestions[qIdx].options = updatedQuestions[qIdx].options.map(
                                    (o, oIndex) => ({
                                      ...o,
                                      is_correct: oIndex === optIdx,
                                    })
                                  );
                                  setEditingQuiz({ ...editingQuiz, questions: updatedQuestions });
                                }}
                                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${
                                  opt.is_correct
                                    ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/50'
                                    : 'border-2 border-muted-foreground/40 hover:border-emerald-500 text-transparent'
                                }`}
                                title={opt.is_correct ? 'Correct Answer' : 'Click to set as Correct Answer'}
                              >
                                <Check className="w-4 h-4 stroke-[3]" />
                              </button>

                              {/* Option Text Input */}
                              <input
                                type="text"
                                className="flex-1 bg-transparent text-sm font-medium focus:outline-none"
                                placeholder={`Option ${optIdx + 1} text...`}
                                value={opt.option_text}
                                onChange={(e) => {
                                  const updatedQuestions = [...editingQuiz.questions];
                                  updatedQuestions[qIdx].options[optIdx].option_text = e.target.value;
                                  setEditingQuiz({ ...editingQuiz, questions: updatedQuestions });
                                }}
                              />

                              {/* Option Correct Label */}
                              {opt.is_correct && (
                                <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase shrink-0">
                                  Correct Key
                                </span>
                              )}

                              {/* Delete Option button */}
                              {question.options.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedQuestions = [...editingQuiz.questions];
                                    const filteredOpts = updatedQuestions[qIdx].options.filter(
                                      (_, oIndex) => oIndex !== optIdx
                                    );
                                    // if deleted was correct, make first one correct
                                    if (opt.is_correct && filteredOpts.length > 0) {
                                      filteredOpts[0].is_correct = true;
                                    }
                                    updatedQuestions[qIdx].options = filteredOpts;
                                    setEditingQuiz({ ...editingQuiz, questions: updatedQuestions });
                                  }}
                                  className="text-xs text-muted-foreground hover:text-rose-500 px-1"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Add Option Button */}
                        {question.options.length < 6 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updatedQuestions = [...editingQuiz.questions];
                              updatedQuestions[qIdx].options.push({
                                option_text: '',
                                is_correct: false,
                                sequence_no: updatedQuestions[qIdx].options.length + 1,
                              });
                              setEditingQuiz({ ...editingQuiz, questions: updatedQuestions });
                            }}
                            className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 pt-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Another Option
                          </button>
                        )}
                      </div>

                      {/* Explanation */}
                      <div className="space-y-1 pt-1">
                        <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-purple-500" />
                          Explanation & Remediation Rationale
                        </label>
                        <input
                          type="text"
                          className="w-full h-9 px-3 rounded-xl border border-input bg-background text-xs font-medium"
                          placeholder="Why is this answer correct? (Displayed to student after submission)"
                          value={question.explanation || ''}
                          onChange={(e) => {
                            const updatedQuestions = [...editingQuiz.questions];
                            updatedQuestions[qIdx].explanation = e.target.value;
                            setEditingQuiz({ ...editingQuiz, questions: updatedQuestions });
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border flex items-center justify-between bg-muted/30">
              <Button variant="ghost" onClick={() => setEditingQuiz(null)}>
                Cancel
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleSaveQuiz(editingQuiz, false)}
                  isLoading={isSaving}
                >
                  <Save className="w-4 h-4 mr-1.5" /> Save Changes
                </Button>

                <Button
                  variant="success"
                  onClick={() => handleSaveQuiz(editingQuiz, true)}
                  isLoading={isSaving}
                  className="shadow-md shadow-emerald-500/20"
                >
                  <Send className="w-4 h-4 mr-1.5" /> Save & Publish Live
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW ASSESSMENT MODAL */}
      {isCreateModalOpen && (
        <CreateAssessmentModal
          topics={topics}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateNewQuiz}
          isLoading={isSaving}
        />
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {quizToDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-border shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="p-3 rounded-2xl bg-rose-500/10">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">Delete Assessment?</h3>
                <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-foreground">
              Are you sure you want to permanently delete <strong>"{quizToDelete.title}"</strong> and all its associated questions?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setQuizToDelete(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Delete Assessment
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// Modal for creating new quiz
const CreateAssessmentModal: React.FC<{
  topics: Topic[];
  onClose: () => void;
  onCreate: (
    topicId: string,
    title: string,
    type: QuizType,
    passScore: number,
    questions: QuizQuestionTrainer[],
    publishDirectly: boolean
  ) => void;
  isLoading: boolean;
}> = ({ topics, onClose, onCreate, isLoading }) => {
  const [topicId, setTopicId] = useState(topics[0]?.id || 'top-1');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<QuizType>('QUICK');
  const [passScore, setPassScore] = useState(70);

  const [questions, setQuestions] = useState<QuizQuestionTrainer[]>([
    {
      question_text: 'What is the primary optimization objective?',
      question_type: 'MCQ',
      difficulty: 'MEDIUM',
      explanation: 'Loss functions define how parameter weights are updated.',
      sequence_no: 1,
      marks: 1.0,
      options: [
        { option_text: 'Minimize the computed objective loss value', is_correct: true, sequence_no: 1 },
        { option_text: 'Maximize model training time', is_correct: false, sequence_no: 2 },
        { option_text: 'Keep weights strictly zero', is_correct: false, sequence_no: 3 },
      ],
    },
  ]);

  const handleSubmit = (publishDirectly: boolean) => {
    if (!title.trim()) {
      alert('Please enter an assessment title.');
      return;
    }
    onCreate(topicId, title, type, passScore, questions, publishDirectly);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-xl font-black text-foreground">Create New Assessment</h2>
            <p className="text-xs text-muted-foreground">Setup title, topic mapping, and questions.</p>
          </div>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-muted-foreground">Course Topic</label>
            <select
              className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-medium"
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
            >
              {topics.length > 0 ? (
                topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))
              ) : (
                <>
                  <option value="top-1">1. Mathematical Foundations</option>
                  <option value="top-2">2. Linear & Logistic Regression</option>
                  <option value="top-3">3. Neural Networks & Backpropagation</option>
                  <option value="top-4">4. Optimization & Regularization</option>
                </>
              )}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-muted-foreground">Assessment Title</label>
            <input
              type="text"
              className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-semibold"
              placeholder="e.g. Neural Networks & Backprop Knowledge Check"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-muted-foreground">Assessment Type</label>
              <select
                className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-medium"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
              >
                <option value="QUICK">Quick Checkpoint</option>
                <option value="DIAGNOSTIC">Diagnostic Baseline</option>
                <option value="PRACTICE">Targeted Practice</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-muted-foreground">Pass Score (%)</label>
              <input
                type="number"
                min="1"
                max="100"
                className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm font-semibold"
                value={passScore}
                onChange={(e) => setPassScore(parseFloat(e.target.value) || 70)}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => handleSubmit(false)} isLoading={isLoading}>
              Save as Draft
            </Button>
            <Button variant="success" onClick={() => handleSubmit(true)} isLoading={isLoading}>
              Create & Publish
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
