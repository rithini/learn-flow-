import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { studentApi } from '../../api/students';
import { Course, StudentTopicView } from '../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ProgressRing } from '../../components/common/ProgressRing';
import { getStrengthBadgeColor } from '../../utils/formatters';
import { BookOpen, Lock, Play, CheckCircle2, Clock, ArrowRight, Sparkles } from 'lucide-react';

export const MyCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    studentApi.getMyCourses().then(setCourses);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Enrolled Courses</h1>
        <p className="text-xs text-muted-foreground">Access your active courses and topic prerequisite trees.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((c) => (
          <Card key={c.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
            <div>
              {c.thumbnail_url && (
                <div className="h-44 w-full overflow-hidden bg-muted relative">
                  <img src={c.thumbnail_url} alt={c.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3">
                    <Badge variant="success">Enrolled</Badge>
                  </div>
                </div>
              )}
              <CardHeader className="p-5">
                <CardTitle className="text-base line-clamp-2">{c.title}</CardTitle>
                <CardDescription className="text-xs line-clamp-2 mt-1">{c.description}</CardDescription>
              </CardHeader>
            </div>

            <CardContent className="p-5 pt-0 border-t border-border/60 flex items-center justify-between mt-4">
              <div className="text-xs text-muted-foreground">
                <span className="font-bold text-foreground">{c.topic_count}</span> Modules
              </div>
              <Button size="sm" onClick={() => navigate(`/student/courses/${c.id}`)}>
                <span>Open Course</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const CourseDetailsPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [topics, setTopics] = useState<StudentTopicView[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (courseId) {
      studentApi.getCourseStudentView(courseId).then(setTopics);
    }
  }, [courseId]);

  return (
    <div className="space-y-8">
      {/* Course Header */}
      <div className="p-8 rounded-3xl bg-card border border-border shadow-sm space-y-3">
        <Badge variant="default">Institute Curriculum</Badge>
        <h1 className="text-2xl sm:text-3xl font-black text-foreground">
          Introduction to Machine Learning & Neural Networks
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
          Follow the prerequisite DAG below. As you achieve &ge;65% mastery on prerequisites, subsequent units will unlock automatically.
        </p>
      </div>

      {/* Topics List with Lock Logic */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-500" />
          <span>Curriculum Modules & Prerequisite DAG</span>
        </h3>

        <div className="space-y-3">
          {topics.map((t, idx) => {
            const badgeStyle = getStrengthBadgeColor(t.strength_status);

            return (
              <div
                key={t.id}
                className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  t.is_locked
                    ? 'bg-muted/30 border-border/60 opacity-60'
                    : 'bg-card border-border hover:border-brand-500/30 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 font-black flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base text-foreground">{t.title}</h4>
                      {t.is_locked && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{t.description}</p>
                    {t.is_locked && t.lock_reason && (
                      <p className="text-xs text-rose-500 font-semibold">{t.lock_reason}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end md:self-center">
                  {!t.is_locked && (
                    <div className="text-right">
                      <span className="text-xs font-bold text-foreground block">{t.mastery_score}% Mastery</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeStyle.bg}`}>
                        {badgeStyle.label}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={t.is_locked}
                      onClick={() => navigate(`/student/capsules/${t.capsule_id || 'cap-1'}`)}
                    >
                      <BookOpen className="w-3.5 h-3.5 mr-1" />
                      Capsule
                    </Button>
                    <Button
                      size="sm"
                      disabled={t.is_locked}
                      onClick={() => navigate(`/student/quizzes/${t.quiz_id || 'quiz-1'}`)}
                    >
                      <Play className="w-3.5 h-3.5 mr-1 fill-current" />
                      Quiz
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
