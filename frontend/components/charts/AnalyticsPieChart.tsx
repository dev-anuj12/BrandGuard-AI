'use client';

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface AnalyticsPieChartProps {
  data: Array<{ name: string; value: number }>;
  colors?: string[];
  height?: number;
  showLegend?: boolean;
}

const DEFAULT_COLORS = ['#A855F7', '#D946EF', '#10B981', '#F59E0B', '#EF4444', '#782BDB'];

export default function AnalyticsPieChart({
  data,
  colors = DEFAULT_COLORS,
  height = 220,
  showLegend = true,
}: AnalyticsPieChartProps) {
  if (!data || data.length === 0 || data.every((d) => d.value === 0)) {
    return (
      <div style={{ width: '100%', height }} className="flex items-center justify-center text-xs text-slate-400">
        No status telemetry recorded
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            outerRadius={75}
            innerRadius={40}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((_, i) => (
              <Cell key={`cell-${i}`} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: '#120924', borderColor: 'rgba(168, 85, 247, 0.3)', borderRadius: '8px', fontSize: '12px', color: '#fff' }} />
          {showLegend && (
            <Legend
              iconSize={8}
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

