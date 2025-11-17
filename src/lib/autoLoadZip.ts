import { importZipFromUrl } from './zipHelpers';
import { clearWorkspace } from './workspaceHelpers';

/**
 * Automatically load a zip file from URL if specified in environment
 * This will clear the workspace and import the zip file
 */
export async function autoLoadZipFromUrl(): Promise<boolean> {
  const zipUrl = import.meta.env.VITE_AUTO_LOAD_ZIP_URL;
  
  if (!zipUrl) {
    return false;
  }
  
  try {
    console.log('Auto-loading zip from:', zipUrl);
    
    // Clear existing workspace
    await clearWorkspace();
    
    // Import the zip
    const result = await importZipFromUrl(zipUrl);
    
    console.log(`Auto-loaded ${result.imported} files (${result.skipped} skipped)`);
    return true;
  } catch (error) {
    console.error('Failed to auto-load zip:', error);
    return false;
  }
}
