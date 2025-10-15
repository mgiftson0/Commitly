# Development Guidelines

## Code Quality Standards

### File Structure and Naming
- **Client Components**: Use `"use client"` directive at the top of files requiring client-side functionality
- **File Extensions**: Use `.tsx` for React components, `.ts` for TypeScript utilities
- **Component Names**: PascalCase for component files and function names (e.g., `CreateGoalPage`, `DrawerContent`)
- **Variable Names**: camelCase for variables and functions (e.g., `goalType`, `handleSubmit`)
- **Constants**: UPPER_SNAKE_CASE for constants (e.g., `THEMES`)

### Import Organization
- **External Libraries**: Import first (React, Next.js, UI libraries)
- **UI Components**: Import shadcn/ui components with `@/components/ui/` prefix
- **Internal Components**: Import with `@/components/` prefix
- **Backend Utilities**: Import with `@/backend/` prefix
- **Utilities**: Import utilities last (e.g., `@/lib/utils`)

### TypeScript Patterns
- **Type Definitions**: Define interfaces and types inline or import from backend
- **Generic Types**: Use generic constraints for reusable components
- **Props Typing**: Use `React.ComponentProps<>` for extending native element props
- **State Typing**: Explicitly type useState with complex objects

## Component Architecture

### React Component Structure
```tsx
"use client" // If client-side functionality needed

import statements...

export default function ComponentName() {
  // State declarations
  const [state, setState] = useState<Type>(initialValue)
  
  // Event handlers
  const handleEvent = async (e: React.FormEvent) => {
    // Implementation
  }
  
  // Render
  return (
    <MainLayout>
      {/* Component JSX */}
    </MainLayout>
  )
}
```

### State Management Patterns
- **Local State**: Use `useState` for component-specific state
- **Form State**: Use controlled components with individual state variables
- **Complex State**: Use object state with spread operator for updates
- **Async Operations**: Use loading states and error handling

### Event Handling
- **Form Submission**: Always prevent default with `e.preventDefault()`
- **Async Handlers**: Use try-catch blocks for error handling
- **State Updates**: Use functional updates for state dependent on previous state
- **Mock vs Real**: Implement dual paths for mock and real data operations

## UI Component Patterns

### shadcn/ui Integration
- **Component Composition**: Compose complex UI from primitive components
- **Styling**: Use `cn()` utility for conditional class names
- **Props Forwarding**: Forward props using spread operator `{...props}`
- **Slot Pattern**: Use `data-slot` attributes for component identification

### Styling Conventions
- **Tailwind Classes**: Use utility-first approach with Tailwind CSS
- **Responsive Design**: Use responsive prefixes (`sm:`, `md:`, `lg:`)
- **Conditional Styling**: Use template literals with `cn()` for dynamic classes
- **Custom CSS**: Minimal custom CSS, prefer Tailwind utilities

### Layout Patterns
- **Main Layout**: Wrap pages in `<MainLayout>` component
- **Grid Systems**: Use CSS Grid (`grid`, `grid-cols-*`) for complex layouts
- **Flexbox**: Use Flexbox (`flex`, `items-center`, `justify-between`) for alignment
- **Spacing**: Use consistent spacing scale (`space-y-*`, `gap-*`)

## Data Handling

### API Integration
- **Supabase Client**: Use `getSupabaseClient()` for database operations
- **Mock System**: Implement mock data paths with `isMockAuthEnabled()`
- **Error Handling**: Use try-catch blocks with user-friendly error messages
- **Loading States**: Show loading indicators during async operations

### Form Handling
- **Controlled Components**: Use controlled inputs with state
- **Validation**: Implement client-side validation with required fields
- **Submission**: Handle both mock and real submission paths
- **User Feedback**: Use toast notifications for success/error feedback

### State Synchronization
- **Optimistic Updates**: Update UI immediately, then sync with backend
- **Data Fetching**: Use useEffect for initial data loading
- **Real-time Updates**: Implement Supabase subscriptions where needed
- **Cache Management**: Reload data after mutations

## Error Handling and User Experience

### Error Management
- **Try-Catch Blocks**: Wrap async operations in try-catch
- **User Notifications**: Use `toast.error()` for error feedback
- **Fallback UI**: Provide fallback content for error states
- **Console Logging**: Log errors to console for debugging

### Loading States
- **Button States**: Disable buttons and show loading indicators
- **Page Loading**: Use loading state for initial data fetching
- **Skeleton UI**: Consider skeleton screens for better UX
- **Progress Indicators**: Show progress for multi-step operations

### Accessibility
- **Semantic HTML**: Use proper HTML elements and ARIA attributes
- **Keyboard Navigation**: Ensure keyboard accessibility
- **Screen Readers**: Provide appropriate labels and descriptions
- **Focus Management**: Handle focus states properly

## Performance Optimization

### React Optimization
- **useMemo**: Memoize expensive calculations
- **useCallback**: Memoize event handlers when needed
- **Component Splitting**: Split large components into smaller ones
- **Lazy Loading**: Use dynamic imports for code splitting

### Bundle Optimization
- **Tree Shaking**: Import only needed functions from libraries
- **Dynamic Imports**: Use dynamic imports for large dependencies
- **Image Optimization**: Use Next.js Image component
- **CSS Optimization**: Use Tailwind's purge functionality

## Testing and Development

### Development Practices
- **Mock Data**: Implement comprehensive mock data system
- **Environment Detection**: Use environment flags for different behaviors
- **Hot Reloading**: Leverage Next.js hot reloading for development
- **TypeScript**: Use strict TypeScript configuration

### Code Organization
- **Feature Grouping**: Group related components and utilities
- **Separation of Concerns**: Separate UI, logic, and data layers
- **Reusable Components**: Create reusable UI components
- **Utility Functions**: Extract common logic into utility functions

## Security and Best Practices

### Data Security
- **Input Validation**: Validate all user inputs
- **SQL Injection**: Use parameterized queries through Supabase
- **Authentication**: Implement proper authentication checks
- **Authorization**: Use Row Level Security (RLS) policies

### Code Security
- **Environment Variables**: Use environment variables for sensitive data
- **Client-Side Security**: Never expose sensitive data on client
- **HTTPS**: Use HTTPS in production
- **Content Security Policy**: Implement CSP headers