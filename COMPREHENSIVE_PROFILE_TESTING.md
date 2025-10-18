# Comprehensive Profile Visibility Testing Guide

## 🎯 Test Setup

1. **Go to Dashboard**: `http://localhost:3000/dashboard`
2. **Click "🎯 Init Complete Test Suite"** - This creates all test users and relationships
3. **Test all scenarios below**

## 👥 Test Users & Relationships

### Current User (You)
- **Username**: `johndoe` 
- **ID**: `mock-user-id`
- **Role**: Owner of the account

### Test Users Created:

#### 1. Sarah Martinez (`sarahm`) - Mutual Follower
- **Relationship**: Mutual (you follow each other)
- **Profile**: Public
- **Visibility**: Shows most sections, hides following list

#### 2. Mike Chen (`mikechen`) - Private Profile  
- **Relationship**: You follow him (one-way)
- **Profile**: Private
- **Expected**: Should show "Profile Not Available" to non-mutuals

#### 3. Alex Partner (`alexpartner`) - Goal Partner
- **Relationship**: Goal collaboration partner
- **Profile**: Private  
- **Expected**: Can see profile but only shared goals

## 🧪 Test Scenarios

### Scenario 1: Owner View (Full Access)
**URL**: `/profile/johndoe`

**Expected Results**:
- ✅ Full access to everything
- ✅ Edit Profile and Privacy Settings buttons
- ✅ All goals visible with different visibility badges:
  - 🟢 "public" - Public Fitness Challenge
  - 🔵 "followers" - Followers Only Reading  
  - 🟣 "mutuals" - Mutuals Coding Project
  - 🔴 "private" - Private Personal Goal
  - 🟠 "partners-only" - Partner Collaboration (with 🤝 1 partner badge)
