function RiskBadge({ level, size = 'default' }) {
  const getBadgeStyles = () => {
    const baseClasses = size === 'small' 
      ? 'px-2 py-0.5 text-xs' 
      : 'px-3 py-1 text-sm';

    switch (level?.toLowerCase()) {
      case 'high':
      case 'high risk':
        // High Risk - Strong red background and text
        return `${baseClasses} border-none`;
      case 'moderate':
        // Moderate Risk - Strong amber/yellow background and text
        return `${baseClasses} border-none`;
      case 'low':
      case 'low risk':
        // Low Risk - Strong green background and text
        return `${baseClasses} border-none`;
      case 'minimal':
      case 'minimal risk':
        // Minimal Risk - Blue background and text
        return `${baseClasses} border-none`;
      default:
        // Unknown - Grey background and text
        return `${baseClasses} border-none`;
    }
  };

  const getColors = () => {
    switch (level?.toLowerCase()) {
      case 'high':
      case 'high risk':
        return { bg: '#FEE2E2', text: '#DC2626', dot: '#DC2626' };
      case 'moderate':
        return { bg: '#FEF3C7', text: '#D97706', dot: '#D97706' };
      case 'low':
      case 'low risk':
        return { bg: '#DCFCE7', text: '#16A34A', dot: '#16A34A' };
      case 'minimal':
      case 'minimal risk':
        return { bg: '#DBEAFE', text: '#2563EB', dot: '#2563EB' };
      default:
        return { bg: '#F1F5F9', text: '#475569', dot: '#475569' };
    }
  };

  const getLabel = () => {
    switch (level?.toLowerCase()) {
      case 'high':
      case 'high risk':
        return 'High Risk';
      case 'moderate':
        return 'Moderate Risk';
      case 'low':
      case 'low risk':
        return 'Low Risk';
      case 'minimal':
      case 'minimal risk':
        return 'Minimal Risk';
      default:
        return level || 'Unknown';
    }
  };

  const colors = getColors();

  return (
    <span 
      className={`inline-flex items-center rounded-full font-medium ${getBadgeStyles()}`}
      style={{ 
        backgroundColor: colors.bg, 
        color: colors.text 
      }}
    >
      <span 
        className="w-1.5 h-1.5 rounded-full mr-2"
        style={{ backgroundColor: colors.dot }}
      ></span>
      {getLabel()}
    </span>
  );
}

export default RiskBadge;
