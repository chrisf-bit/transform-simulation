import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface MetricHistory {
  round: number;
  metrics: Record<string, number>;
}

interface IndividualTrendChartsProps {
  history: MetricHistory[];
}

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

export default function IndividualTrendCharts({ history }: IndividualTrendChartsProps) {
  if (!history || history.length < 2) return null;

  const getMetricColor = (value: number) => {
    if (value > 70) return '#10b981';
    if (value > 50) return '#3b82f6';
    if (value > 30) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div style={{ background: '#1e293b', padding: '8px', borderRadius: '6px', border: '1px solid #475569' }}>
      <h3 style={{ fontSize: '10px', marginBottom: '8px', color: '#f1f5f9', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
        INDIVIDUAL TRENDS
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
        {Object.keys(METRIC_LABELS).map(key => {
          const data = history.map(h => ({
            round: `R${h.round}`,
            value: Math.round(h.metrics[key])
          }));
          
          const currentValue = data[data.length - 1].value;
          
          return (
            <div key={key} style={{ background: '#0f172a', padding: '8px', borderRadius: '4px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '9px', fontWeight: '700', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {METRIC_LABELS[key]}
                </span>
                <span style={{ fontSize: '16px', fontWeight: '900', color: getMetricColor(currentValue) }}>
                  {currentValue}
                </span>
              </div>
              <ResponsiveContainer width="100%" height={60}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="round" stroke="#64748b" style={{ fontSize: '7px' }} />
                  <YAxis domain={[0, 100]} stroke="#64748b" style={{ fontSize: '7px' }} hide />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={METRIC_COLORS[key]}
                    strokeWidth={2}
                    dot={{ fill: METRIC_COLORS[key], r: 2 }}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          );
        })}
      </div>
    </div>
  );
}
