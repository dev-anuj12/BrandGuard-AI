'use client';

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface AnalyticsBarChartProps {
  data: Array<Record<string, any>>;
  dataKey: string;
  xKey?: string;
  color?: string;
  name?: string;
  height?: number;
  layout?: 'horizontal' | 'vertical';
}

export default function AnalyticsBarChart({
  data,
  dataKey,
  xKey = 'name',
  color = '#A855F7',
  name,
  height = 220,
  layout = 'horizontal',
}: AnalyticsBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div style={{ width: '100%', height }} className="flex items-center justify-center text-xs text-slate-400">
        No bar chart telemetry available
      </div>
    );
  }

  if (layout === 'vertical') {
    return (
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} horizontal={false} />
            <XAxis type="number" stroke="#64748B" fontSize={11} />
            <YAxis type="category" dataKey={xKey} stroke="#64748B" fontSize={11} width={130} />
            <Tooltip contentStyle={{ backgroundColor: '#120924', borderColor: 'rgba(168, 85, 247, 0.3)', borderRadius: '8px', fontSize: '12px', color: '#fff' }} />
            <Bar dataKey={dataKey} name={name || dataKey} fill={color} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis dataKey={xKey} stroke="#64748B" fontSize={11} angle={-25} textAnchor="end" />
          <YAxis stroke="#64748B" fontSize={11} />
          <Tooltip contentStyle={{ backgroundColor: '#120924', borderColor: 'rgba(168, 85, 247, 0.3)', borderRadius: '8px', fontSize: '12px', color: '#fff' }} />
          <Bar dataKey={dataKey} name={name || dataKey} fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

