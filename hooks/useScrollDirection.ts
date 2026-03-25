import { useState, useEffect } from 'react';

export function useScrollDirection() {
    const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');

    useEffect(() => {
        let lastScrollY = window.pageYOffset;
        let ticking = false;

        const updateScrollDirection = () => {
            const scrollY = window.pageYOffset;

            // Only trigger hide/show if scrolled more than a threshold
            if (Math.abs(scrollY - lastScrollY) < 10) {
                ticking = false;
                return;
            }

            // If scrolling down and we aren't at the very top
            if (scrollY > lastScrollY && scrollY > 50) {
                setScrollDirection('down');
            } 
            // If scrolling up or at the very top
            else if (scrollY < lastScrollY || scrollY <= 50) {
                setScrollDirection('up');
            }

            lastScrollY = scrollY > 0 ? scrollY : 0;
            ticking = false;
        };

        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(updateScrollDirection);
                ticking = true;
            }
        };

        window.addEventListener('scroll', onScroll);

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return scrollDirection;
}
