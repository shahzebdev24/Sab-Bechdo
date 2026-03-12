/**
 * Avatar utility functions
 */

/**
 * Generate avatar URL with proper initials
 * Takes first and last name initials (e.g., "Muhammad Hasan Alam" -> "MA")
 */
export const getAvatarUrl = (name: string, size: number = 200): string => {
  if (!name) return `https://ui-avatars.com/api/?name=User&size=${size}&background=4A54DF&color=fff&bold=true`;
  
  // Split name and get first and last word
  const nameParts = name.trim().split(/\s+/);
  let initials = '';
  
  if (nameParts.length === 1) {
    // Single name: use first letter
    initials = nameParts[0].charAt(0);
  } else {
    // Multiple names: use first letter of first name and first letter of last name
    initials = nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0);
  }
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=${size}&background=4A54DF&color=fff&bold=true&length=2`;
};
