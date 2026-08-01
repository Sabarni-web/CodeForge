import { useEffect, useState, useRef } from "react";
import "./AnimatedBackground.css";

export default function AnimatedBackground() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX / innerWidth - 0.5) * 2;
      const y = (clientY / innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const embers = useRef(
    Array.from({ length: 16 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 7 + Math.random() * 8,
      size: 2 + Math.random() * 4,
    }))
  ).current;

  return (
    <div className="animated-background-wrapper" aria-hidden="true">
      <div className="cf-noise" />
      <div className="cf-hero__bg">
        <div 
          className="cf-orb cf-orb--violet" 
          style={{ transform: `translate(${mousePos.x * -15}px, ${mousePos.y * -15}px) scale(1.1)` }}
        />
        <div 
          className="cf-orb cf-orb--pink" 
          style={{ transform: `translate(${mousePos.x * 12}px, ${mousePos.y * 12}px) scale(1)` }}
        />
        <div 
          className="cf-orb cf-orb--blue" 
          style={{ transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px) scale(0.9)` }}
        />
        <div className="cf-grid" />
        <div className="cf-embers">
          {embers.map((e) => (
            <span
              key={e.id}
              className="cf-ember"
              style={{
                left: `${e.left}%`,
                width: `${e.size}px`,
                height: `${e.size}px`,
                animationDelay: `${e.delay}s`,
                animationDuration: `${e.duration}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
