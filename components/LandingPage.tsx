
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { LogIn, ShieldCheck, Zap, Globe } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-4 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full"></div>
      </div>

      {/* Hero Section */}
      <div className="max-w-4xl text-center space-y-8">
        <div className="inline-flex items-center px-3 py-1 text-sm font-medium leading-5 text-indigo-300 transition rounded-full bg-indigo-500/10 border border-indigo-500/20">
          <ShieldCheck className="w-4 h-4 mr-2" />
          Enterprise Single Sign-On
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">
          Secure Access, <br />
          <span className="text-indigo-500">Everywhere.</span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400">
          The ultimate SSO portal for your multi-app ecosystem. Log in once and stay authenticated across all linked projects without ever seeing a login screen again.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => loginWithRedirect()}
            className="group relative flex items-center justify-center w-full sm:w-auto px-8 py-4 text-lg font-bold text-white transition-all bg-indigo-600 rounded-xl hover:bg-indigo-500 active:scale-95 shadow-[0_0_20px_rgba(79,70,229,0.4)]"
          >
            <LogIn className="w-5 h-5 mr-3 transition-transform group-hover:translate-x-1" />
            Sign In with Auth0
          </button>
          
          <button className="flex items-center justify-center w-full sm:w-auto px-8 py-4 text-lg font-semibold text-slate-300 transition border border-slate-800 rounded-xl hover:bg-slate-900">
            View Documentation
          </button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-6xl w-full">
        <FeatureCard 
          icon={<Zap className="w-6 h-6 text-yellow-400" />}
          title="Silent SSO"
          description="Log into one app, get logged into all. Zero friction, maximum productivity."
        />
        <FeatureCard 
          icon={<Globe className="w-6 h-6 text-blue-400" />}
          title="Cross-Domain"
          description="Works seamlessly across multiple domains within your enterprise tenant."
        />
        <FeatureCard 
          icon={<ShieldCheck className="w-6 h-6 text-green-400" />}
          title="Secure Identity"
          description="Bank-grade security powered by Auth0 protocols and OIDC standards."
        />
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
  <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/30 transition-all duration-300">
    <div className="p-3 mb-4 rounded-lg bg-slate-800 w-fit">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
    <p className="text-slate-400">{description}</p>
  </div>
);
