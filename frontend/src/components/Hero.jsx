import { DecryptedText } from './ui/decrypted-text';
import { LiquidButton } from './ui/liquid-glass-button';
import Antigravity from './Antigravity';
import { useNavigate } from 'react-router-dom';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-10 overflow-hidden isolate">
      {/* Background Layer 1: Dot Grid Pattern */}
      <div className="absolute inset-0 -z-10 opacity-40 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] bg-size-[24px_24px]" />
      
      {/* Background Layer 2: Particle Background */}
      <div className="absolute inset-0 -z-10 opacity-40">
        <Antigravity
          count={300}
          magnetRadius={6}
          ringRadius={7}
          waveSpeed={0.4}
          waveAmplitude={1}
          particleSize={1.5}
          lerpSpeed={0.05}
          color={'#644a40'}
          autoAnimate={true}
          particleVariance={1}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 flex flex-col items-center justify-center text-center">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary font-medium text-sm mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          LeaveFlow Core Engine v2.0
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-primary leading-[1.15] tracking-tight mb-8 sm:mb-10 max-w-3xl">
          <DecryptedText
            text="Intelligent Leave Automation for Modern Teams."
            animateOn="view"
            revealDirection="center"
            speed={40}
            sequential={true}
            className="text-primary"
            encryptedClassName="text-primary/60"
          />
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-muted-foreground mb-10 sm:mb-12 leading-relaxed max-w-2xl text-center">
          A role-based workflow engine connecting employee leave requests, approval hierarchies, holiday calendars, and automated payroll deduction logic.
        </p>

        {/* CTA Button */}
        <LiquidButton size="xxl" onClick={() => navigate('/login')}>
          Get Started
        </LiquidButton>
      </div>
    </section>
  );
}
