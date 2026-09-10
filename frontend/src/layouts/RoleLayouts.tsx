import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Header } from '../components/common/Header';

export const StudentLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex bg-background text-foreground transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Student Learning Hub" />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const TrainerLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex bg-background text-foreground transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Trainer Curriculum Studio" />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex bg-background text-foreground transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Institute Administrator Portal" />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
