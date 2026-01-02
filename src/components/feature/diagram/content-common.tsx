import {
  AlertCircle,
  ArrowDown,
  CheckCircle,
  Flag,
  HelpCircle,
  Lightbulb,
  MessageCircle,
  PenTool,
  Search,
  Target,
  Users,
  Zap,
} from 'lucide-react';
import React from 'react';
import type { IconName } from '@/types/diagram';

// ==========================================
// 🛠 HELPER FUNCTIONS
// ==========================================

function getIconComponent(name: IconName): React.ElementType {
  const icons: Record<string, React.ElementType> = {
    alert: AlertCircle,
    check: CheckCircle,
    help: HelpCircle,
    arrow: ArrowDown,
    lightbulb: Lightbulb,
    zap: Zap,
    message: MessageCircle,
    target: Target,
    users: Users,
    search: Search,
    pen: PenTool,
    flag: Flag,
  };
  return icons[name] || HelpCircle;
}

// ==========================================
// 🧩 UI COMPONENTS
// ==========================================

type IconProps = {
  name: IconName;
  size?: number;
  className?: string;
  color?: string;
  style?: React.CSSProperties;
};

export function Icon({
  name,
  size = 24,
  className = '',
  color,
  style,
}: IconProps) {
  const IconComponent = getIconComponent(name);
  return (
    <IconComponent
      size={size}
      className={className}
      color={color}
      style={style}
    />
  );
}

type FormattedTextProps = {
  text: string;
};

export function FormattedText({ text }: FormattedTextProps) {
  if (!text) {
    return null;
  }
  return (
    <>
      {text.split('\n').map((line, i) => (
        <React.Fragment key={i}>
          {i > 0 && <br />}
          {line}
        </React.Fragment>
      ))}
    </>
  );
}
