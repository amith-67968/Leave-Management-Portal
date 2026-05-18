import { User, Users, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { LiquidButton } from '../components/ui/liquid-glass-button';

export default function LoginPage() {
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary/20 selection:text-primary relative isolate">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 -z-10 opacity-20 bg-[radial-gradient(var(--color-primary)_1px,transparent_1px)] [background-size:32px_32px]" />
      
      {/* Header */}
      <header className="absolute top-0 w-full p-6 flex justify-between items-center max-w-7xl mx-auto left-0 right-0 z-50">
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
      <main className="flex-1 flex items-center justify-center p-4 pt-24">
        <div className="w-full max-w-5xl">
          <div className="text-center mb-16 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Select your role to access the LeaveFlow portal. Each portal is customized for your specific workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <div 
                  key={role.title} 
                  className="flex flex-col p-8 bg-card rounded-2xl border-2 border-border transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary transition-colors duration-300">
                    <Icon size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">{role.title}</h3>
                  <p className="text-muted-foreground leading-relaxed flex-1 mb-8">
                    {role.description}
                  </p>
                  
                  <LiquidButton 
                    className="w-full mt-auto"
                    onClick={() => navigate(role.href)}
                  >
                    Login as {role.title}
                  </LiquidButton>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
