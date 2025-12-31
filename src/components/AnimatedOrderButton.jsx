import { useState } from 'react';
import { createPortal } from 'react-dom';

export default function AnimatedOrderButton({ onOrderComplete, disabled = false }) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    if (disabled || isAnimating) return;
    
    setIsAnimating(true);
    
    // Call the order completion callback after animation starts
    setTimeout(() => {
      onOrderComplete?.();
    }, 100);
    
    // Reset animation after 10 seconds
    setTimeout(() => {
      setIsAnimating(false);
    }, 10000);
  };

  const animationOverlay = isAnimating ? createPortal(
    <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center">
      <div className="flex flex-col items-center">
        <button 
          className={`order-button animate`}
          disabled={true}
        >
          <span className="default">Complete Order</span>
          <span className="success">
            Order Placed
            <svg viewBox="0 0 12 10">
              <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
            </svg>
          </span>
          <div className="box"></div>
          <div className="truck">
            <div className="back"></div>
            <div className="front">
              <div className="window"></div>
            </div>
            <div className="light top"></div>
            <div className="light bottom"></div>
          </div>
          <div className="lines"></div>
        </button>
        
        <p className="text-white text-lg font-medium mt-8 animate-pulse">
          Processing your order...
        </p>
      </div>

      <style jsx>{`
        .order-button {
          appearance: none;
          border: 0;
          background: #1C212E;
          position: relative;
          height: 50px;
          width: 200px;
          padding: 0;
          outline: none;
          cursor: pointer;
          border-radius: 25px;
          -webkit-mask-image: -webkit-radial-gradient(white, black);
          -webkit-tap-highlight-color: transparent;
          overflow: hidden;
          transition: transform 0.3s ease;
        }

        .order-button:disabled {
          cursor: not-allowed;
        }

        .order-button span {
          --o: 1;
          position: absolute;
          left: 0;
          right: 0;
          text-align: center;
          top: 15px;
          line-height: 20px;
          color: #FFF;
          font-size: 14px;
          font-weight: 500;
          opacity: var(--o);
          transition: opacity 0.3s ease;
        }

        .order-button span.default {
          transition-delay: 0.3s;
        }

        .order-button span.success {
          --offset: 16px;
          --o: 0;
        }

        .order-button span.success svg {
          width: 10px;
          height: 8px;
          display: inline-block;
          vertical-align: top;
          fill: none;
          margin: 6px 0 0 3px;
          stroke: #16BF78;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 16px;
          stroke-dashoffset: var(--offset);
          transition: stroke-dashoffset 0.3s ease;
        }

        .order-button .lines {
          opacity: 0;
          position: absolute;
          height: 2px;
          background: #FFF;
          border-radius: 1px;
          width: 5px;
          top: 24px;
          left: 100%;
          box-shadow: 12px 0 0 #FFF, 24px 0 0 #FFF, 36px 0 0 #FFF, 48px 0 0 #FFF, 60px 0 0 #FFF, 72px 0 0 #FFF, 84px 0 0 #FFF, 96px 0 0 #FFF, 108px 0 0 #FFF, 120px 0 0 #FFF, 132px 0 0 #FFF, 144px 0 0 #FFF, 156px 0 0 #FFF, 168px 0 0 #FFF, 180px 0 0 #FFF, 192px 0 0 #FFF, 204px 0 0 #FFF, 216px 0 0 #FFF, 228px 0 0 #FFF, 240px 0 0 #FFF, 252px 0 0 #FFF, 264px 0 0 #FFF;
        }

        .order-button .back, .order-button .box {
          --start: #FFF;
          --stop: #CDD9ED;
          border-radius: 2px;
          background: linear-gradient(var(--start), var(--stop));
          position: absolute;
        }

        .order-button .truck {
          width: 50px;
          height: 34px;
          left: 100%;
          z-index: 1;
          top: 8px;
          position: absolute;
          transform: translateX(20px);
        }

        .order-button .truck:before, .order-button .truck:after {
          --r: -90deg;
          content: '';
          height: 2px;
          width: 16px;
          right: 48px;
          position: absolute;
          display: block;
          background: #FFF;
          border-radius: 1px;
          transform-origin: 100% 50%;
          transform: rotate(var(--r));
        }

        .order-button .truck:before {
          top: 3px;
        }

        .order-button .truck:after {
          --r: 90deg;
          bottom: 3px;
        }

        .order-button .truck .back {
          left: 0;
          top: 0;
          width: 50px;
          height: 34px;
          z-index: 1;
        }

        .order-button .truck .front {
          overflow: hidden;
          position: absolute;
          border-radius: 2px 7px 7px 2px;
          width: 22px;
          height: 34px;
          left: 50px;
        }

        .order-button .truck .front:before, .order-button .truck .front:after {
          content: '';
          position: absolute;
          display: block;
        }

        .order-button .truck .front:before {
          height: 11px;
          width: 2px;
          left: 0;
          top: 12px;
          background: linear-gradient(#6C7486, #3F4656);
        }

        .order-button .truck .front:after {
          border-radius: 2px 7px 7px 2px;
          background: #275EFE;
          width: 20px;
          height: 34px;
          right: 0;
        }

        .order-button .truck .front .window {
          overflow: hidden;
          border-radius: 2px 6px 6px 2px;
          background: #7699FF;
          transform: perspective(3px) rotateY(3deg);
          width: 18px;
          height: 34px;
          position: absolute;
          left: 2px;
          top: 0;
          z-index: 1;
          transform-origin: 0 50%;
        }

        .order-button .truck .front .window:before, .order-button .truck .front .window:after {
          content: '';
          position: absolute;
          right: 0;
        }

        .order-button .truck .front .window:before {
          top: 0;
          bottom: 0;
          width: 12px;
          background: #1C212E;
        }

        .order-button .truck .front .window:after {
          width: 12px;
          top: 6px;
          height: 3px;
          position: absolute;
          background: rgba(255, 255, 255, 0.14);
          transform: skewY(14deg);
          box-shadow: 0 6px 0 rgba(255, 255, 255, 0.14);
        }

        .order-button .truck .light {
          width: 2px;
          height: 6px;
          left: 69px;
          transform-origin: 100% 50%;
          position: absolute;
          border-radius: 1px;
          transform: scaleX(0.8);
          background: #f0dc5f;
        }

        .order-button .truck .light:before {
          content: '';
          height: 3px;
          width: 6px;
          opacity: 0;
          transform: perspective(2px) rotateY(-15deg) scaleX(0.94);
          position: absolute;
          transform-origin: 0 50%;
          left: 2px;
          top: 50%;
          margin-top: -1px;
          background: linear-gradient(90deg, #f0dc5f, rgba(240, 220, 95, 0.7), rgba(240, 220, 95, 0));
        }

        .order-button .truck .light.top {
          top: 3px;
        }

        .order-button .truck .light.bottom {
          bottom: 3px;
        }

        .order-button .box {
          --start: #EDD9A9;
          --stop: #DCB773;
          width: 18px;
          height: 18px;
          right: 100%;
          top: 16px;
        }

        .order-button .box:before, .order-button .box:after {
          content: '';
          top: 8px;
          position: absolute;
          left: 0;
          right: 0;
        }

        .order-button .box:before {
          height: 2px;
          margin-top: -1px;
          background: rgba(0, 0, 0, 0.1);
        }

        .order-button .box:after {
          height: 1px;
          background: rgba(0, 0, 0, 0.15);
        }

        .order-button.animate .default {
          --o: 0;
          transition-delay: 0s;
        }

        .order-button.animate .success {
          --offset: 0;
          --o: 1;
          transition-delay: 7s;
        }

        .order-button.animate .success svg {
          transition-delay: 7.3s;
        }

        .order-button.animate .truck {
          animation: truck 10s ease forwards;
        }

        .order-button.animate .truck:before {
          animation: door1 2.4s ease forwards 0.3s;
        }

        .order-button.animate .truck:after {
          animation: door2 2.4s ease forwards 0.6s;
        }

        .order-button.animate .truck .light:before {
          animation: light 10s ease forwards;
        }

        .order-button.animate .box {
          animation: box 10s ease forwards;
        }

        .order-button.animate .lines {
          animation: lines 10s ease forwards;
        }

        @keyframes truck {
          10%, 30% {
            transform: translateX(-137px);
          }
          40% {
            transform: translateX(-87px);
          }
          60% {
            transform: translateX(-187px);
          }
          75%, 100% {
            transform: translateX(20px);
          }
        }

        @keyframes lines {
          0%, 30% {
            opacity: 0;
            transform: scaleY(0.7) translateX(0);
          }
          35%, 65% {
            opacity: 1;
          }
          70% {
            opacity: 0;
          }
          100% {
            transform: scaleY(0.7) translateX(-333px);
          }
        }

        @keyframes light {
          0%, 30% {
            opacity: 0;
            transform: perspective(2px) rotateY(-15deg) scaleX(0.88);
          }
          40%, 100% {
            opacity: 1;
            transform: perspective(2px) rotateY(-15deg) scaleX(0.94);
          }
        }

        @keyframes door1 {
          30%, 50% {
            transform: rotate(32deg);
          }
        }

        @keyframes door2 {
          30%, 50% {
            transform: rotate(-32deg);
          }
        }

        @keyframes box {
          8%, 10% {
            transform: translateX(33px);
            opacity: 1;
          }
          25% {
            transform: translateX(93px);
            opacity: 1;
          }
          26% {
            transform: translateX(93px);
            opacity: 0;
          }
          27%, 100% {
            transform: translateX(0px);
            opacity: 0;
          }
        }
      `}</style>
    </div>,
    document.body
  ) : null;

  return (
    <>
      {/* Regular Button */}
      {!isAnimating && (
        <button 
          className="flex items-center justify-center rounded-xl h-12 px-6 bg-green-500 hover:bg-green-600 text-white font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
          onClick={handleClick}
          disabled={disabled}
        >
          <span className="material-symbols-outlined mr-2">check</span>
          Place Order
        </button>
      )}

      {/* Full Screen Animation Overlay */}
      {animationOverlay}
    </>
  );
}