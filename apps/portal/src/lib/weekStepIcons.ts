import {
  UserSearch,
  UserPlus,
  MessageSquare,
  FolderGit2,
  Star,
  GitPullRequest,
  GitMerge,
  Sparkles,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";

const WEEK_STEP_ICONS: Record<string, LucideIcon> = {
  "follow-peers": UserPlus,
  "review-profiles": UserSearch,
  "choose-repo": FolderGit2,
  "star-repos": Star,
  "contribute-peer": GitPullRequest,
  "contribute-oss": GitMerge,
  "profile-feedback": MessageSquare,
  explore: Sparkles,
};

export function weekStepIcon(stepKey: string): LucideIcon {
  if (stepKey.startsWith("assignment-")) return ClipboardList;
  return WEEK_STEP_ICONS[stepKey] ?? Sparkles;
}
