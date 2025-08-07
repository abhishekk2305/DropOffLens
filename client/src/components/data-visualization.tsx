import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { FeedbackTheme } from "@/lib/types";

interface DataVisualizationProps {
  themes: FeedbackTheme[];
  totalFeedback: number;
}

const COLORS = [
  '#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#F97316'
];

export function DataVisualization({ themes, totalFeedback }: DataVisualizationProps) {
  const chartData = themes.map((theme, index) => ({
    name: theme.name.length > 20 ? theme.name.substring(0, 20) + '...' : theme.name,
    fullName: theme.name,
    percentage: theme.percentage,
    count: Math.round((theme.percentage / 100) * totalFeedback),
    color: COLORS[index % COLORS.length],
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{data.fullName}</p>
          <p className="text-blue-600">{`${data.percentage}% (${data.count} responses)`}</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) => {
    if (percentage < 8) return null; // Don't show labels for small slices
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${percentage.toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="text-purple-600 mr-3" size={20} />
          Theme Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="bar" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bar" className="flex items-center">
              <BarChart3 className="mr-2" size={16} />
              Bar Chart
            </TabsTrigger>
            <TabsTrigger value="pie" className="flex items-center">
              <PieChartIcon className="mr-2" size={16} />
              Pie Chart
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="bar" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    fontSize={12}
                  />
                  <YAxis 
                    label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="percentage" 
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="pie" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="percentage"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px' }}
                    formatter={(value, entry: any) => entry?.payload?.fullName || value}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{themes.length}</div>
            <div className="text-sm text-gray-600">Themes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{totalFeedback}</div>
            <div className="text-sm text-gray-600">Responses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {themes.length > 0 ? Math.round(themes.reduce((acc, theme) => acc + theme.percentage, 0)) : 0}%
            </div>
            <div className="text-sm text-gray-600">Coverage</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}