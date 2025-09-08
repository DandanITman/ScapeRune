import { useState, useRef, useEffect } from 'react';

interface Position {
  x: number;
  y: number;
}

interface UseDraggableProps {
  initialPosition?: Position;
}

export const useDraggable = ({ initialPosition = { x: 100, y: 100 } }: UseDraggableProps = {}) => {
  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't start dragging if clicking on close button or other interactive elements
    const target = e.target as HTMLElement;
    if (target.classList.contains('close-button') || 
        target.closest('.close-button') ||
        target.tagName === 'BUTTON' ||
        target.tagName === 'INPUT') {
      return;
    }
    
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('drag-handle')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
      e.preventDefault();
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        
        // Keep panel within screen bounds
        const maxX = window.innerWidth - (elementRef.current?.offsetWidth || 600);
        const maxY = window.innerHeight - (elementRef.current?.offsetHeight || 500);
        
        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY))
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  return {
    position,
    isDragging,
    elementRef,
    handleMouseDown,
    style: {
      position: 'absolute' as const,
      left: `${position.x}px`,
      top: `${position.y}px`,
      zIndex: isDragging ? 1000 : 10,
      userSelect: 'none' as const
    }
  };
};
