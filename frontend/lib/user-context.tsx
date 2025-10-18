"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  username: string
  firstName: string
  lastName: string
  email?: string
}

interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
  isLoading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initialize current user from localStorage or default
    try {
      const kycData = localStorage.getItem('kycData')
      if (kycData) {
        const profile = JSON.parse(kycData)
        setUser({
          id: 'mock-user-id',
          username: 'johndoe',
          firstName: profile.firstName || 'John',
          lastName: profile.lastName || 'Doe',
          email: profile.email
        })
      } else {
        // Default user
        setUser({
          id: 'mock-user-id',
          username: 'johndoe',
          firstName: 'John',
          lastName: 'Doe'
        })
      }
    } catch {
      // Default user on error
      setUser({
        id: 'mock-user-id',
        username: 'johndoe',
        firstName: 'John',
        lastName: 'Doe'
      })
    }
    setIsLoading(false)
  }, [])

  return (
    <UserContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}