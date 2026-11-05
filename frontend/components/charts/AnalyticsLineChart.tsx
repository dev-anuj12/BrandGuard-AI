'use client';

import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

interface LineConfig {
  dataKey: string;
  color: string;
  name?: string;
}

interface AnalyticsLineChartProps {
  data: Array<Record<string, any>>;
  lines: LineConfig[];
  xKey?: string;
  height?: number;
  domain?: [number, number];
  showLegend?: boolean;
}

export default function AnalyticsLineChart({
  data,
  lines,
  xKey = 'name',
  height = 220,
  domain,
  showLegend = true,
}: AnalyticsLineChartProps) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis dataKey={xKey} stroke="#64748B" fontSize={11} />
          <YAxis stroke="#64748B" fontSize={11} domain={domain} />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', fontSize: '12px', color: '#fff' }} />
          {showLegend && <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />}
          {lines.map(({ dataKey, color, name }) => (
            <Line
              key={dataKey}
              type="monotone"
              dataKey={dataKey}
              name={name || dataKey}
              stroke={color}
              strokeWidth={2.5}
              dot={{ fill: color, r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
