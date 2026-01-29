interface RandomEvent {
  id: string;
  title: string;
  description: string;
  impact: Record<string, number>;
  type: 'positive' | 'negative' | 'neutral';
}

interface EventDisplayProps {
  event: RandomEvent;
}

export default function EventDisplay({ event }: EventDisplayProps) {
  const getBackground = () => {
    switch (event.type) {
      case 'positive': return 'linear-gradient(135deg, #047857, #065f46)';
      case 'negative': return 'linear-gradient(135deg, #b91c1c, #991b1b)';
      default: return 'linear-gradient(135deg, #1e40af, #1e3a8a)';
    }
  };

  const getIndicator = () => {
    switch (event.type) {
      case 'positive': return '+';
      case 'negative': return '!';
      default: return '~';
    }
  };

  return (
    <div style={{
      background: getBackground(),
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      marginBottom: '10px',
      boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
      border: '2px solid rgba(255,255,255,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ 
          width: '32px', 
          height: '32px', 
          borderRadius: '50%', 
          background: 'rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '10px',
          fontSize: '20px',
          fontWeight: '900',
          border: '2px solid rgba(255,255,255,0.3)'
        }}>
          {getIndicator()}
        </div>
        <h3 style={{ fontSize: '15px', fontWeight: '900', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
          {event.title}
        </h3>
      </div>
      <p style={{ fontSize: '12px', lineHeight: '1.5', marginBottom: '10px', opacity: 0.95 }}>
        {event.description}
      </p>
      <div style={{ 
        background: 'rgba(0,0,0,0.25)', 
        padding: '8px', 
        borderRadius: '4px',
        fontSize: '10px',
        fontWeight: '600',
        border: '1px solid rgba(255,255,255,0.15)'
      }}>
        <div style={{ marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>IMPACT:</div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {Object.entries(event.impact).map(([key, value]) => (
            value !== 0 && (
              <span key={key} style={{ 
                background: 'rgba(255,255,255,0.2)', 
                padding: '3px 8px', 
                borderRadius: '3px',
                fontSize: '10px',
                fontWeight: '700',
                border: '1px solid rgba(255,255,255,0.3)'
              }}>
                {key}: {value > 0 ? '+' : ''}{value}
              </span>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
