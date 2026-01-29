interface NewsItem {
  id: string;
  timestamp: number;
  type: 'employee' | 'department' | 'external' | 'rumor' | 'event';
  text: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

interface NewsFeedProps {
  news: NewsItem[];
}

export default function NewsFeed({ news }: NewsFeedProps) {
  if (!news || news.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'employee': return '💬';
      case 'department': return '📊';
      case 'external': return '🌐';
      case 'rumor': return '🤫';
      case 'event': return '⚡';
      default: return '📰';
    }
  };

  const getBorderColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '#10b981';
      case 'negative': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getBackground = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '#f0fdf4';
      case 'negative': return '#fef2f2';
      default: return '#f8fafc';
    }
  };

  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
      <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#334155' }}>📰 Live News Feed</h3>
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {news.slice().reverse().map((item) => (
          <div
            key={item.id}
            style={{
              padding: '12px',
              marginBottom: '10px',
              borderLeft: `4px solid ${getBorderColor(item.sentiment)}`,
              background: getBackground(item.sentiment),
              borderRadius: '6px',
              fontSize: '14px',
              lineHeight: '1.5'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ fontSize: '16px', marginTop: '2px' }}>{getIcon(item.type)}</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#334155', marginBottom: '4px' }}>{item.text}</div>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>
                  {item.type} • {new Date(item.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
