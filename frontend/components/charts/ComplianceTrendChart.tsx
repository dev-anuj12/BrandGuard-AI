'use client';

import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export interface ComplianceTrendChartProps {
  data: Array<{ day: string; score: number }>;
  height?: number;
}

export default function ComplianceTrendChart({ data, height = 180 }: ComplianceTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div style={{ width: '100%', height }} className="flex items-center justify-center text-xs text-slate-400">
        No trend telemetry available
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis dataKey="day" stroke="#64748B" fontSize={10} tickLine={false} />
          <YAxis stroke="#64748B" fontSize={10} domain={[60, 100]} tickLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
          />
          <Line 
            type="monotone" 
            dataKey="score" 
            name="Compliance Score (%)" 
            stroke="#6366F1" 
            strokeWidth={2.5} 
            dot={{ fill: '#6366F1', r: 3.5 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

