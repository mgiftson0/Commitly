# Profile Visibility Testing Guide

## Overview
This guide helps you test how different user types (owners, visitors, followers) see profile pages based on visibility settings.

## Test Users Available

### 1. John Doe (Owner - You)
- **Username**: `johndoe`
- **User ID**: `mock-user-id`
- **Visibility**: Public profile with all sections visible
- **URL**: `/profile/johndoe`

### 2. Sarah Martinez (Public User)
- **Username**: `sarahm`
- **User ID**: `sarah-martinez`
- **Visibility**: Public profile, following list hidden
- **URL**: `/profile/sarahm`

### 3. Mike Chen (Friends Only)
- **Username**: `mikechen`
- **User ID**: `mike-chen`
- **Visibility**: Friends only, streaks and progress hidden
- **URL**: `/profile/mikechen`

## Testing Scenarios

### Scenario 1: Owner View (Your Own Profile)
**URL**: `/profile/johndoe`

**Expected Behavior**:
- ✅ Full access to all profile sections
- ✅ Edit Profile and Privacy Settings buttons visible
- ✅ All goals visible (public, restricted, private)
- ✅ All achievements visible
- ✅ Followers and following lists accessible
- ✅ No follow/unfollow button (it's your profile)

### Scenario 2: Public Profile as Visitor
**URL**: `/profile/sarahm`

**Expected Behavior**:
- ✅ Profile header and bio visible
- ✅ Follow button available
- ✅ Public and restricted goals visible (if following)
- ✅ Achievements visible
- ✅ Followers count visible, following count hidden (👁️‍🗨️ "Following Hidden")
- ✅ Sample goals with different visibility levels

### Scenario 3: Friends-Only Profile as Non-Follower
**URL**: `/profile/mikechen`

**Expected Behavior**:
- ❌ "Profile Not Available" message
- ❌ Lock icon displayed
- ❌ "This profile is private" message
- ✅ Back to Dashboard button

### Scenario 4: Friends-Only Profile as Follower
**URL**: `/profile/mikechen` (after following)

**Expected Behavior**:
- ✅ Profile header visible
- ✅ Unfollow button available
- ✅ Goals visible (respects individual goal visibility)
- ✅ Achievements visible
- ❌ Streaks hidden (👁️‍🗨️ "Streaks Hidden")
- ❌ Progress hidden (👁️‍🗨️ "Progress Hidden")
- ✅ Followers and following lists visible

## Step-by-Step Testing Instructions

### Step 1: Test Owner View
1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000/profile/johndoe`
3. Verify you see:
   - Edit Profile and Privacy Settings buttons
   - All profile sections visible
   - No follow button

### Step 2: Test Public Profile
1. Navigate to `http://localhost:3000/profile/sarahm`
2. Verify you see:
   - Follow button
   - Profile information visible
   - "Following Hidden" indicator
   - Goals and achievements visible

### Step 3: Test Private Profile (Non-Follower)
1. Navigate to `http://localhost:3000/profile/mikechen`
2. Verify you see:
   - Lock icon and "Profile Not Available" message
   - Cannot access any profile content

### Step 4: Test Follow Functionality
1. Go to `/profile/sarahm`
2. Click "Follow" button
3. Verify:
   - Button changes to "Unfollow"
   - Toast notification appears
   - Follow counts update

### Step 5: Test Private Profile (As Follower)
1. First follow Mike Chen (you'll need to simulate this in localStorage)
2. Navigate to `/profile/mikechen`
3. Verify you can now see the profile with limited sections

## Manual Follow Relationship Setup

To test follower scenarios, you can manually set up relationships:

### Add Follow Relationship in Browser Console:
```javascript
// Follow Mike Chen
const relationships = JSON.parse(localStorage.getItem('followRelationships') || '[]')
relationships.push({
  followerId: 'mock-user-id',
  followingId: 'mike-chen',
  createdAt: new Date().toISOString()
})
localStorage.setItem('followRelationships', JSON.stringify(relationships))

// Refresh the page to see changes
location.reload()
```

### Remove Follow Relationship:
```javascript
// Unfollow Mike Chen
const relationships = JSON.parse(localStorage.getItem('followRelationships') || '[]')
const filtered = relationships.filter(r => 
  !(r.followerId === 'mock-user-id' && r.followingId === 'mike-chen')
)
localStorage.setItem('followRelationships', JSON.stringify(filtered))
location.reload()
```

## Privacy Settings Testing

### Test Privacy Controls:
1. Go to `/settings/privacy`
2. Change visibility settings:
   - Profile Visibility: Public → Friends → Private
   - Toggle individual sections (streaks, achievements, etc.)
3. Navigate to your profile `/profile/johndoe`
4. Open in incognito mode to test as visitor

### Expected Privacy Behaviors:

#### Public Profile:
- Anyone can view
- Respects individual section toggles

#### Friends Profile:
- Only followers can view
- Shows "Profile Not Available" to non-followers

#### Private Profile:
- Nobody can view (except owner)
- Always shows "Profile Not Available"

## Visual Indicators to Look For

### 🔒 Privacy Indicators:
- Lock icon for private profiles
- 👁️‍🗨️ "Hidden" labels for restricted sections
- Follow/Unfollow button states

### 📊 Content Visibility:
- Goals filtered by visibility (public/restricted/private)
- Achievement grids (3x2 layout)
- Follow counts (hidden when privacy enabled)

### 🎯 Interactive Elements:
- Follow button functionality
- Modal dialogs for followers/following lists
- Navigation between profiles

## Common Issues to Check

### ❌ Potential Problems:
1. **Follow button not updating**: Check localStorage persistence
2. **Private profiles accessible**: Verify visibility logic
3. **Hidden sections showing**: Check section-level permissions
4. **Follow counts incorrect**: Verify count calculation
5. **Modal lists empty**: Check follow relationship loading

### ✅ Success Criteria:
1. Owner sees everything
2. Visitors respect privacy settings
3. Followers see appropriate content
4. Hidden sections show indicators
5. Follow functionality works smoothly

## Browser Developer Tools

### Useful Console Commands:
```javascript
// Check current user profiles
console.log(JSON.parse(localStorage.getItem('userProfiles')))

// Check follow relationships
console.log(JSON.parse(localStorage.getItem('followRelationships')))

// Reset all data
localStorage.clear()
location.reload()
```

## Testing Checklist

- [ ] Owner view shows all content
- [ ] Public profiles accessible to all
- [ ] Private profiles blocked for non-followers
- [ ] Friends-only profiles work correctly
- [ ] Follow/unfollow functionality works
- [ ] Hidden sections show appropriate indicators
- [ ] Privacy settings affect profile visibility
- [ ] Modal dialogs work for followers/following
- [ ] Navigation between profiles works
- [ ] Mobile responsiveness maintained

## Notes

- The system uses localStorage for mock data
- Refresh the page after making manual changes
- Use browser incognito mode to test as different users
- Check browser console for any errors
- Test on different screen sizes for responsiveness