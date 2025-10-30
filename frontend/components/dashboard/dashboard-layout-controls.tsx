"use client"

import { Button } from '@/components/ui/button'
import { Edit3, Save, RotateCcw } from 'lucide-react'

interface DashboardLayoutControlsProps {
  isEditMode: boolean
  onToggleEditMode: () => void
  onResetLayout: () => void
}

export function DashboardLayoutControls({ 
  isEditMode, 
  onToggleEditMode, 
  onResetLayout 
}: DashboardLayoutControlsProps) {
  return (
    <div className="flex items-center justify-end gap-2 mb-4">
      {isEditMode && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onResetLayout}
          className="h-8 px-3 text-xs text-gray-500 hover:text-gray-700"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Reset
        </Button>
      )}
      <Button
        variant={isEditMode ? "default" : "ghost"}
        size="sm"
        onClick={onToggleEditMode}
        className={`h-8 px-3 text-xs ${
          isEditMode 
            ? "bg-blue-600 hover:bg-blue-700 text-white" 
            : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
        }`}
      >
        {isEditMode ? (
          <>
            <Save className="h-3 w-3 mr-1" />
            Done
          </>
        ) : (
          <>
            <Edit3 className="h-3 w-3 mr-1" />
            Edit
          </>
        )}
      </Button>
    </div>
  )
}