import { useState, useRef, useEffect } from 'react';
import { Brain, Play, Pause, Timer, Waves, Sparkles, Info, Volume2 } from 'lucide-react';

interface WaveOption {
  id: string;
  name: string;
  frequency: number;
  description: string;
  duration: number;
  color: string;
  bgGradient: string;
  icon: React.ReactNode;
}

const waveOptions: WaveOption[] = [
  {
    id: 'alpha',
    name: 'Alpha Waves',
    frequency: 10,
    description: '10 Hz - Use while trading for calm and focused mind state. Enhances concentration and reduces stress.',
    duration: 0,
    color: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-500/20 to-cyan-500/20',
    icon: <Waves className="w-8 h-8" />
  },
  {
    id: 'theta',
    name: 'Theta Waves',
    frequency: 6,
    description: '6 Hz (4-8 Hz range) - Use before trading for deep relaxation and mental preparation. 10 minute session.',
    duration: 600,
    color: 'from-purple-500 to-pink-500',
    bgGradient: 'from-purple-500/20 to-pink-500/20',
    icon: <Sparkles className="w-8 h-8" />
  }
];

export default function MindHealth() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.5);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (!isInitialized) {
      setIsInitialized(true);
    }
  };

  const createBinauralBeat = (frequency: number) => {
    if (!audioContextRef.current) return;

    // Stop any existing audio
    stopAudio();

    const ctx = audioContextRef.current;
    
    // Create gain node for volume control
    gainNodeRef.current = ctx.createGain();
    gainNodeRef.current.gain.value = volume;
    gainNodeRef.current.connect(ctx.destination);

    // Left ear: base frequency
    const leftOsc = ctx.createOscillator();
    leftOsc.type = 'sine';
    leftOsc.frequency.value = 200; // Base carrier frequency

    // Right ear: base frequency + binaural beat
    const rightOsc = ctx.createOscillator();
    rightOsc.type = 'sine';
    rightOsc.frequency.value = 200 + frequency; // 200 + 10 = 210 Hz for alpha

    // Create stereo panner for left ear
    const leftPanner = ctx.createStereoPanner();
    leftPanner.pan.value = -1; // Full left

    // Create stereo panner for right ear
    const rightPanner = ctx.createStereoPanner();
    rightPanner.pan.value = 1; // Full right

    // Connect left ear
    leftOsc.connect(leftPanner);
    leftPanner.connect(gainNodeRef.current);

    // Connect right ear
    rightOsc.connect(rightPanner);
    rightPanner.connect(gainNodeRef.current);

    // Start oscillators
    leftOsc.start();
    rightOsc.start();

    oscillatorsRef.current = [leftOsc, rightOsc];
  };

  const stopAudio = () => {
    oscillatorsRef.current.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
        // Already stopped
      }
    });
    oscillatorsRef.current = [];
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };

  const togglePlay = (wave: WaveOption) => {
    initAudio();

    if (playingId === wave.id) {
      // Stop playing
      stopAudio();
      setPlayingId(null);
      setTimeRemaining(0);
    } else {
      // Start playing
      createBinauralBeat(wave.frequency);
      setPlayingId(wave.id);
      
      if (wave.duration > 0) {
        setTimeRemaining(wave.duration);
        
        // Start countdown timer
        timerRef.current = setInterval(() => {
          setTimeRemaining(prev => {
            if (prev <= 1) {
              stopAudio();
              setPlayingId(null);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Mind Health</h1>
        <p className="text-gray-400">Binaural beats for optimal trading mental state</p>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-300">
              Binaural beats work by playing slightly different frequencies in each ear. 
              Your brain perceives the difference as a beat, which can help induce specific mental states.
              Use headphones for best results.
            </p>
          </div>
        </div>
      </div>

      {/* Volume Control */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4">
        <div className="flex items-center gap-4">
          <Volume2 className="w-5 h-5 text-gray-400" />
          <div className="flex-1">
            <label className="text-sm text-gray-400 block mb-2">Volume</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => {
                const newVolume = parseFloat(e.target.value);
                setVolume(newVolume);
                if (gainNodeRef.current) {
                  gainNodeRef.current.gain.value = newVolume;
                }
              }}
              className="w-full h-2 bg-[#30363D] rounded-lg appearance-none cursor-pointer accent-[#58A6FF]"
            />
          </div>
          <span className="text-sm text-gray-400 w-12">{Math.round(volume * 100)}%</span>
        </div>
      </div>

      {/* Wave Options */}
      <div className="grid grid-cols-2 gap-6">
        {waveOptions.map((wave) => (
          <div
            key={wave.id}
            className={`relative overflow-hidden rounded-xl border transition-all duration-300 ${
              playingId === wave.id
                ? 'border-white/50 shadow-lg shadow-white/10'
                : 'border-[#30363D] hover:border-[#505050]'
            }`}
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${wave.bgGradient} opacity-30`} />
            
            {/* Animated Wave Effect when playing */}
            {playingId === wave.id && (
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute inset-0 border-2 border-white/20 rounded-full animate-ping"
                    style={{
                      animationDelay: `${i * 0.5}s`,
                      animationDuration: '2s'
                    }}
                  />
                ))}
              </div>
            )}

            <div className="relative p-6">
              {/* Icon and Title */}
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${wave.color} text-white`}>
                  {wave.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{wave.name}</h3>
                  <p className="text-sm text-gray-400">{wave.frequency} Hz</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-300 mb-6 leading-relaxed">
                {wave.description}
              </p>

              {/* Timer for Theta */}
              {wave.duration > 0 && playingId === wave.id && (
                <div className="flex items-center gap-2 mb-4 p-3 bg-purple-500/20 rounded-lg border border-purple-500/30">
                  <Timer className="w-5 h-5 text-purple-400" />
                  <span className="text-lg font-bold text-purple-400">
                    {formatTime(timeRemaining)}
                  </span>
                  <span className="text-sm text-gray-400">remaining</span>
                </div>
              )}

              {/* Playing Indicator for Alpha */}
              {wave.duration === 0 && playingId === wave.id && (
                <div className="flex items-center gap-2 mb-4 p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
                  <div className="flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-blue-400 rounded-full animate-pulse"
                        style={{
                          height: `${20 + i * 10}px`,
                          animationDelay: `${i * 0.1}s`
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-blue-400 ml-2">Playing - Focus Mode Active</span>
                </div>
              )}

              {/* Play/Stop Button */}
              <button
                onClick={() => togglePlay(wave)}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  playingId === wave.id
                    ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30'
                    : `bg-gradient-to-r ${wave.color} text-white hover:opacity-90`
                }`}
              >
                {playingId === wave.id ? (
                  <>
                    <Pause className="w-5 h-5" />
                    Stop Session
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Start {wave.duration > 0 ? '10-Min Session' : 'Session'}
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Benefits Section */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Waves className="w-5 h-5 text-blue-400" />
            Alpha Waves Benefits (10 Hz)
          </h3>
          <ul className="space-y-2">
            {['Enhanced focus and concentration', 'Reduced stress and anxiety', 'Improved learning ability', 'Calm alertness for trading', 'Better decision making'].map((benefit, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Theta Waves Benefits (4-8 Hz)
          </h3>
          <ul className="space-y-2">
            {['Deep relaxation and meditation', 'Mental clarity and preparation', 'Reduced pre-trading jitters', 'Enhanced creativity', 'Better emotional balance'].map((benefit, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gradient-to-r from-[#161B22] to-[#0D1117] border border-[#30363D] rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">How to Use</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-blue-400">1</span>
            </div>
            <p className="text-sm text-gray-300">Put on headphones for best binaural effect</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-purple-400">2</span>
            </div>
            <p className="text-sm text-gray-300">Use Theta waves 10 min before trading session</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-green-400">3</span>
            </div>
            <p className="text-sm text-gray-300">Use Alpha waves during trading for focus</p>
          </div>
        </div>
      </div>
    </div>
  );
}
