import React, { useEffect, useRef } from 'react';

interface Candlestick {
  x: number;
  open: number;
  close: number;
  high: number;
  low: number;
  color: string;
}

const CandlestickBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const candlesRef = useRef<Candlestick[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize candlesticks
    const initCandles = () => {
      const candles: Candlestick[] = [];
      const candleWidth = 12;
      const gap = 8;
      const numCandles = Math.ceil(canvas.width / (candleWidth + gap)) + 5;
      
      let prevClose = canvas.height * 0.5;
      
      for (let i = 0; i < numCandles; i++) {
        const volatility = 30;
        const trend = (Math.random() - 0.5) * 20;
        const open = prevClose + trend;
        const close = open + (Math.random() - 0.5) * volatility * 2;
        const high = Math.max(open, close) + Math.random() * volatility;
        const low = Math.min(open, close) - Math.random() * volatility;
        
        candles.push({
          x: i * (candleWidth + gap),
          open,
          close,
          high,
          low,
          color: close > open ? '#22c55e' : '#ef4444'
        });
        
        prevClose = close;
      }
      
      candlesRef.current = candles;
    };

    initCandles();

    let offset = 0;
    const speed = 0.5;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const candleWidth = 12;
      const wickWidth = 2;
      
      candlesRef.current.forEach((candle) => {
        const x = candle.x - offset;
        
        // Wrap around for infinite scroll
        const wrappedX = ((x % (canvas.width + 100)) + (canvas.width + 100)) % (canvas.width + 100) - 50;
        
        if (wrappedX > -50 && wrappedX < canvas.width + 50) {
          // Draw wick
          ctx.fillStyle = candle.color;
          ctx.globalAlpha = 0.5;
          ctx.fillRect(wrappedX + (candleWidth - wickWidth) / 2, candle.low, wickWidth, candle.high - candle.low);
          
          // Draw body
          const bodyTop = Math.min(candle.open, candle.close);
          const bodyHeight = Math.abs(candle.close - candle.open);
          ctx.fillRect(wrappedX, bodyTop, candleWidth, Math.max(bodyHeight, 2));
          
          // Glow effect
          ctx.shadowColor = candle.color;
          ctx.shadowBlur = 10;
          ctx.fillRect(wrappedX, bodyTop, candleWidth, Math.max(bodyHeight, 2));
          ctx.shadowBlur = 0;
        }
      });
      
      ctx.globalAlpha = 1;
      
      offset += speed;
      if (offset > 100) {
        offset = 0;
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.5 }}
    />
  );
};

export default CandlestickBackground;