- ✅ All achievements visible
- ✅ Followers and following lists accessible
- ✅ No relationship badge (it's your profile)

### Scenario 2: Mutual Follower View
**URL**: `/profile/sarahm`

**Expected Results**:
- ✅ Profile header and bio visible
- ✅ 🔄 "Mutual" relationship badge
- ✅ Follow/Unfollow button available
- ✅ Can see goals with visibility: "public", "followers", "mutuals"
- ✅ Achievements visible
- ✅ Followers count visible
- ❌ Following count hidden (👁️‍🗨️ "Following Hidden")
- ✅ Goals show proper visibility badges

### Scenario 3: Private Profile (Non-Mutual)
**URL**: `/profile/mikechen`

**Expected Results**:
- ❌ "Profile Not Available" message
- ❌ 🔒 Lock icon displayed  
- ❌ "This profile is private" message
- ✅ Back to Dashboard button
- ❌ No access to any profile content

### Scenario 4: Goal Partner View
**URL**: `/profile/alexpartner`

**Expected Results**:
- ✅ Profile header visible (basic info only)
- ✅ 🤝 "Goal Partner" relationship badge
- ✅ Can see profile despite it being private
- ✅ Special "Shared Goals Only" section with purple banner
- ✅ Only shows goals you collaborate on together
- ❌ Cannot see their other goals
- ❌ Limited profile sections (achievements hidden, followers hidden)
- ✅ Shared goals show "Shared" badge

## 🎨 Visual Indicators to Look For

### Relationship Badges:
- 🤝 **"Goal Partner"** (Purple) - Shared goal collaboration
- 🔄 **"Mutual"** (Blue) - Mutual followers
- → **"Following"** (Outline) - One-way follow
- 🔒 **"Private"** (Gray) - Private profile indicator

### Goal Visibility Badges:
- 🟢 **"public"** - Visible to everyone
- 🔵 **"followers"** - Visible to followers
- 🟣 **"mutuals"** - Visible to mutual followers only
- 🔴 **"private"** - Owner and partners only
- 🟠 **"partners-only"** - Collaboration partners only

### Partner Indicators:
- 🤝 **"X partner(s)"** - Shows number of collaborators
- **"Shared"** badge - For goal partners viewing shared goals

## 🔍 Detailed Testing Steps

### Step 1: Initialize Test Data
```
1. Go to dashboard
2. Click "🎯 Init Complete Test Suite" 
3. Wait for success toast with user summary
```

### Step 2: Test Owner Access
```
1. Visit /profile/johndoe
2. Verify edit buttons present
3. Check all 5 goals visible with different visibility levels
4. Confirm no relationship badge shown
```

### Step 3: Test Mutual Relationship
```
1. Visit /profile/sarahm
2. Look for 🔄 "Mutual" badge
3. Verify follow/unfollow button works
4. Check followers visible, following hidden
5. Test goals visibility (should see public, followers, mutuals)
```

### Step 4: Test Private Profile Blocking
```
1. Visit /profile/mikechen  
2. Should see lock icon and "Profile Not Available"
3. Verify no profile content accessible
4. Test back button functionality
```

### Step 5: Test Goal Partner Access
```
1. Visit /profile/alexpartner
2. Look for 🤝 "Goal Partner" badge
3. Verify purple "Shared Goals Only" banner
4. Check only shared goals visible
5. Confirm limited profile sections
```

### Step 6: Test Follow Functionality
```
1. Go to /profile/sarahm
2. Click "Unfollow" button
3. Verify button changes and relationship updates
4. Click "Follow" to restore relationship
5. Check toast notifications appear
```

## 🚨 Common Issues to Check

### ❌ Problems to Watch For:
1. **Owner locked out**: Should never see "Profile Not Available" for own profile
2. **Wrong relationship badges**: Verify correct badge for each user type
3. **Goal visibility errors**: Check goals show/hide based on visibility rules
4. **Partner access issues**: Goal partners should see shared goals even on private profiles
5. **Follow state bugs**: Button should reflect current relationship status

### ✅ Success Indicators:
1. **Proper access control**: Each user type sees appropriate content
2. **Clear visual feedback**: Badges and indicators show relationship status
3. **Functional interactions**: Follow/unfollow works smoothly
4. **Goal filtering**: Only appropriate goals visible per relationship
5. **Privacy respected**: Private content properly hidden

## 🔧 Debug Tools

### Browser Console Commands:
```javascript
// Check current relationships
console.log('Follow relationships:', JSON.parse(localStorage.getItem('followRelationships')))

// Check user profiles  
console.log('User profiles:', JSON.parse(localStorage.getItem('userProfiles')))

// Check goals data
console.log('Goals:', JSON.parse(localStorage.getItem('goals')))

// Reset all test data
localStorage.clear()
location.reload()
```

### Manual Relationship Setup:
```javascript
// Make mutual with Mike (for testing)
const relationships = JSON.parse(localStorage.getItem('followRelationships') || '[]')
relationships.push({
  followerId: 'mike-chen', 
  followingId: 'mock-user-id',
  createdAt: new Date().toISOString()
})
localStorage.setItem('followRelationships', JSON.stringify(relationships))
location.reload()
```

## 📋 Testing Checklist

- [ ] Owner sees all content and edit buttons
- [ ] Mutual followers see appropriate sections
- [ ] Private profiles block non-mutuals  
- [ ] Goal partners see shared goals only
- [ ] Relationship badges display correctly
- [ ] Goal visibility badges show proper colors
- [ ] Follow/unfollow functionality works
- [ ] Hidden sections show proper indicators
- [ ] Private profile message displays correctly
- [ ] Shared goals section works for partners
- [ ] All visual indicators are clear and accurate
- [ ] Navigation between profiles works smoothly

## 🎯 Expected Outcomes Summary

| User Type | Profile Access | Goals Visible | Special Features |
|-----------|---------------|---------------|------------------|
| **Owner** | Full access | All goals | Edit buttons, no badges |
| **Mutual** | Most sections | public, followers, mutuals | 🔄 Mutual badge |
| **Follower** | Public sections | public, followers | → Following badge |
| **Non-Follower** | Public only | public only | No special badge |
| **Goal Partner** | Basic info | Shared goals only | 🤝 Partner badge, purple banner |
| **Private Profile** | Blocked | None | 🔒 Lock icon, error message |

This comprehensive testing ensures all user relationship types and visibility rules work correctly! 🚀