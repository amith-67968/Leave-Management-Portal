import { useState } from 'react';
import { User, Users, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { RoleShuffleCard } from '../components/ui/role-shuffle-card';

export default function LoginPage() {
  const navigate = useNavigate();
  const [positions, setPositions] = useState(["front", "middle", "back"]);

  const roles = [
    {
      title: "Employee",
      description: "Access your dashboard, apply for leave, and view your balances.",
      icon: User,
      href: "/login/employee"
    },
    {
      title: "Manager",
      description: "Approve leave requests and manage your team's availability.",
      icon: Users,
      href: "/login/manager"
    },
    {
      title: "Admin",
      description: "System administration, payroll rules, and holiday calendars.",
      icon: ShieldCheck,
      href: "/login/admin"
    }
  ];

  const handleShuffle = () => {
    const newPositions = [...positions];
    newPositions.unshift(newPositions.pop());
    setPositions(newPositions);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary/20 selection:text-primary relative isolate overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 -z-10 opacity-20 bg-[radial-gradient(var(--color-primary)_1px,transparent_1px)] bg-size-[32px_32px]" />
      
      {/* Header */}
      <header className="absolute top-0 left-0 w-full p-6 lg:p-8 flex justify-between items-center z-50">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-md bg-primary flex items-center justify-center">
            <ShieldCheck size={20} className="text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight text-foreground">
            LeaveFlow
          </span>
        </div>
        <Link to="/" className="text-muted-foreground hover:text-foreground transition flex items-center gap-2 text-sm font-medium">
          <ArrowLeft size={16} />
          Back to home
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 pt-24 w-full">
        <div className="text-center mb-12 lg:mb-16 space-y-4 max-w-2xl mx-auto z-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Welcome back
          </h1>
          <p className="text-lg text-muted-foreground">
            Swipe or click the cards to select your role and access the LeaveFlow portal. Each portal is customized for your specific workflow.
          </p>
        </div>

        <div className="relative w-[320px] sm:w-[350px] h-[420px] -ml-8 sm:-ml-12 md:-ml-[100px] lg:-ml-[150px] mt-4 z-20">
          {roles.map((role, index) => (
            <RoleShuffleCard
              key={role.title}
              role={role}
              handleShuffle={handleShuffle}
              position={positions[index]}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
