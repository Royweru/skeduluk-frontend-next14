// src/components/analytics/engagement-chart.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AnalyticsOverTime } from '@/app/types';
import { format } from 'date-fns';

interface EngagementChartProps {
  data: AnalyticsOverTime[];
  title?: string;
  description?: string;
}

export function EngagementChart({ 
  data, 
  title = 'Engagement Over Time',
  description = 'Track your performance trends'
}: EngagementChartProps) {
  // Format data for chart
  const chartData = data.map(item => ({
    ...item,
    date: format(new Date(item.date), 'MMM dd'),
  }));

  return (
    <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#888888"
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            <Line 
              type="monotone" 
              dataKey="views" 
              stroke="hsl(42 84% 61%)" 
              strokeWidth={2}
              dot={{ fill: 'hsl(42 84% 61%)', r: 4 }}
              activeDot={{ r: 6 }}
              name="Views"
            />
            <Line 
              type="monotone" 
              dataKey="likes" 
              stroke="hsl(16 88% 62%)" 
              strokeWidth={2}
              dot={{ fill: 'hsl(16 88% 62%)', r: 4 }}
              activeDot={{ r: 6 }}
              name="Likes"
            />
            <Line 
              type="monotone" 
              dataKey="comments" 
              stroke="hsl(174 63% 50%)" 
              strokeWidth={2}
              dot={{ fill: 'hsl(174 63% 50%)', r: 4 }}
              activeDot={{ r: 6 }}
              name="Comments"
            />
            <Line 
              type="monotone" 
              dataKey="shares" 
              stroke="hsl(265 90% 65%)" 
              strokeWidth={2}
              dot={{ fill: 'hsl(265 90% 65%)', r: 4 }}
              activeDot={{ r: 6 }}
              name="Shares"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}