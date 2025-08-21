import type { AppState, ShareableData } from "@/types";

const STORAGE_KEY = "team-randomizer-data";

export function saveToLocalStorage(data: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save data to localStorage:", error);
  }
}

export function loadFromLocalStorage(): AppState | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Failed to load data from localStorage:", error);
  }
  return null;
}

export function createShareableLink(data: AppState): string {
  const shareableData: ShareableData = {
    ...data,
    timestamp: Date.now(),
  };
  
  const jsonString = JSON.stringify(shareableData);
  const base64Data = btoa(unescape(encodeURIComponent(jsonString)));
  
  const currentUrl = window.location.origin + window.location.pathname;
  return `${currentUrl}?data=${base64Data}`;
}

export function parseShareableLink(searchParams: URLSearchParams): AppState | null {
  try {
    const dataParam = searchParams.get("data");
    if (!dataParam) return null;
    
    const jsonString = decodeURIComponent(escape(atob(dataParam)));
    const shareableData: ShareableData = JSON.parse(jsonString);
    
    // Validate the data structure
    if (!shareableData.players || !Array.isArray(shareableData.players)) {
      throw new Error("Invalid data structure");
    }
    
    return {
      players: shareableData.players,
      constraints: shareableData.constraints || [],
      teams: shareableData.teams || [],
      numberOfTeams: shareableData.numberOfTeams || 2,
    };
  } catch (error) {
    console.error("Failed to parse shareable link:", error);
    return null;
  }
}

export function exportToJson(data: AppState): void {
  const shareableData: ShareableData = {
    ...data,
    timestamp: Date.now(),
  };
  
  const jsonString = JSON.stringify(shareableData, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `team-randomizer-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

export function importFromJson(file: File): Promise<AppState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const jsonString = event.target?.result as string;
        const shareableData: ShareableData = JSON.parse(jsonString);
        
        // Validate the data structure
        if (!shareableData.players || !Array.isArray(shareableData.players)) {
          throw new Error("Invalid data structure");
        }
        
        const appState: AppState = {
          players: shareableData.players,
          constraints: shareableData.constraints || [],
          teams: shareableData.teams || [],
          numberOfTeams: shareableData.numberOfTeams || 2,
        };
        
        resolve(appState);
      } catch (error) {
        reject(new Error("Failed to parse JSON file"));
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    
    reader.readAsText(file);
  });
}

export function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
