import { useState, useEffect } from 'react';
import { BarChart3, Workflow, Sparkles, Globe, Mail, ArrowRight } from 'lucide-react';
import ParticleNetwork from './components/ParticleNetwork';
import HeroVideo from './components/HeroVideo';
import logoSvg from './assets/logo.svg';

import Clarity from '@microsoft/clarity';
const projId = 'u3yrvkjq4k';
Clarity.init(projId);

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

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-4 md:py-12">
        <div className="max-w-5xl w-full mx-auto text-center space-y-4 md:space-y-12">
          <div className="space-y-3 md:space-y-6 animate-fade-in">
            {!showVideo && (
              <div className="flex justify-center mb-4 md:mb-8">
                <img 
                  src={logoSvg} 
                  alt="Vzbly Logo" 
                  className="w-16 h-16 md:w-20 md:h-20 relative z-10 drop-shadow-lg"
                  style={{ transform: 'scale(4)', marginBottom: '10px', imageRendering: 'auto' }}
                />
              </div>
            )}
            <div className="flex items-center justify-center">
              <h1 className="text-6xl md:text-7xl font-bold text-gray-900 hidden">
                Vzbly
              </h1>
            </div>

            <p className="text-lg md:text-2xl lg:text-3xl font-light text-gray-700 max-w-3xl mx-auto leading-relaxed px-2">
              Transforming data into{' '}
              <span className="font-semibold text-gray-900">interactive stories</span>
              {' '}through visualization, automation, and intelligent analytics
            </p>
          </div>

          {/* <DataVisualization /> */}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 max-w-4xl mx-auto py-4 md:py-8">
            {[
              { icon: BarChart3, label: 'Custom visualizations', color: '#4581db' },
              { icon: Workflow, label: 'Automated updates', color: '#db690d' },
              { icon: Sparkles, label: 'Performance analytics', color: '#63a747' },
              { icon: Globe, label: 'Web solutions', color: '#e1b015' },
            ].map((item, index) => (
              <div
                key={item.label}
                className="group p-3 md:p-6 rounded-xl md:rounded-2xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:border-gray-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <item.icon className={`w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 md:mb-3 group-hover:scale-110 transition-transform`} style={{ color: item.color }} />
                <p className="text-xs md:text-sm font-medium text-gray-700">{item.label}</p>
              </div>
            ))}
          </div>



          <div className="pt-4 md:pt-8 space-y-2 md:space-y-4">
            <p className="text-gray-900 text-base md:text-lg font-medium">
              Coming soon
            </p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-xs md:text-sm text-gray-600">
              <span>Interactive dashboards</span>
              <span className="hidden sm:inline">•</span>
              <span>Real-time analytics</span>
              <span className="hidden sm:inline">•</span>
              <span>Data pipelines</span>
            </div>
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
