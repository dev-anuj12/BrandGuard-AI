'use client';

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export interface RuleViolationsBarChartProps {
  data: Array<{ name: string; count: number }>;
  height?: number;
}

export default function RuleViolationsBarChart({ data, height = 240 }: RuleViolationsBarChartProps) {
  if (!data || data.length === 0 || data.every((d) => d.count === 0)) {
    return (
      <div style={{ width: '100%', height }} className="flex items-center justify-center text-xs text-slate-400">
        No rule infractions recorded
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} horizontal={false} />
          <XAxis type="number" stroke="#64748B" fontSize={11} />
          <YAxis type="category" dataKey="name" stroke="#64748B" fontSize={11} width={130} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#120924', borderColor: 'rgba(168, 85, 247, 0.3)', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
          />
          <Bar dataKey="count" name="Violations" fill="#A855F7" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

