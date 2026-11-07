'use client';

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export interface ThreatCategoryPieChartProps {
  data: Array<{ name: string; value: number }>;
  colors?: string[];
  height?: number;
}

const DEFAULT_COLORS = ['#EF4444', '#F59E0B', '#6366F1', '#8B5CF6', '#10B981'];

export default function ThreatCategoryPieChart({
  data,
  colors = DEFAULT_COLORS,
  height = 176,
}: ThreatCategoryPieChartProps) {
  if (!data || data.length === 0 || data.every((d) => d.value === 0)) {
    return (
      <div style={{ width: '100%', height }} className="flex items-center justify-center text-xs text-slate-400">
        No active threat telemetry recorded
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={36}
            outerRadius={62}
            paddingAngle={3}
          >
            {data.map((_, i) => (
              <Cell key={`cell-${i}`} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#fff' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

