-- Manual update of follow counts for all profiles
-- Run this if the triggers aren't working properly

UPDATE profiles SET 
  followers_count = (
    SELECT COUNT(*) FROM follows 
    WHERE following_id = profiles.id AND status = 'accepted'
  ),
  following_count = (
    SELECT COUNT(*) FROM follows 
    WHERE follower_id = profiles.id AND status = 'accepted'
  );

-- Verify the counts are correct
SELECT 
  p.username,
  p.followers_count,
  p.following_count,
  (SELECT COUNT(*) FROM follows WHERE following_id = p.id AND status = 'accepted') as actual_followers,
  (SELECT COUNT(*) FROM follows WHERE follower_id = p.id AND status = 'accepted') as actual_following
FROM profiles p
WHERE p.followers_count > 0 OR p.following_count > 0
ORDER BY p.username;