
import React from 'react';
import { UserProfile } from '../types';
import { MapPin, Briefcase, Info } from 'lucide-react';

interface ProfileCardProps {
  profile: UserProfile;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  return (
    <div className="relative w-full h-[600px] rounded-3xl overflow-hidden shadow-2xl bg-white border border-gray-100 group">
      <img 
        src={profile.images[0]} 
        alt={profile.name} 
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div className="flex items-end justify-between mb-2">
          <h2 className="text-3xl font-bold">
            {profile.name}, <span className="font-light">{profile.age}</span>
          </h2>
          <button className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-colors">
            <Info className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm font-medium opacity-90">
            <Briefcase className="w-4 h-4 mr-2" />
            {profile.jobTitle}
          </div>
          <div className="flex items-center text-sm font-medium opacity-90">
            <MapPin className="w-4 h-4 mr-2" />
            {profile.distance}
          </div>
        </div>
        
        <p className="text-sm line-clamp-2 mb-4 opacity-80 leading-relaxed">
          {profile.bio}
        </p>
        
        <div className="flex flex-wrap gap-2">
          {profile.interests.map((interest, idx) => (
            <span 
              key={idx} 
              className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold"
            >
              {interest}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
