# Contact Fetching Optimization with ETag Support

## Overview

This implementation optimizes contact fetching by using ETag-based caching to avoid unnecessary API calls and contact processing when there are no changes to user data.

## Key Features

### 1. ETag-Based Caching
- Server returns ETag header with user data
- Client sends `If-None-Match` header with previous ETag
- Server returns 304 Not Modified when data hasn't changed
- Client uses cached data instead of re-processing contacts

### 2. Smart Contact Processing
- Only processes device contacts when user data has changed
- Skips processing if server returns 304 and recent sync exists
- Uses hash map for O(1) phone number lookups
- Batches contact processing for better performance

### 3. Cache Management
- 5-minute cache duration for phone map
- Automatic cache invalidation on data changes
- Manual cache refresh capabilities
- Cache status monitoring

## How It Works

### Server Side (Controller)
```javascript
export const getAllUser = async (req: Request, res: Response) => {
  const users = await userService.getAllUsers();
  
  const etag = crypto.createHash('md5').update(JSON.stringify(users)).digest('hex');
  
  if (req.headers['if-none-match'] === etag) {
    return res.status(304).end();
  }
  
  res.setHeader('ETag', etag);
  res.json(users);
};
```

### Client Side Flow

1. **Initial Load**
   - Fetch all users with ETag support
   - Build phone number hash map
   - Process device contacts in batches
   - Store results in local cache

2. **Subsequent Loads**
   - Send `If-None-Match` header with previous ETag
   - If server returns 304: use cached data, skip processing
   - If server returns 200: update cache, re-process contacts

3. **Contact Processing**
   - Only process when user data has changed
   - Use hash map for fast phone number lookups
   - Batch processing to prevent UI blocking

## API Functions

### `fetchAllUsers()`
Returns `[UserData[], boolean, boolean]`:
- `UserData[]`: Array of users
- `boolean`: Whether data was modified
- `boolean`: Whether server returned 304

### `initializeUserPhoneMap()`
Returns `[Map<string, UserData>, boolean]`:
- `Map<string, UserData>`: Phone number to user mapping
- `boolean`: Whether data was modified

### `isPhoneNumberRegistered(phoneNumber)`
Returns `UserData | null`:
- O(1) lookup using hash map
- No API calls needed

## Performance Benefits

1. **Reduced API Calls**: 304 responses eliminate unnecessary requests
2. **Faster Lookups**: Hash map provides O(1) phone number checks
3. **Efficient Processing**: Only process contacts when data changes
4. **Better UX**: No unnecessary loading states or processing delays

## Cache Management

### Automatic Cache
- 5-minute duration for phone map
- ETag-based server cache validation
- Automatic invalidation on data changes

### Manual Cache Control
```javascript
// Clear all caches
clearUserPhoneCache();

// Force refresh
const [users, wasModified] = await forceRefreshUserData();

// Check cache status
const status = getCacheStatus();
```

## Monitoring

Use `getCacheStatus()` to monitor cache health:
```javascript
{
  hasPhoneMap: boolean,
  hasETag: boolean,
  lastFetchTime: number,
  cacheAge: number,
  isExpired: boolean,
  userCount: number,
  cachedUsersCount: number
}
```

## Usage Examples

### Basic Contact Check
```javascript
const [phoneMap, wasModified] = await initializeUserPhoneMap();
const user = isPhoneNumberRegistered(phoneNumber);
```

### Force Refresh
```javascript
const [users, wasModified] = await forceRefreshUserData();
```

### Cache Status
```javascript
const status = getCacheStatus();
console.log('Cache age:', status.cacheAge);
console.log('User count:', status.userCount);
```

## Error Handling

- Network errors are caught and logged
- Fallback to API calls if hash map lookup fails
- Graceful degradation when cache is invalid
- Automatic retry mechanisms for failed requests

## Best Practices

1. **Initialize Early**: Call `initializeUserPhoneMap()` on app startup
2. **Monitor Cache**: Use `getCacheStatus()` for debugging
3. **Handle Errors**: Always wrap calls in try-catch blocks
4. **Clear When Needed**: Use `clearUserPhoneCache()` for testing
5. **Force Refresh**: Use `forceRefreshUserData()` when fresh data is critical 