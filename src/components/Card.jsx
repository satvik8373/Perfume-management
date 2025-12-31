export default function Card({ children, className = "", hover = false, glow = false }) {
  return (
    <div className={`
      glassmorphism shadow-lg
      ${hover ? 'hover:shadow-xl hover:scale-[1.02] transition-all duration-500 ease-out' : ''}
      ${glow ? 'shadow-2xl' : ''}
      ${className}
    `}>
      {children}
      <style>{`
        .glassmorphism {
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(251, 146, 60, 0.2);
          border-radius: 0.75rem;
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}