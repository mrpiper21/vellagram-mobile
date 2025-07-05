import { API_ENDPOINTS } from "@/config/api";
import { normalizeIdentifiers } from "@/helpers/normalizeIdentifiers";
import axios from "axios";

// Type for user data from API
export interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  profilePicture?: string;
  // Add other fields as needed
}

// Hash map for efficient phone number lookups
let userPhoneMap: Map<string, UserData> | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

/**
 * Fetch all users and create a hash map for efficient phone number lookups
 * Uses ETag caching to avoid unnecessary API calls and processing
 * Returns [users, wasModified, notModified] where:
 * - users: array of users
 * - wasModified: boolean indicating if data changed (true = new/modified data, false = no changes)
 * - notModified: boolean indicating if server returned 304 (true = 304, false = 200)
 */
let cachedUsers: UserData[] = [];
let lastETag: string | null = null;

export const fetchAllUsers = async (): Promise<[UserData[], boolean, boolean]> => {
  try {
    const headers: Record<string, string> = {};
    if (lastETag) {
      headers['If-None-Match'] = lastETag;
    }

    const response = await axios.get(`${API_ENDPOINTS.AUTH.ALLUSERS}`, {
      headers,
      validateStatus: (status) => status === 200 || status === 304,
    });

    if (response.status === 304) {
      // Not Modified - use cached data, no processing needed
      console.log("📱 Server returned 304 - using cached users data");
      return [cachedUsers, false, true];
    }

    if (response.data.success) {
      // New/modified data received
      const newUsers = response.data.users;
      const newETag = response.headers['etag'] || null;
      
      // Check if data actually changed (compare with cached data)
      const dataChanged = !lastETag || lastETag !== newETag;
      
      // Update cache and ETag
      cachedUsers = newUsers;
      lastETag = newETag;
      
      console.log(`📱 Fetched all users: ${newUsers.length} (${dataChanged ? 'modified' : 'unchanged'})`);
      return [newUsers, dataChanged, false];
    }

    return [[], false, false];
  } catch (error) {
    console.error("❌ Error fetching all users:", error);
    throw error;
  }
};

/**
 * Initialize or refresh the user phone hash map
 * This should be called once when the app starts or when cache expires
 * Returns [phoneMap, wasModified] where wasModified indicates if data changed
 */
export const initializeUserPhoneMap = async (): Promise<[Map<string, UserData>, boolean]> => {
  const now = Date.now();
  
  // Return cached map if it's still valid
  if (userPhoneMap && (now - lastFetchTime) < CACHE_DURATION) {
    console.log("📱 Using cached user phone map");
    return [userPhoneMap, false];
  }

  console.log("📱 Building user phone hash map...");
  const [users, wasModified, notModified] = await fetchAllUsers();
  
  // If server returned 304 and we have a cached map, return it
  if (notModified && userPhoneMap) {
    console.log("📱 Using cached phone map due to 304 response");
    return [userPhoneMap, false];
  }
  
  // If no data changed and we have a cached map, return it
  if (!wasModified && userPhoneMap) {
    console.log("📱 Using cached phone map - no data changes");
    return [userPhoneMap, false];
  }
  
  // Create new hash map for O(1) phone number lookups
  userPhoneMap = new Map();
  
  users.forEach(user => {
    if (user.phone) {
      // Generate all possible variations of the phone number using normalizeIdentifiers
      const variations = normalizeIdentifiers(user.phone);
      
      // Store each variation in the map
      variations.forEach(variation => {
        userPhoneMap!.set(variation, user);
      });
      
      console.log(`📱 User ${user.firstName} ${user.lastName}: ${user.phone} -> [${variations.join(', ')}]`);
    }
  });
  
  lastFetchTime = now;
  console.log(`📱 User phone map built with ${userPhoneMap.size} entries (${wasModified ? 'modified' : 'unchanged'})`);
  
  return [userPhoneMap, wasModified];
}

/**
 * Check if a phone number is registered using the local hash map
 * O(1) lookup - much faster than API calls
 */
