import { Shield } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 h-16 glass-nav">
      <div className="w-full h-full px-6 md:px-10 flex items-center">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-md bg-primary flex items-center justify-center">
            <Shield size={20} className="text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight text-foreground">
            LeaveFlow
          </span>
        </div>
      </div>
    </nav>
  );
}
