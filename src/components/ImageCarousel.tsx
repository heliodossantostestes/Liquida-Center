import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const images = [
    'https://picsum.photos/seed/promo1/1200/400',
    'https://picsum.photos/seed/promo2/1200/400',
    'https://picsum.photos/seed/promo3/1200/400',
];

const ImageCarousel: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const prevSlide = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const nextSlide = () => {
        const isLastSlide = currentIndex === images.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };
    
    useEffect(() => {
        const timer = setTimeout(nextSlide, 5000);
        return () => clearTimeout(timer);
    }, [currentIndex]);

    return (
        <div className="w-full h-56 md:h-72 relative group rounded-xl overflow-hidden">
            <div
                style={{ backgroundImage: `url(${images[currentIndex]})` }}
                className="w-full h-full bg-center bg-cover duration-500"
            ></div>
            {/* Left Arrow */}
            <div className="hidden group-hover:block absolute top-1/2 -translate-y-1/2 left-5 text-2xl rounded-full p-2 bg-black/40 text-white cursor-pointer">
                <ChevronLeft onClick={prevSlide} size={30} />
            </div>
            {/* Right Arrow */}
            <div className="hidden group-hover:block absolute top-1/2 -translate-y-1/2 right-5 text-2xl rounded-full p-2 bg-black/40 text-white cursor-pointer">
                <ChevronRight onClick={nextSlide} size={30} />
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {images.map((_, index) => (
                    <div
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-3 h-3 rounded-full cursor-pointer transition-all ${currentIndex === index ? 'bg-white scale-125' : 'bg-white/50'}`}
                    ></div>
                ))}
            </div>
        </div>
    );
};

export default ImageCarousel;