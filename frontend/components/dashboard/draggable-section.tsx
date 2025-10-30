"use client"

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DraggableSectionProps {
  id: string
  children: React.ReactNode
  isEditMode: boolean
  className?: string
}

export function DraggableSection({ id, children, isEditMode, className }: DraggableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group transition-all duration-200 h-full",
        isDragging && "z-50 opacity-70 scale-105 shadow-2xl",
        isEditMode && "ring-1 ring-blue-200 rounded-lg",
        className
      )}
      {...attributes}
    >
      {isEditMode && (
        <div
          {...listeners}
          className="absolute -top-2 -right-2 z-20 bg-blue-500 hover:bg-blue-600 text-white p-1 rounded-full cursor-grab active:cursor-grabbing shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100"
        >
          <GripVertical className="h-3 w-3" />
        </div>
      )}
      <div className={cn(
        "h-full transition-all duration-200",
        isEditMode && "pointer-events-none"
      )}>
        {children}
      </div>
    </div>
  )
}