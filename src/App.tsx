import { useState, useEffect } from 'react';
import { BarChart3, Workflow, Sparkles, Globe, Mail, ArrowRight } from 'lucide-react';
import ParticleNetwork from './components/ParticleNetwork';
import HeroVideo from './components/HeroVideo';
import logoSvg from './assets/logo.svg';

function App() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    // Check if it's the first visit
    const hasVisited = localStorage.getItem('vzbly_has_visited');
    
    // Check for welcome query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const welcomeParam = urlParams.get('welcome');
    
    // Show video if first visit OR if welcome=true query param exists
    if (!hasVisited || welcomeParam === 'true') {
      setShowVideo(true);
      // Mark as visited when video is shown (unless it's the welcome param)
      if (!hasVisited && welcomeParam !== 'true') {
        localStorage.setItem('vzbly_has_visited', 'true');
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setEmail('');
      }, 3000);
    }
  };

  const handleVideoComplete = () => {
    // Mark as visited when video completes
    localStorage.setItem('vzbly_has_visited', 'true');
    setShowVideo(false);
  };

  return (
    <>
      {showVideo && <HeroVideo onComplete={handleVideoComplete} />}
      
      <div 
        className="min-h-screen bg-white overflow-hidden relative"
      >
        <ParticleNetwork />

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-5xl w-full mx-auto text-center space-y-12">
          <div className="space-y-6 animate-fade-in">
            {!showVideo && (
              <div className="flex justify-center mb-8">
                <img 
                  src={logoSvg} 
                  alt="Vzbly Logo" 
                  className="w-16 h-16 md:w-20 md:h-20 relative z-10 drop-shadow-lg"
                  style={{ transform: 'scale(2.4)' }}
                />
              </div>
            )}
            <div className="flex items-center justify-center">
              <h1 className="text-6xl md:text-7xl font-bold text-gray-900">
                Vzbly.ca
              </h1>
            </div>

            <p className="text-2xl md:text-3xl font-light text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Transforming data into{' '}
              <span className="font-semibold text-gray-900">interactive stories</span>
              {' '}through visualization, automation, and intelligent analytics
            </p>
          </div>

          {/* <DataVisualization /> */}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto py-8">
            {[
              { icon: BarChart3, label: 'Custom visualizations', color: '#4581db' },
              { icon: Workflow, label: 'Update automations', color: '#db690d' },
              { icon: Sparkles, label: 'Performance analytics', color: '#63a747' },
              { icon: Globe, label: 'Web solutions', color: '#e1b015' },
            ].map((item, index) => (
              <div
                key={item.label}
                className="group p-6 rounded-2xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:border-gray-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <item.icon className={`w-8 h-8 mx-auto mb-3 group-hover:scale-110 transition-transform`} style={{ color: item.color }} />
                <p className="text-sm font-medium text-gray-700">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="max-w-md mx-auto space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Be the first to know when we launch
            </h2>

            <form onSubmit={handleSubmit} className="relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4581db] focus:border-transparent transition-all"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-4 bg-[#4581db] text-white rounded-xl font-semibold hover:bg-[#3a6fc4] transition-all duration-300 flex items-center gap-2 hover:scale-105 active:scale-95"
                >
                  <span className="hidden sm:inline">Notify Me</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              {submitted && (
                <div className="absolute -bottom-12 left-0 right-0 text-[#63a747] text-sm animate-fade-in">
                  Thanks! We'll be in touch soon!
                </div>
              )}
            </form>
          </div>

          <div className="pt-8 space-y-4">
            <p className="text-gray-900 text-lg font-medium">
              Coming Soon
            </p>
            <div className="flex justify-center gap-8 text-sm text-gray-600">
              <span>Interactive Dashboards</span>
              <span className="hidden sm:inline">•</span>
              <span>Real-time Analytics</span>
              <span className="hidden sm:inline">•</span>
              <span>Data Pipelines</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </>
  );
}

export default App;
