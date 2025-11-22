// This provides placeholder components for all lucide icons used in the app

import type React from "react"

interface IconProps {
  size?: number
  className?: string
  style?: React.CSSProperties
}

const createIcon = (name: string) => {
  return function Icon({ size = 24, className = "", style }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        className={className}
        style={style}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <rect width="24" height="24" fill="transparent" />
      </svg>
    )
  }
}

export const Sparkles = createIcon("Sparkles")
export const Target = createIcon("Target")
export const Users = createIcon("Users")
export const Lightbulb = createIcon("Lightbulb")
export const TrendingUp = createIcon("TrendingUp")
export const Heart = createIcon("Heart")
export const Package = createIcon("Package")
export const Building2 = createIcon("Building2")
export const MapPin = createIcon("MapPin")
export const Calendar = createIcon("Calendar")
export const Globe = createIcon("Globe")
export const CheckCircle2 = createIcon("CheckCircle2")
export const ArrowRight = createIcon("ArrowRight")
export const BookOpen = createIcon("BookOpen")
export const Award = createIcon("Award")
export const ExternalLink = createIcon("ExternalLink")
export const LogOut = createIcon("LogOut")
export const User = createIcon("User")
export const Loader2 = createIcon("Loader2")
export const ArrowLeft = createIcon("ArrowLeft")
export const Instagram = createIcon("Instagram")
export const Twitter = createIcon("Twitter")
export const Youtube = createIcon("Youtube")
export const Mail = createIcon("Mail")
export const Send = createIcon("Send")
export const Plus = createIcon("Plus")
export const Edit = createIcon("Edit")
export const Circle = createIcon("Circle")
export const PlayCircle = createIcon("PlayCircle")
export const FileText = createIcon("FileText")
export const ClipboardList = createIcon("ClipboardList")
export const DollarSign = createIcon("DollarSign")
export const Download = createIcon("Download")
export const Trash2 = createIcon("Trash2")
export const Save = createIcon("Save")
export const Palette = createIcon("Palette")
export const Video = createIcon("Video")
export const Mic = createIcon("Mic")
export const UsersIcon = createIcon("UsersIcon")
export const BookText = createIcon("BookText")
export const ChevronDownIcon = createIcon("ChevronDownIcon")
export const ChevronRightIcon = createIcon("ChevronRightIcon")
export const CheckIcon = createIcon("CheckIcon")
export const SearchIcon = createIcon("SearchIcon")
export const CircleIcon = createIcon("CircleIcon")
export const XIcon = createIcon("XIcon")
export const MinusIcon = createIcon("MinusIcon")
export const GripVerticalIcon = createIcon("GripVerticalIcon")
export const ChevronUpIcon = createIcon("ChevronUpIcon")
export const PanelLeftIcon = createIcon("PanelLeftIcon")
export const Loader2Icon = createIcon("Loader2Icon")
export const X = createIcon("X")
export const MoreHorizontal = createIcon("MoreHorizontal")
