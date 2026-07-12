import React, { useState, useEffect, useRef } from 'react';

export default function CounterAnimation({ end, duration = 2000, suffix = '', prefix = '', className = '' }) {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isVisible) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.3 }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => {
            if (elementRef.current) {
                observer.unobserve(elementRef.current);
            }
        };
    }, [isVisible]);

    useEffect(() => {
        if (!isVisible) return;

        let startValue = 0;
        const endValue = parseFloat(end);
        const startTime = Date.now();

        const animate = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);

            // Easing function (easeOutCubic)
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            const currentValue = startValue + (endValue - startValue) * easeProgress;
            setCount(currentValue);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }, [isVisible, end, duration]);

    const formatNumber = (num) => {
        // Handle special suffixes like Cr, K, %
        if (suffix === 'Cr' || suffix === 'K') {
            return num.toFixed(1);
        }
        if (suffix === '%') {
            return Math.round(num);
        }
        return Math.round(num).toLocaleString('en-IN');
    };

    return (
        <span ref={elementRef} className={className}>
            {prefix}{formatNumber(count)}{suffix}
        </span>
    );
}
