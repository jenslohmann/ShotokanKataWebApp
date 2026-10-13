// The ONLY file that imports lucide-react. Maps app icon names and iOS SF Symbols to lucide icons.
import {
  ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, AudioLines, Award, Ban, Book, BookA, BookOpen, Brain, Check,
  ChevronDown, ChevronLeft, ChevronRight, ChevronsUp, ChevronUp, Circle, CircleArrowRight, CircleArrowUp,
  CircleCheck, CirclePlay, CircleQuestionMark, CircleX, Clock, Crown, Download, Dumbbell, Eye, Flag, Footprints,
  GitBranch, Hammer, Hand, HandGrab, House, Info, Languages, Lightbulb, Link, List, ListFilter, ListOrdered, Medal,
  Pause, PersonStanding, RotateCw, Search, Settings, Share, Shield, ShieldHalf, ShieldOff, SlidersHorizontal,
  Sparkles, Square, SquarePlay, Star, StarHalf, Swords, Target, UserPlus, Volume2, Wind, X, Zap,
  type LucideIcon,
} from 'lucide-react';

const ICONS = {
  kata: PersonStanding,
  quiz: CircleQuestionMark,
  vocabulary: BookOpen,
  about: Info,
  search: Search,
  clear: CircleX,
  chevronRight: ChevronRight,
  chevronLeft: ChevronLeft,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  sliders: SlidersHorizontal,
  filter: ListFilter,
  speaker: Volume2,
  speakerOn: AudioLines,
  link: Link,
  external: ArrowUpRight,
  play: CirclePlay,
  video: SquarePlay,
  check: Check,
  checkCircle: CircleCheck,
  xCircle: CircleX,
  circle: Circle,
  clock: Clock,
  flag: Flag,
  home: House,
  pause: Pause,
  lightbulb: Lightbulb,
  brain: Brain,
  star: Star,
  starHalf: StarHalf,
  award: Award,
  crown: Crown,
  history: BookOpen,
  techniques: Hand,
  sequences: CircleArrowRight,
  applications: Target,
  ranks: Medal,
  kataOrder: ListOrdered,
  terminology: BookA,
  philosophy: Brain,
  info: Info,
  list: List,
  book: Book,
  language: Languages,
  github: GitBranch,
  share: Share,
  download: Download,
  'vocab.general': BookOpen,
  'vocab.etiquette': Sparkles,
  'vocab.titles': UserPlus,
  'vocab.techniques': Swords,
  'vocab.stances': PersonStanding,
  'vocab.blocks': Shield,
  'vocab.punches': Hand,
  'vocab.kicks': Footprints,
  'vocab.training': Dumbbell,
  'vocab.ranks': Medal,
  'vocab.equipment': Settings,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  label?: string;
}

function renderIcon(Component: LucideIcon, size: number, className?: string, label?: string, mirrored = false) {
  return (
    <Component
      size={size}
      className={className}
      style={mirrored ? { transform: 'scaleX(-1)' } : undefined}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
      focusable="false"
    />
  );
}

export function Icon({ name, size = 20, className, label }: IconProps) {
  return renderIcon(ICONS[name], size, className, label);
}

const SF_SYMBOLS: Record<string, LucideIcon> = {
  'hand.raised.fill': Hand,
  'hand.raised.fingers.spread.fill': HandGrab,
  'hand.raised.slash.fill': Ban,
  'hand.wave.fill': Wind,
  'hand.point.left.fill': ArrowLeft,
  'hand.point.right.fill': ArrowRight,
  'hand.point.up.fill': ArrowUp,
  'shield.fill': Shield,
  'shield.lefthalf.filled': ShieldHalf,
  'shield.righthalf.filled': ShieldHalf,
  'shield.slash.fill': ShieldOff,
  'arrow.forward.circle.fill': CircleArrowRight,
  'arrow.up.circle.fill': CircleArrowUp,
  'arrow.clockwise.circle.fill': RotateCw,
  'hammer.fill': Hammer,
  'burst.fill': Zap,
  'eye.fill': Eye,
  'figure.jump': ChevronsUp,
  'figure.kick': Footprints,
  'figure.martial.arts': PersonStanding,
  'figure.stand': PersonStanding,
  'stop.fill': Square,
  xmark: X,
};

const MIRRORED_SF_SYMBOLS = new Set(['shield.righthalf.filled']);

export function MoveIcon({ sfSymbol, size = 20, className }: { sfSymbol: string; size?: number; className?: string }) {
  return renderIcon(SF_SYMBOLS[sfSymbol] ?? Circle, size, className, undefined, MIRRORED_SF_SYMBOLS.has(sfSymbol));
}
