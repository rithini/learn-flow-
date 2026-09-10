import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RoleGuard } from './RoleGuard';

// Layouts
import { PublicLayout } from '../layouts/PublicLayout';
import { StudentLayout, TrainerLayout, AdminLayout } from '../layouts/RoleLayouts';

// Public Feature Pages
import { LandingPage } from '../features/public/LandingPage';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { AboutPage, ContactPage } from '../features/public/AboutContactPages';

// Student Feature Pages
import { StudentDashboardPage } from '../features/student/StudentDashboardPage';
import { MyCoursesPage, CourseDetailsPage } from '../features/student/CoursePages';
import { CapsuleViewPage, QuizTakePage } from '../features/student/LearningQuizPages';
import {
  LearningPathPage,
  RecommendationsPage,
  PerformancePage,
  StrengthsWeaknessesPage,
  ProgressPage,
  StudentProfilePage,
} from '../features/student/LearningPathRecommendations';

// Trainer Feature Pages
import { TrainerDashboardPage } from '../features/trainer/TrainerDashboardPage';
import { CourseManagementPage, MaterialUploadPage } from '../features/trainer/TrainerCourseMaterials';
import { AIContentStudioPage } from '../features/trainer/AIContentStudioPage';
import {
  QuizManagementPage,
  StudentPerformancePage,
  AnalyticsDashboardPage,
  TrainerProfilePage,
} from '../features/trainer/TrainerOtherPages';

// Admin Feature Pages
import { AdminDashboardPage, UserManagementPage } from '../features/admin/AdminPages';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      {/* Student Portal (Protected) */}
      <Route
        path="/student"
        element={
          <RoleGuard allowedRoles={['STUDENT']}>
            <StudentLayout />
          </RoleGuard>
        }
      >
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboardPage />} />
        <Route path="courses" element={<MyCoursesPage />} />
        <Route path="courses/:courseId" element={<CourseDetailsPage />} />
        <Route path="capsules/:capsuleId" element={<CapsuleViewPage />} />
        <Route path="quizzes/:quizId" element={<QuizTakePage />} />
        <Route path="learning-path" element={<LearningPathPage />} />
        <Route path="recommendations" element={<RecommendationsPage />} />
        <Route path="performance" element={<PerformancePage />} />
        <Route path="strengths-weaknesses" element={<StrengthsWeaknessesPage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="profile" element={<StudentProfilePage />} />
      </Route>

      {/* Trainer Portal (Protected) */}
      <Route
        path="/trainer"
        element={
          <RoleGuard allowedRoles={['TRAINER']}>
            <TrainerLayout />
          </RoleGuard>
        }
      >
        <Route index element={<Navigate to="/trainer/dashboard" replace />} />
        <Route path="dashboard" element={<TrainerDashboardPage />} />
        <Route path="courses" element={<CourseManagementPage />} />
        <Route path="materials" element={<MaterialUploadPage />} />
        <Route path="ai-generation" element={<AIContentStudioPage />} />
        <Route path="quizzes" element={<QuizManagementPage />} />
        <Route path="students-performance" element={<StudentPerformancePage />} />
        <Route path="analytics" element={<AnalyticsDashboardPage />} />
        <Route path="profile" element={<TrainerProfilePage />} />
      </Route>

      {/* Admin Portal (Protected) */}
      <Route
        path="/admin"
        element={
          <RoleGuard allowedRoles={['ADMIN']}>
            <AdminLayout />
          </RoleGuard>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="courses" element={<CourseManagementPage />} />
        <Route path="analytics" element={<AnalyticsDashboardPage />} />
        <Route path="audit-logs" element={<AdminDashboardPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
