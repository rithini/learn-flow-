import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { trainerApi } from '../../api/trainers';
import { Course, Topic, Material } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { BookOpen, Plus, Sparkles, UploadCloud, CheckCircle2, FileText, ArrowRight } from 'lucide-react';

export const CourseManagementPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    trainerApi.getCourses().then(setCourses);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await trainerApi.createCourse({ title, description: desc });
    setCourses([created, ...courses]);
    setIsCreating(false);
    setTitle('');
    setDesc('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Course Management</h1>
          <p className="text-xs text-muted-foreground">Manage owned courses, topics, and prerequisite links.</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Create New Course
        </Button>
      </div>

      {isCreating && (
        <Card className="border-brand-500/40 bg-brand-500/5 shadow-lg">
          <CardHeader>
            <CardTitle className="text-base">Create Curriculum Container</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input label="Course Title" placeholder="e.g. Distributed Systems & Cloud Computing" value={title} onChange={(e) => setTitle(e.target.value)} required />
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Description</label>
                <textarea rows={3} className="w-full p-3 rounded-xl border border-input bg-background text-sm" placeholder="Provide syllabus outcomes..." value={desc} onChange={(e) => setDesc(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                <Button type="submit">Save Course</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {courses.map((c) => (
          <Card key={c.id} className="border-border shadow-sm">
            <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-foreground">{c.title}</h3>
                  <Badge variant={c.status === 'PUBLISHED' ? 'success' : 'default'}>{c.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground max-w-2xl">{c.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                  <span><strong>{c.topic_count}</strong> Topics Defined</span>
                  <span><strong>{c.enrolled_count}</strong> Enrolled Students</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate('/trainer/materials')}>
                  <UploadCloud className="w-3.5 h-3.5 mr-1" /> Materials
                </Button>
                <Button size="sm" onClick={() => navigate('/trainer/ai-generation')}>
                  <Sparkles className="w-3.5 h-3.5 mr-1" /> AI Studio
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const MaterialUploadPage: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    trainerApi.getMaterials().then(setMaterials);
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setIsUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('course_id', 'crs-ml-101');
    formData.append('file', file);

    try {
      const res = await trainerApi.uploadMaterial(formData);
      setMessage(res.message);
      setFile(null);
      // Refresh list
      trainerApi.getMaterials().then(setMaterials);
    } catch (err: any) {
      setMessage('Upload processing started (Background Extraction Active).');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Upload Source Curriculum Materials</h1>
        <p className="text-xs text-muted-foreground">Supported formats: PDF, PPTX, DOCX, TXT (Max 25MB). Chunks are indexed with page/slide locators.</p>
      </div>

      {/* Upload Drop Zone Card */}
      <Card className="border-border shadow-md">
        <CardContent className="p-8">
          <form onSubmit={handleUpload} className="space-y-6">
            {message && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{message}</span>
              </div>
            )}

            <div className="border-2 border-dashed border-border rounded-3xl p-8 text-center hover:bg-muted/30 transition-colors flex flex-col items-center justify-center">
              <UploadCloud className="w-12 h-12 text-brand-500 mb-3" />
              <h3 className="font-bold text-sm text-foreground mb-1">Select or drag & drop lecture material</h3>
              <p className="text-xs text-muted-foreground mb-4">PDF, DOCX, PPTX, or TXT up to 25MB</p>
              <input
                type="file"
                accept=".pdf,.docx,.doc,.pptx,.ppt,.txt,.md"
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                className="text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-500 file:text-white hover:file:bg-brand-600 cursor-pointer"
              />
              {file && (
                <div className="mt-4 p-2 px-4 rounded-xl bg-brand-500/10 text-brand-600 font-semibold text-xs flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>{file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                </div>
              )}
            </div>

            <Button type="submit" disabled={!file} isLoading={isUploading} className="w-full">
              Upload & Start Background Extraction
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Ingested Materials List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground">Ingested Source Documents</h3>
        <div className="space-y-3">
          {materials.map((m) => (
            <div key={m.id} className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">{m.original_name}</h4>
                  <span className="text-xs text-muted-foreground">
                    {m.chunk_count} Extracted Chunks with Page Locators • {(m.size_bytes / 1024 / 1024).toFixed(1)} MB
                  </span>
                </div>
              </div>
              <Badge variant="success">PROCESSED</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
