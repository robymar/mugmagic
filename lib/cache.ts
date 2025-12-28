/**
 * Simple In-Memory Cache System
 * Provides TTL-based caching with automatic cleanup
 * 
 * Note: This is suitable for single-instance deployments.
 * For multi-instance/production use Redis or similar distributed cache.
 */

interface CacheEntry<T> {
    value: T;
    expiresAt: number;
}

interface CacheStats {
    hits: number;
    misses: number;
    size: number;
    hitRate: number;
}

class SimpleCache {
    private cache = new Map<string, CacheEntry<any>>();
    private stats = {
        hits: 0,
        misses: 0
    };
    private maxSize: number;

    constructor(maxSize: number = 1000) {
        this.maxSize = maxSize;

        // Cleanup expired entries every 5 minutes
        setInterval(() => {
            this.cleanup();
        }, 5 * 60 * 1000);
    }

    /**
     * Get value from cache
     * @param key - Cache key
     * @returns Cached value or null if expired/not found
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) {
            this.stats.misses++;
            return null;
        }

        // Check if expired
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            this.stats.misses++;
            return null;
        }

        this.stats.hits++;
        return entry.value as T;
    }

    /**
     * Set value in cache
     * @param key - Cache key
     * @param value - Value to cache
     * @param ttlSeconds - Time to live in seconds (default 5 minutes)
     */
    set<T>(key: string, value: T, ttlSeconds: number = 300): void {
        // Enforce max size - evict oldest entries if needed
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey) {
                this.cache.delete(firstKey);
            }
        }

        const expiresAt = Date.now() + (ttlSeconds * 1000);
        this.cache.set(key, { value, expiresAt });
    }

    /**
     * Delete specific key from cache
     * @param key - Cache key to delete
     */
    delete(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Delete keys matching pattern
     * @param pattern - Pattern to match (supports wildcards with *)
     */
    deletePattern(pattern: string): number {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        let deleted = 0;

        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.cache.delete(key);
                deleted++;
            }
        }

        return deleted;
    }

    /**
     * Clear all cache entries
     */
    clear(): void {
        this.cache.clear();
        this.stats.hits = 0;
        this.stats.misses = 0;
    }

    /**
     * Remove expired entries
     */
    private cleanup(): void {
        const now = Date.now();
        let cleaned = 0;

        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiresAt) {
                this.cache.delete(key);
                cleaned++;
            }
        }

        if (cleaned > 0) {
            console.log(`[Cache] Cleaned ${cleaned} expired entries`);
        }
    }

    /**
     * Get cache statistics
     */
    getStats(): CacheStats {
        const total = this.stats.hits + this.stats.misses;
        const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;

        return {
            hits: this.stats.hits,
            misses: this.stats.misses,
            size: this.cache.size,
            hitRate: Math.round(hitRate * 100) / 100
        };
    }

    /**
     * Get or set pattern - fetch from cache or compute and cache
     * @param key - Cache key
     * @param fetchFn - Function to fetch data if not cached
     * @param ttlSeconds - Cache TTL in seconds
     */
    async getOrSet<T>(
        key: string,
        fetchFn: () => Promise<T>,
        ttlSeconds: number = 300
    ): Promise<T> {
        // Try to get from cache
        const cached = this.get<T>(key);
        if (cached !== null) {
            return cached;
        }

        // Fetch and cache
        const value = await fetchFn();
        this.set(key, value, ttlSeconds);
        return value;
    }
}

// Export singleton instance
export const cache = new SimpleCache();

// Export type for external use
export type { CacheStats };