export const isPhoneNumberRegistered = (phoneNumber: string): UserData | null => {
  if (!userPhoneMap) {
    console.warn("⚠️ User phone map not initialized. Call initializeUserPhoneMap() first.");
    return null;
  }
  
  // Generate all possible variations of the input phone number using normalizeIdentifiers
  const variations = normalizeIdentifiers(phoneNumber);
  
  // Check each variation against the user map
  for (const variation of variations) {
    const user = userPhoneMap.get(variation);
    if (user) {
      console.log(`✅ Found registered user: ${user.firstName} ${user.lastName} for phone ${phoneNumber} (matched variation: ${variation})`);
      return user;
    }
  }
  
  console.log(`❌ No registered user found for phone: ${phoneNumber} (tried variations: [${variations.join(', ')}])`);
  return null;
}

/**
 * Test function to verify phone number normalization
 * Call this to debug phone number matching issues
 */
export const testPhoneNumberNormalization = (phoneNumber: string) => {
  console.log(`🧪 Testing phone number normalization for: ${phoneNumber}`);
  const variations = normalizeIdentifiers(phoneNumber);
  console.log(`📱 Generated variations: [${variations.join(', ')}]`);
  
  if (userPhoneMap) {
    console.log(`📊 Current user phone map has ${userPhoneMap.size} entries`);
    console.log(`🔍 Checking each variation against user map:`);
    
    variations.forEach(variation => {
      const user = userPhoneMap!.get(variation);
      if (user) {
        console.log(`✅ Match found: ${variation} -> ${user.firstName} ${user.lastName}`);
      } else {
        console.log(`❌ No match: ${variation}`);
      }
    });
  } else {
    console.log(`⚠️ User phone map not initialized`);
  }
}

/**
 * Get all registered users from the hash map
 */
export const getAllRegisteredUsers = (): UserData[] => {
  if (!userPhoneMap) {
    return [];
  }
  return Array.from(userPhoneMap.values());
}

/**
 * Clear the cache to force a fresh fetch
 */
export const clearUserPhoneCache = (): void => {
  userPhoneMap = null;
  lastFetchTime = 0;
  lastETag = null;
  cachedUsers = [];
  console.log("📱 User phone cache cleared");
}

/**
 * Force refresh the user data (ignores cache)
 * Useful when you need fresh data regardless of ETag
 */
export const forceRefreshUserData = async (): Promise<[UserData[], boolean]> => {
  // Clear ETag to force fresh fetch
  lastETag = null;
  const [users, wasModified, notModified] = await fetchAllUsers();
  return [users, wasModified];
}

/**
 * Check if the cache is valid and up to date
 * Returns true if cache is valid, false if it needs refresh
 */
export const isCacheValid = (): boolean => {
  const now = Date.now();
  return !!(userPhoneMap && (now - lastFetchTime) < CACHE_DURATION);
}

/**
 * Get cache status information
 * Useful for debugging and monitoring
 */
export const getCacheStatus = () => {
  const now = Date.now();
  return {
    hasPhoneMap: !!userPhoneMap,
    hasETag: !!lastETag,
    lastFetchTime,
    cacheAge: now - lastFetchTime,
    isExpired: (now - lastFetchTime) >= CACHE_DURATION,
    userCount: userPhoneMap?.size || 0,
    cachedUsersCount: cachedUsers.length
  };
}

/**
 * Manually trigger a cache refresh
 * Useful for testing or when you need to force update
 */
export const refreshCache = async (): Promise<[Map<string, UserData>, boolean]> => {
  console.log("🔄 Manually refreshing user cache...");
  clearUserPhoneCache();
  return await initializeUserPhoneMap();
}

// Example: when a user selects or searches for a contact
async function handleContactSearch(phoneNumber: string) {
  // Ensure the hash map is initialized
  const [phoneMap, wasModified] = await initializeUserPhoneMap();
  
  // Check if phone number is registered (O(1) operation)
  const registeredUser = isPhoneNumberRegistered(phoneNumber);
  
  if (registeredUser) {
    console.log("✅ User is registered:", registeredUser.firstName, registeredUser.lastName);
    // Update UI to show registered status
  } else {
    console.log("❌ User is not registered");
    // Update UI to show unregistered status
  }
}
