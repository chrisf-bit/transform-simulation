import { useState, useEffect } from 'react';

interface BudgetAllocationProps {
  categories: string[];
  totalBudget: number;
  minPerCategory: number;
  onAllocationChange: (allocation: number[]) => void;
}

export default function BudgetAllocation({
  categories,
  totalBudget,
  minPerCategory,
  onAllocationChange
}: BudgetAllocationProps) {
  const [allocation, setAllocation] = useState<number[]>(
    categories.map(() => 0)
  );

  useEffect(() => {
    onAllocationChange(allocation);
  }, [allocation, onAllocationChange]);

  const handleSliderChange = (index: number, value: number) => {
    const newAllocation = [...allocation];
    newAllocation[index] = value;
    
    // Check if total exceeds budget
    const total = newAllocation.reduce((sum, val) => sum + val, 0);
    if (total <= totalBudget) {
      setAllocation(newAllocation);
    }
  };

  const getCurrentTotal = () => {
    return allocation.reduce((sum, val) => sum + val, 0);
  };

  const getRemainingBudget = () => {
    return totalBudget - getCurrentTotal();
  };

  const formatCurrency = (amount: number) => {
    if (totalBudget > 1000) {
      return `£${(amount / 1000).toFixed(0)}K`;
    }
    return `${amount}`;
  };

  const getPercentage = (amount: number) => {
    return ((amount / totalBudget) * 100).toFixed(0);
  };

  return (
    <div style={{ background: '#1e293b', padding: '6px', borderRadius: '4px', marginBottom: '6px', border: '1px solid #475569' }}>
      <div style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '8px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Allocated</div>
          <div style={{ fontSize: '13px', fontWeight: '900', color: '#34d399' }}>
            {formatCurrency(getCurrentTotal())}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '8px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Remaining</div>
          <div style={{ fontSize: '13px', fontWeight: '900', color: getRemainingBudget() > 0 ? '#818cf8' : '#64748b' }}>
            {formatCurrency(getRemainingBudget())}
          </div>
        </div>
      </div>

      {categories.map((category, index) => (
        <div key={index} style={{ marginBottom: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span style={{ fontSize: '9px', fontWeight: '700', color: '#e2e8f0', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
              {category}
            </span>
            <div>
              <span style={{ fontSize: '12px', fontWeight: '900', color: '#34d399' }}>
                {formatCurrency(allocation[index])}
              </span>
              <span style={{ fontSize: '8px', color: '#94a3b8', marginLeft: '4px', fontWeight: '600' }}>
                {getPercentage(allocation[index])}%
              </span>
            </div>
          </div>
          
          <input
            type="range"
            min={minPerCategory}
            max={totalBudget - (minPerCategory * (categories.length - 1))}
            value={allocation[index]}
            onChange={(e) => handleSliderChange(index, parseInt(e.target.value))}
            style={{
              width: '100%',
              height: '5px',
              borderRadius: '2px',
              background: `linear-gradient(to right, #34d399 0%, #34d399 ${getPercentage(allocation[index])}%, #334155 ${getPercentage(allocation[index])}%, #334155 100%)`,
              outline: 'none',
              cursor: 'pointer',
              border: '1px solid #475569'
            }}
          />
        </div>
      ))}
    </div>
  );
}
