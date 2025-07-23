import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area } from 'recharts';
import { cn } from '@/lib/utils';

interface LineChartProps {
  data: Array<{
    name: string;
    [key: string]: string | number;
  }>;
  lines: Array<{
    dataKey: string;
    name: string;
    color: string;
    strokeWidth?: number;
  }>;
  title?: string;
  description?: string;
  className?: string;
  height?: number;
  showArea?: boolean;
}

export function LineChart({ 
  data, 
  lines, 
  title, 
  description, 
  className,
  height = 300,
  showArea = false
}: LineChartProps) {
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-strong border">
          <p className="font-semibold mb-1">{label}</p>
          {payload.map((entry: { name: string; value: number; color: string }, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn("bg-white rounded-xl p-6 shadow-soft", className)}>
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      )}
      
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart 
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            {lines.map((line, index) => (
              <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={line.color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={line.color} stopOpacity={0.1}/>
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#e0e0e0' }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#e0e0e0' }}
          />
          <Tooltip content={<CustomTooltip />} />
          {lines.length > 1 && (
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
              formatter={(value) => <span className="text-sm">{value}</span>}
            />
          )}
          {lines.map((line, index) => (
            <React.Fragment key={index}>
              {showArea && (
                <Area
                  type="monotone"
                  dataKey={line.dataKey}
                  stroke={line.color}
                  fillOpacity={1}
                  fill={`url(#gradient-${index})`}
                />
              )}
              <Line
                type="monotone"
                dataKey={line.dataKey}
                name={line.name}
                stroke={line.color}
                strokeWidth={line.strokeWidth || 2}
                dot={{ fill: line.color, r: 4 }}
                activeDot={{ r: 6 }}
                className="hover:opacity-80 transition-opacity"
              />
            </React.Fragment>
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}