import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface ScoreTrendProps {
  data: Array<{
    quiz_title: string;
    score: number;
    percentage: number;
  }>;
}

export const ScoreTrendChart: React.FC<ScoreTrendProps> = ({ data }) => {
  const chartData = data.length > 0 ? data : [
    { quiz_title: 'Quiz 1', percentage: 65 },
    { quiz_title: 'Quiz 2', percentage: 72 },
    { quiz_title: 'Quiz 3', percentage: 88 },
    { quiz_title: 'Quiz 4', percentage: 95 },
  ];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.2)" />
          <XAxis
            dataKey="quiz_title"
            stroke="#9ca3af"
            fontSize={11}
            tickLine={false}
            tickFormatter={(val) => (val.length > 15 ? val.slice(0, 12) + '...' : val)}
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
          <Line
            type="monotone"
            dataKey="percentage"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#ffffff' }}
            activeDot={{ r: 7, stroke: '#3b82f6', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
