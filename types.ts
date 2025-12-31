
export interface UserProfile {
  id: string;
  name: string;
  age: number;
  bio: string;
  images: string[];
  interests: string[];
  jobTitle: string;
  distance: string;
}

export interface UserPreferences {
  ageRange: [number, number];
  maxDistance: number;
  interests: string[];
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}

export interface Match {
  id: string;
  user: UserProfile;
  messages: Message[];
  lastMessage?: string;
}

export interface GeminiResponse {
  text: string;
}
