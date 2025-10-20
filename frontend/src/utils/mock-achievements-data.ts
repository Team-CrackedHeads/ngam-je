import type { LucideIcon } from "lucide-react";
import {
  Trophy,
  Star,
  Zap,
  Briefcase,
  Users,
  ListChecks,
  ShieldCheck,
  Rocket,
  Camera,
  Target,
  Award,
  Clock,
} from "lucide-react";

export interface Achievement {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  unlocked: boolean;
  unlockedAt?: string;
}

export const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-sale",
    label: "First Sale",
    description: "Complete your first successful sale",
    icon: Trophy,
    unlocked: true,
    unlockedAt: "Jan 15, 2024",
  },
  {
    id: "trusted-seller",
    label: "Trusted Seller",
    description: "Achieve a 4.5+ rating with 10+ reviews",
    icon: Star,
    unlocked: true,
    unlockedAt: "Feb 20, 2024",
  },
  {
    id: "fast-responder",
    label: "Fast Responder",
    description: "Respond to messages within 5 minutes",
    icon: Zap,
    unlocked: true,
    unlockedAt: "Mar 10, 2024",
  },
  {
    id: "deal-master",
    label: "Deal Master",
    description: "Complete 25 successful deals",
    icon: Briefcase,
    unlocked: true,
    unlockedAt: "Apr 5, 2024",
  },
  {
    id: "community-helper",
    label: "Community Helper",
    description: "Help 10 users in the forums",
    icon: Users,
    unlocked: false,
  },
  {
    id: "power-lister",
    label: "Power Lister",
    description: "Create 50+ active listings",
    icon: ListChecks,
    unlocked: false,
  },
  {
    id: "verified-pro",
    label: "Verified Pro",
    description: "Complete identity verification",
    icon: ShieldCheck,
    unlocked: true,
    unlockedAt: "Jan 10, 2024",
  },
  {
    id: "early-adopter",
    label: "Early Adopter",
    description: "Join during the beta period",
    icon: Rocket,
    unlocked: true,
    unlockedAt: "Jan 1, 2024",
  },
  {
    id: "photo-pro",
    label: "Photo Pro",
    description: "Upload high-quality photos to 20+ listings",
    icon: Camera,
    unlocked: false,
  },
  {
    id: "negotiator",
    label: "Negotiator",
    description: "Successfully negotiate 15 deals",
    icon: Target,
    unlocked: false,
  },
  {
    id: "five-star",
    label: "Five Star",
    description: "Maintain a 5.0 rating with 20+ reviews",
    icon: Award,
    unlocked: false,
  },
  {
    id: "speed-seller",
    label: "Speed Seller",
    description: "Sell an item within 24 hours of listing",
    icon: Clock,
    unlocked: true,
    unlockedAt: "Feb 1, 2024",
  },
];

export const getUnlockedAchievements = () =>
  MOCK_ACHIEVEMENTS.filter(a => a.unlocked);

export const getAchievementStats = () => ({
  unlocked: MOCK_ACHIEVEMENTS.filter(a => a.unlocked).length,
  total: MOCK_ACHIEVEMENTS.length,
});
