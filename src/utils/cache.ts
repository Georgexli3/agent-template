import * as fs from 'fs';
import * as path from 'path';

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
  key: string;
}

interface CacheConfig {
  location: number;
  weather: number;
  restaurants: number;
  attractions: number;
}

class HybridCache {
  private memoryCache = new Map<string, CacheEntry>();
  private cacheDir = path.join(process.cwd(), '.cache');
  
  private readonly TTL: CacheConfig = {
    location: 24 * 60 * 60 * 1000,
    weather: 30 * 60 * 1000,
    restaurants: 7 * 24 * 60 * 60 * 1000,
    attractions: 7 * 24 * 60 * 60 * 1000,
  };

  constructor() {
    this.ensureCacheDir();
    this.loadFromFiles();
  }

  private ensureCacheDir() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  private loadFromFiles() {
    try {
      const files = fs.readdirSync(this.cacheDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.cacheDir, file);
          const content = fs.readFileSync(filePath, 'utf8');
          const entry: CacheEntry = JSON.parse(content);
          
          if (!this.isExpired(entry)) {
            this.memoryCache.set(entry.key, entry);
          } else {
            fs.unlinkSync(filePath);
          }
        }
      }
    } catch (error) {
      console.warn('Cache loading warning:', error instanceof Error ? error.message : String(error));
    }
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private getCacheFileName(key: string): string {
    return path.join(this.cacheDir, `${key.replace(/[^a-zA-Z0-9]/g, '_')}.json`);
  }

  private saveToFile(entry: CacheEntry) {
    try {
      const fileName = this.getCacheFileName(entry.key);
      fs.writeFileSync(fileName, JSON.stringify(entry, null, 2));
    } catch (error) {
      console.warn('Cache save warning:', error instanceof Error ? error.message : String(error));
    }
  }

  get(key: string): any | null {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;
    
    if (this.isExpired(entry)) {
      this.memoryCache.delete(key);
      try {
        fs.unlinkSync(this.getCacheFileName(key));
      } catch (error) {
      }
      return null;
    }
    
    return entry.data;
  }

  set(key: string, data: any, type: keyof CacheConfig) {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl: this.TTL[type],
      key,
    };
    
    this.memoryCache.set(key, entry);
    this.saveToFile(entry);
  }

  generateLocationKey(): string {
    return 'user_location';
  }

  generateWeatherKey(location: string): string {
    const date = new Date().toISOString().split('T')[0];
    const hour = new Date().getHours();
    return `weather_${location}_${date}_${hour}`;
  }

  generateRestaurantsKey(location: string): string {
    return `restaurants_${location}`;
  }

  generateAttractionsKey(location: string): string {
    return `attractions_${location}`;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear() {
    this.memoryCache.clear();
    try {
      const files = fs.readdirSync(this.cacheDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          fs.unlinkSync(path.join(this.cacheDir, file));
        }
      }
    } catch (error) {
      console.warn('Cache clear warning:', error instanceof Error ? error.message : String(error));
    }
  }
}

export const cache = new HybridCache();
