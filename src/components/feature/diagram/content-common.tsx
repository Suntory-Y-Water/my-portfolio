import {
  AlertCircle,
  ArrowDown,
  ArrowRight,
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
import { COLORS, type ColorKey, type IconName } from '@/types/diagram';

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
    arrowRight: ArrowRight,
  };
  return icons[name] || HelpCircle;
}

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

/**
 * カラーキーをカラーコードに解決するヘルパー関数
 *
 * @param key - カラーキー ('GOLD' | 'RED')
 * @returns カラーコード文字列、またはundefined（デフォルトテーマカラーを使用）
 */
export function resolveColor(key?: ColorKey): string | undefined {
  return key ? COLORS[key] : undefined;
}
