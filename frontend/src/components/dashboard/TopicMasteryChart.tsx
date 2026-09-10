import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';

interface TopicMasteryProps {
  data: Array<{
    topic_title: string;
    mastery_score: number;
  }>;
}

export const TopicMasteryChart: React.FC<TopicMasteryProps> = ({ data }) => {
  const chartData = data.length > 0 ? data : [
    { topic_title: 'Foundations', mastery_score: 92.5 },
    { topic_title: 'Regression', mastery_score: 89.0 },
    { topic_title: 'Neural Networks', mastery_score: 45.0 },
    { topic_title: 'Optimization', mastery_score: 0.0 },
  ];

  const getBarColor = (score: number) => {
    if (score >= 80) return '#10b981'; // Emerald
    if (score >= 50) return '#f59e0b'; // Amber
    return '#f43f5e'; // Rose
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.2)" />
          <XAxis
            dataKey="topic_title"
            stroke="#9ca3af"
            fontSize={11}
            tickLine={false}
            tickFormatter={(val) => (val.length > 12 ? val.slice(0, 10) + '..' : val)}
          />
          <YAxis stroke="#9ca3af" fontSize={11} domain={[0, 100]} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0.75rem',
              color: '#fff',
              fontSize: '12px',
            }}
          />
          <Bar dataKey="mastery_score" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.mastery_score)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
