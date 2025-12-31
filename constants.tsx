
import { UserProfile } from './types';

export const MOCK_PROFILES: UserProfile[] = [
  {
    id: '1',
    name: 'Elena',
    age: 26,
    bio: 'Digital nomad & amateur chef. I believe the best way to explore a city is through its street food. Looking for someone to join my next adventure!',
    images: ['https://picsum.photos/seed/elena/800/1200'],
    interests: ['Travel', 'Cooking', 'Photography', 'Art'],
    jobTitle: 'UX Designer',
    distance: '3 miles away'
  },
  {
    id: '2',
    name: 'Marcus',
    age: 29,
    bio: 'Software engineer by day, musician by night. If you like jazz and late-night coding sessions, we might just get along.',
    images: ['https://picsum.photos/seed/marcus/800/1200'],
    interests: ['Music', 'Coding', 'Jazz', 'Coffee'],
    jobTitle: 'Fullstack Developer',
    distance: '5 miles away'
  },
  {
    id: '3',
    name: 'Sofia',
    age: 24,
    bio: 'Yoga instructor and nature lover. My favorite place is anywhere I can see the sunset. Plant mom of 23.',
    images: ['https://picsum.photos/seed/sofia/800/1200'],
    interests: ['Yoga', 'Hiking', 'Plants', 'Wellness'],
    jobTitle: 'Wellness Coach',
    distance: '8 miles away'
  },
  {
    id: '4',
    name: 'Julian',
    age: 31,
    bio: 'History buff and bookworm. Always ready for a museum trip or a deep conversation about philosophy. Coffee is non-negotiable.',
    images: ['https://picsum.photos/seed/julian/800/1200'],
    interests: ['Books', 'Museums', 'History', 'Philosophy'],
    jobTitle: 'Archivist',
    distance: '2 miles away'
  },
  {
    id: '5',
    name: 'Claire',
    age: 27,
    bio: 'Adrenaline junkie! Skydiving, rock climbing, you name it. Looking for a partner in crime.',
    images: ['https://picsum.photos/seed/claire/800/1200'],
    interests: ['Climbing', 'Skydiving', 'Adventure', 'Fitness'],
    jobTitle: 'Event Producer',
    distance: '12 miles away'
  }
];

export const CURRENT_USER: UserProfile = {
  id: 'me',
  name: 'Alex',
  age: 28,
  bio: 'Tech enthusiast and dog lover. Exploring the world of AI and building cool things.',
  images: ['https://picsum.photos/seed/me/800/1200'],
  interests: ['Technology', 'AI', 'Dogs', 'Surfing'],
  jobTitle: 'Product Manager',
  distance: '0 miles away'
};
