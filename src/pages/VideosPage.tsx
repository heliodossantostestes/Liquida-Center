
import React from 'react';
import { Video, UserProfile } from '../types';
import { Heart, MessageCircle, Share2, MoreVertical } from 'lucide-react';
import QuiziGame from '../components/QuiziGame';

interface VideosPageProps {
  isInLiveQuiz: boolean;
  onLeaveLiveQuiz: () => void;
  currentUser: UserProfile | null;
  onLoginRequest: () => void;
  liveStreamUrl: string;
}

const mockVideos: Video[] = [
  { id: 1, user: '@comerciodavila', avatar: 'https://picsum.photos/seed/avatar1/48/48', url: 'https://www.w3schools.com/html/mov_bbb.mp4', description: 'Promoção imperdível na nossa loja essa semana! 🚀 #promo #local' },
  { id: 2, user: '@eventosdamaria', avatar: 'https://picsum.photos/seed/avatar2/48/48', url: 'https://www.w3schools.com/html/mov_bbb.mp4', description: 'Olha como foi o evento de sábado! Foi incrível! 🎉' },
  { id: 3, user: '@cidadenoticias', avatar: 'https://picsum.photos/seed/avatar3/48/48', url: 'https://www.w3schools.com/html/mov_bbb.mp4', description: 'Fique por dentro das novidades da prefeitura.' },
];

const VideoCard: React.FC<{ video: Video }> = ({ video }) => {
    return (
        <div className="bg-gray-800 rounded-xl overflow-hidden snap-start relative h-[80vh] flex flex-col justify-between">
             <video 
                src={video.url} 
                className="absolute top-0 left-0 w-full h-full object-cover" 
                controls 
                loop
                playsInline
             />
             <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/70 to-transparent">
                <div className="flex items-center mb-2">
                    <img src={video.avatar} alt={video.user} className="w-10 h-10 rounded-full border-2 border-brand-purple-light mr-3" />
                    <p className="font-bold text-white">{video.user}</p>
                </div>
                <p className="text-sm text-gray-200">{video.description}</p>
             </div>
             <div className="absolute right-2 bottom-20 flex flex-col items-center space-y-4">
                <button className="flex flex-col items-center text-white">
                    <Heart size={32} />
                    <span className="text-xs">1.2k</span>
                </button>
                 <button className="flex flex-col items-center text-white">
                    <MessageCircle size={32} />
                    <span className="text-xs">128</span>
                </button>
                 <button className="flex flex-col items-center text-white">
                    <Share2 size={32} />
                    <span className="text-xs">42</span>
                </button>
                 <button className="flex flex-col items-center text-white">
                    <MoreVertical size={32} />
                </button>
             </div>
        </div>
    );
};


const VideosPage: React.FC<VideosPageProps> = (props) => {
    
    if (props.isInLiveQuiz) {
        return (
            <QuiziGame
                currentUser={props.currentUser}
                onLoginRequest={props.onLoginRequest}
                onLeaveLiveQuiz={props.onLeaveLiveQuiz}
                liveStreamUrl={props.liveStreamUrl}
            />
        );
    }
    
    return (
        <div className="h-full">
            <h1 className="text-3xl font-bold mb-4 text-center">Vídeos</h1>
            <div className="snap-y snap-mandatory h-[calc(100vh-10rem)] overflow-y-scroll scrollbar-hide rounded-lg">
                {mockVideos.map(video => <VideoCard key={video.id} video={video}/>)}
            </div>
        </div>
    );
};

export default VideosPage;
