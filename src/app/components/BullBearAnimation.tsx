import React, { useEffect, useRef } from 'react';

const BullBearAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation variables
    let time = 0;
    const bullX = { start: -100, end: canvas.width * 0.4 };
    const bearX = { start: canvas.width + 100, end: canvas.width * 0.6 };
    let currentBullX = bullX.start;
    let currentBearX = bearX.start;
    let bullY = canvas.height * 0.6;
    let bearY = canvas.height * 0.6;
    let phase = 'approach'; // approach, fight, retreat
    let fightTime = 0;

    const drawBull = (x: number, y: number, scale: number, isAttacking: boolean) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      // Bull body (green for bullish)
      ctx.fillStyle = '#22c55e';
      ctx.globalAlpha = 0.6;
      
      // Body
      ctx.beginPath();
      ctx.ellipse(0, 0, 60, 40, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Head
      ctx.beginPath();
      ctx.arc(50, -20, 35, 0, Math.PI * 2);
      ctx.fill();
      
      // Horns
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.moveTo(60, -40);
      ctx.lineTo(80, -70);
      ctx.lineTo(70, -35);
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(40, -45);
      ctx.lineTo(50, -75);
      ctx.lineTo(55, -40);
      ctx.fill();

      // Nose ring
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(75, -10, 8, 0, Math.PI * 2);
      ctx.stroke();

      // Angry eyes
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(55, -25, 5, 0, Math.PI * 2);
      ctx.arc(70, -25, 5, 0, Math.PI * 2);
      ctx.fill();

      // Legs (running animation)
      const legOffset = isAttacking ? Math.sin(time * 0.2) * 20 : Math.sin(time * 0.1) * 10;
      ctx.fillStyle = '#22c55e';
      
      // Front legs
      ctx.fillRect(-30 + legOffset, 30, 15, 40);
      ctx.fillRect(-10 - legOffset, 30, 15, 40);
      
      // Back legs
      ctx.fillRect(20 + legOffset, 30, 15, 40);
      ctx.fillRect(40 - legOffset, 30, 15, 40);

      // Tail
      const tailWag = Math.sin(time * 0.3) * 15;
      ctx.beginPath();
      ctx.moveTo(-60, 0);
      ctx.quadraticCurveTo(-80, -20 + tailWag, -90, -10);
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 8;
      ctx.stroke();

      // Dollar signs floating up (bull market symbol)
      if (isAttacking) {
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 30px Arial';
        ctx.fillText('$', Math.sin(time * 0.5) * 30, -60 - (time % 50));
      }

      ctx.restore();
    };

    const drawBear = (x: number, y: number, scale: number, isAttacking: boolean) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(-scale, scale); // Flip for bear facing left

      // Bear body (red for bearish)
      ctx.fillStyle = '#ef4444';
      ctx.globalAlpha = 0.6;
      
      // Body
      ctx.beginPath();
      ctx.ellipse(0, 0, 65, 45, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Head
      ctx.beginPath();
      ctx.arc(55, -25, 38, 0, Math.PI * 2);
      ctx.fill();
      
      // Ears
      ctx.beginPath();
      ctx.arc(35, -55, 15, 0, Math.PI * 2);
      ctx.arc(75, -55, 15, 0, Math.PI * 2);
      ctx.fill();

      // Angry eyes
      ctx.fillStyle = '#7f1d1d';
      ctx.beginPath();
      ctx.arc(45, -30, 6, 0, Math.PI * 2);
      ctx.arc(65, -30, 6, 0, Math.PI * 2);
      ctx.fill();

      // Claws
      ctx.fillStyle = '#1f2937';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(70 + i * 8, 10);
        ctx.lineTo(75 + i * 8, 25);
        ctx.lineTo(80 + i * 8, 10);
        ctx.fill();
      }

      // Legs (running animation)
      const legOffset = isAttacking ? Math.sin(time * 0.2 + Math.PI) * 20 : Math.sin(time * 0.1 + Math.PI) * 10;
      ctx.fillStyle = '#ef4444';
      
      // Front legs
      ctx.fillRect(-35 + legOffset, 35, 18, 45);
      ctx.fillRect(-15 - legOffset, 35, 18, 45);
      
      // Back legs
      ctx.fillRect(25 + legOffset, 35, 18, 45);
      ctx.fillRect(45 - legOffset, 35, 18, 45);

      // Lightning effects (bear market symbol)
      if (isAttacking) {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-20, -60);
        ctx.lineTo(-10, -45);
        ctx.lineTo(-15, -50);
        ctx.lineTo(-5, -35);
        ctx.stroke();
      }

      ctx.restore();
    };

    const drawParticles = () => {
      // Dust particles from fighting
      if (phase === 'fight') {
        for (let i = 0; i < 20; i++) {
          const px = (currentBullX + currentBearX) / 2 + (Math.random() - 0.5) * 100;
          const py = (bullY + bearY) / 2 + (Math.random() - 0.5) * 50;
          const size = Math.random() * 8 + 2;
          
          ctx.fillStyle = Math.random() > 0.5 ? '#22c55e' : '#ef4444';
          ctx.globalAlpha = 0.4 * (1 - (fightTime % 100) / 100);
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Animation logic
      const centerX = canvas.width / 2;
      const meetDistance = 120;

      switch (phase) {
        case 'approach':
          // Move towards each other
          currentBullX += (centerX - meetDistance - currentBullX) * 0.02;
          currentBearX += (centerX + meetDistance - currentBearX) * 0.02;
          
          // Add bounce to movement
          bullY = canvas.height * 0.6 + Math.sin(time * 0.1) * 10;
          bearY = canvas.height * 0.6 + Math.sin(time * 0.1 + Math.PI) * 10;
          
          if (Math.abs(currentBearX - currentBullX) < meetDistance + 50) {
            phase = 'fight';
            fightTime = 0;
          }
          break;

        case 'fight':
          // Fighting animation
          fightTime++;
          currentBullX = centerX - meetDistance + Math.sin(fightTime * 0.3) * 30;
          currentBearX = centerX + meetDistance - Math.sin(fightTime * 0.3) * 30;
          bullY = canvas.height * 0.6 + Math.sin(fightTime * 0.5) * 20;
          bearY = canvas.height * 0.6 + Math.cos(fightTime * 0.5) * 20;
          
          if (fightTime > 300) {
            phase = 'retreat';
          }
          break;

        case 'retreat':
          // Move back to starting positions
          currentBullX += (bullX.start - currentBullX) * 0.02;
          currentBearX += (bearX.start - currentBearX) * 0.02;
          bullY = canvas.height * 0.6 + Math.sin(time * 0.05) * 5;
          bearY = canvas.height * 0.6 + Math.sin(time * 0.05) * 5;
          
          if (Math.abs(currentBullX - bullX.start) < 5) {
            phase = 'approach';
            currentBullX = bullX.start;
            currentBearX = bearX.start;
          }
          break;
      }

      // Draw shadows
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.ellipse(currentBullX, bullY + 70, 60, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(currentBearX, bearY + 70, 60, 15, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw animals
      drawBull(currentBullX, bullY, 1, phase === 'fight');
      drawBear(currentBearX, bearY, 1, phase === 'fight');
      
      // Draw particles
      drawParticles();

      // Draw market indicators in background
      ctx.globalAlpha = 0.15;
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < canvas.width; i += 50) {
        const y = 100 + Math.sin(time * 0.02 + i * 0.01) * 50;
        if (i === 0) ctx.moveTo(i, y);
        else ctx.lineTo(i, y);
      }
      ctx.stroke();

      ctx.strokeStyle = '#ef4444';
      ctx.beginPath();
      for (let i = 0; i < canvas.width; i += 50) {
        const y = canvas.height - 100 + Math.cos(time * 0.02 + i * 0.01) * 50;
        if (i === 0) ctx.moveTo(i, y);
        else ctx.lineTo(i, y);
      }
      ctx.stroke();

      time++;
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
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.5, zIndex: 0 }}
    />
  );
};

export default BullBearAnimation;
