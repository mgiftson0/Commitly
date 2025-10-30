"use client"

import { useState, useEffect } from 'react'

export type DashboardSection = 
  | 'active-goals'
  | 'recent-activity'
  | 'upcoming-deadlines'
  | 'category-progress'
  | 'quick-actions'
  | 'partner-activities'

const DEFAULT_LAYOUT: DashboardSection[] = [
  'active-goals',
  'recent-activity',
  'upcoming-deadlines',
  'category-progress',
  'quick-actions',
  'partner-activities'
]

export function useDashboardLayout() {
  const [layout, setLayout] = useState<DashboardSection[]>(DEFAULT_LAYOUT)
  const [isEditMode, setIsEditMode] = useState(false)

  // Load saved layout from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('dashboard-layout')
      if (saved) {
        const parsedLayout = JSON.parse(saved)
        // Validate layout contains all required sections
        if (parsedLayout.length === DEFAULT_LAYOUT.length && 
            DEFAULT_LAYOUT.every(section => parsedLayout.includes(section))) {
          setLayout(parsedLayout)
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard layout:', error)
    }
  }, [])

  // Save layout to localStorage
  const saveLayout = (newLayout: DashboardSection[]) => {
    try {
      localStorage.setItem('dashboard-layout', JSON.stringify(newLayout))
      setLayout(newLayout)
    } catch (error) {
      console.error('Failed to save dashboard layout:', error)
    }
  }

  const resetLayout = () => {
    saveLayout(DEFAULT_LAYOUT)
  }

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode)
  }

  return {
    layout,
    isEditMode,
    setLayout: saveLayout,
    resetLayout,
    toggleEditMode
  }
}