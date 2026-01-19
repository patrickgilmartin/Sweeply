import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import { AppConfig, DEFAULT_CONFIG } from '@tinder-clear/shared';
import { APP_DATA_DIR, CONFIG_FILE } from '@tinder-clear/shared';

export class ConfigManager {
  private configPath: string;
  private config: AppConfig;

  constructor() {
    // Determine data directory path
    const userDataPath = app.getPath('userData');
    const dataDir = path.join(userDataPath, APP_DATA_DIR);
    
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    this.configPath = path.join(userDataPath, CONFIG_FILE);
    this.config = this.loadConfig();
  }

  private getDefaultScanPaths(): string[] {
    const userHomePath = app.getPath('home');
    const pictures = app.getPath('pictures');
    const documents = app.getPath('documents');
    const desktop = app.getPath('desktop');
    const downloads = path.join(userHomePath, 'Downloads');
    const videos = path.join(userHomePath, 'Videos');
    const music = app.getPath('music');
    
    const defaultPaths: string[] = [];
    
    // Add common Windows folders if they exist
    if (fs.existsSync(pictures)) defaultPaths.push(pictures);
    if (fs.existsSync(documents)) defaultPaths.push(documents);
    if (fs.existsSync(desktop)) defaultPaths.push(desktop);
    if (fs.existsSync(downloads)) defaultPaths.push(downloads);
    if (fs.existsSync(videos)) defaultPaths.push(videos);
    if (fs.existsSync(music)) defaultPaths.push(music);
    
    return defaultPaths;
  }

  private loadConfig(): AppConfig {
    // Get default deleted folder path in user's home directory
    const userHomePath = app.getPath('home');
    const defaultDeletedFolder = path.join(userHomePath, 'Media_Cleanup_Deleted');
    const defaultScanPaths = this.getDefaultScanPaths();
    
    // Ensure default deleted folder exists
    if (!fs.existsSync(defaultDeletedFolder)) {
      fs.mkdirSync(defaultDeletedFolder, { recursive: true });
    }
    
    // Create config with defaults
    const configWithDefaults: AppConfig = {
      ...DEFAULT_CONFIG,
      deletedFolder: defaultDeletedFolder,
      scanPaths: defaultScanPaths
    };
    
    if (fs.existsSync(this.configPath)) {
      try {
        const configData = fs.readFileSync(this.configPath, 'utf-8');
        const loaded = JSON.parse(configData);
        
        // Always use default Windows scan paths - ignore saved config
        // This ensures auto-detection works immediately without setup
        console.log('Old config had scan paths:', loaded.scanPaths);
        console.log('Forcing default Windows folders:', defaultScanPaths);
        
        // Merge with defaults - ALWAYS use default scan paths for auto-detection
        const merged = {
          ...configWithDefaults,
          ...loaded,
          scanPaths: defaultScanPaths  // Force defaults - ignore saved paths
        };
        
        // If deletedFolder is empty or not set, use default
        if (!merged.deletedFolder) {
          merged.deletedFolder = defaultDeletedFolder;
        }
        
        // Ensure deleted folder exists
        if (!fs.existsSync(merged.deletedFolder)) {
          fs.mkdirSync(merged.deletedFolder, { recursive: true });
        }
        
        console.log('Final config scan paths:', merged.scanPaths);
        return merged;
      } catch (error) {
        console.error('Error loading config:', error);
        console.log('Using default config with paths:', defaultScanPaths);
        return configWithDefaults;
      }
    }
    console.log('No config file found, using defaults with paths:', defaultScanPaths);
    return configWithDefaults;
  }

  public getConfig(): AppConfig {
    return { ...this.config };
  }

  public updateConfig(updates: Partial<AppConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
  }

  public saveConfig(): void {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving config:', error);
      throw error;
    }
  }

  public getConfigPath(): string {
    return this.configPath;
  }

  public isFirstRun(): boolean {
    return !fs.existsSync(this.configPath) || 
           !this.config.scanPaths.length || 
           !this.config.deletedFolder;
  }
}
