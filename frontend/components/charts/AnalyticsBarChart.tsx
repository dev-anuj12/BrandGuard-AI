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
  color = '#6366F1',
  name,
  height = 220,
  layout = 'horizontal',
}: AnalyticsBarChartProps) {
  if (layout === 'vertical') {
    return (
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} horizontal={false} />
            <XAxis type="number" stroke="#64748B" fontSize={11} />
            <YAxis type="category" dataKey={xKey} stroke="#64748B" fontSize={11} width={130} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', fontSize: '12px', color: '#fff' }} />
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
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', fontSize: '12px', color: '#fff' }} />
          <Bar dataKey={dataKey} name={name || dataKey} fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

