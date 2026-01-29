import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const METRIC_LABELS: Record<string, string> = {
  BP: 'Business Performance',
  CA: 'Change Adoption',
  EE: 'Employee Energy',
  TR: 'Trust',
  RS: 'Resistance',
  LC: 'Leadership Credibility',
  MO: 'Momentum'
};

const METRIC_COLORS: Record<string, string> = {
  BP: '#3b82f6',
  CA: '#10b981',
  EE: '#f59e0b',
  TR: '#8b5cf6',
  RS: '#ef4444',
  LC: '#06b6d4',
  MO: '#ec4899'
};

interface MetricHistory {
  round: number;
  metrics: Record<string, number>;
}

interface TrendChartProps {
  history: MetricHistory[];
}

export default function TrendChart({ history }: TrendChartProps) {
  if (!history || history.length < 2) return null;

  const data = history.map(h => ({
    round: `R${h.round}`,
    ...h.metrics
  }));

  return (
    <div style={{ background: '#1e293b', padding: '8px', borderRadius: '6px', marginBottom: '6px', border: '1px solid #475569' }}>
      <h3 style={{ fontSize: '10px', marginBottom: '6px', color: '#f1f5f9', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
        METRIC TRENDS
      </h3>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
          <XAxis dataKey="round" stroke="#cbd5e1" style={{ fontSize: '8px', fontWeight: '600' }} />
          <YAxis domain={[0, 100]} stroke="#cbd5e1" style={{ fontSize: '8px', fontWeight: '600' }} />
          <Tooltip 
            contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '4px', fontSize: '9px' }}
            labelStyle={{ color: '#f1f5f9', fontWeight: 'bold' }}
          />
          <Legend wrapperStyle={{ paddingTop: '4px', fontSize: '8px' }} />
          {Object.keys(METRIC_LABELS).map(key => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={METRIC_LABELS[key]}
              stroke={METRIC_COLORS[key]}
              strokeWidth={2}
              dot={{ fill: METRIC_COLORS[key], r: 2, strokeWidth: 1, stroke: '#0f172a' }}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
