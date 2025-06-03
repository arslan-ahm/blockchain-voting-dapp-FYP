import { useHome } from "./useHome";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { ArrowDown, ChevronRight, Vote } from "lucide-react";
import { features, steps, roadmapItems } from "./home.constants";

export const Home = () => {
  const { 
    currentAccount, 
    connectWallet, 
    loading,
    heroRef,
    handleScrollToSection
  } = useHome();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section id="hero" ref={heroRef} className="min-h-screen flex items-center justify-center relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-radial from-blue-500/10 via-background to-background"></div>
        <div className="container mx-auto text-center relative z-10">
          <h1 className="hero-title text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Secure Voting on the <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Blockchain
            </span>
          </h1>
          
          <p className="hero-description text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-8">
            Experience transparent, tamper-proof voting with our cutting-edge blockchain technology. 
            Your voice matters, make it count securely.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-12">
            <div className="hero-cta">
              {currentAccount ? (
                <Link to="/campaigns">
                  <Button 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 text-lg px-8 py-6 transition-all duration-300 hover:scale-105"
                  >
                    Start Voting Now <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Button 
                  onClick={connectWallet}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 text-lg px-8 py-6 transition-all duration-300 hover:scale-105"
                >
                  Connect Wallet to Start <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              )}
            </div>
            <div className="hero-cta">
              <Button 
                variant="outline" 
                className="border-blue-500 text-blue-400 hover:bg-blue-500/10 text-lg px-8 py-6 transition-all duration-300"
                onClick={() => handleScrollToSection('#how-it-works')}
              >
                Learn More <ArrowDown className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="hero-stat p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-sm hover:shadow-neon-blue transition-all duration-300">
              <h3 className="text-3xl font-bold text-white mb-2">100%</h3>
              <p className="text-gray-400">Secure & Transparent</p>
            </div>
            <div className="hero-stat p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-sm hover:shadow-neon-purple transition-all duration-300">
              <h3 className="text-3xl font-bold text-white mb-2">24/7</h3>
              <p className="text-gray-400">Real-time Tracking</p>
            </div>
            <div className="hero-stat p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-sm hover:shadow-neon-cyan transition-all duration-300">
              <h3 className="text-3xl font-bold text-white mb-2">0%</h3>
              <p className="text-gray-400">Fraud Tolerance</p>
            </div>
          </div>
        </div>
        
        {/* Scroll down button */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
          <button onClick={() => handleScrollToSection('#about')} className="text-gray-400 hover:text-blue-400 transition-colors">
            <ArrowDown className="animate-bounce" />
            <span className="sr-only">Scroll down</span>
          </button>
        </div>
        
        {/* Gradient orbs */}
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-[120px]"></div>
      </section>
      
      {/* About Section */}
      <section id="about" className="py-20 md:py-28 relative">
        <div className="container px-4 md:px-8 mx-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="section-title text-3xl md:text-4xl font-bold mb-6 text-white text-center">
              About <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">BlockVote</span>
            </h2>
            <p className="section-description text-lg text-gray-300 mb-8 text-center">
              BlockVote represents a revolutionary approach to digital democracy, leveraging the security and transparency of blockchain technology to create a voting platform that's immune to tampering, fraud, and manipulation.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 hover:scale-105 hover:shadow-neon-purple transition-all duration-300">
                <h3 className="text-xl font-bold mb-4 text-purple-400">Our Mission</h3>
                <p className="text-gray-300">
                  To democratize voting systems worldwide by providing a secure, transparent, and accessible platform that ensures every vote is counted accurately and cannot be manipulated.
                </p>
              </div>
              <div className="backdrop-blur-sm rounded-xl p-6 border border-cyan-400/20 hover:scale-105 hover:shadow-neon-cyan transition-all duration-300">
                <h3 className="text-xl font-bold mb-4 text-cyan-400">Why Blockchain?</h3>
                <p className="text-gray-300">
                  Blockchain technology provides immutable records, decentralized verification, and cryptographic security, making it the perfect foundation for a next-generation voting system.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-20 md:py-28 bg-gray-900/30 relative">
        <div className="container px-4 md:px-8 mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white text-center">
            Platform <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Features</span>
          </h2>
          <p className="text-lg text-gray-300 mb-12 text-center max-w-3xl mx-auto">
            BlockVote combines cutting-edge blockchain technology with a user-friendly interface to deliver a voting platform that's as secure as it is easy to use.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="feature-card backdrop-blur-sm overflow-hidden border border-blue-500/20 hover:scale-105 transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center mb-6 group-hover:border-blue-500/60 group-hover:shadow-neon-blue transition-all duration-300">
                    <feature.icon className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-blue-400">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                  <div className="mt-4 flex items-center text-purple-400 text-sm font-medium group-hover:text-blue-400 transition-colors duration-300">
                    Learn more <ChevronRight className="ml-1 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Gradient orbs */}
        <div className="absolute bottom-1/3 right-10 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]"></div>
      </section>
      
      {/* How It Works Section - Responsive Timeline */}
      <section id="how-it-works" className="py-20 md:py-28 relative">
        <div className="container px-4 md:px-8 mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white text-center">
            How It <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Works</span>
          </h2>
          <p className="text-lg text-gray-300 mb-16 text-center max-w-3xl mx-auto">
            Voting on the blockchain has never been easier. Follow these simple steps to cast your vote securely.
          </p>
          
          <div className="max-w-4xl mx-auto relative">
            {/* Timeline Line - Responsive */}
            <div className="absolute left-8 md:left-1/2 md:transform md:-translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 via-purple-400 to-pink-400 shadow-neon-blue"></div>
            
            {steps.map((step, index) => (
              <div key={index} className={`step-card relative flex items-center mb-12 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                {/* Timeline Node */}
                <div className="absolute left-4 md:left-1/2 md:transform md:-translate-x-1/2 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-4 border-background flex items-center justify-center text-white font-bold text-xl z-10 hover:scale-110 hover:shadow-neon-blue transition-all duration-300">
                  {index + 1}
                </div>
                
                {/* Content */}
                <div className={`w-full md:w-5/12 ml-24 md:ml-0 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                  <Card className="backdrop-blur-sm border border-blue-500/30 hover:scale-105 transition-all duration-300 group">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full flex items-center justify-center mr-4 group-hover:border-blue-500/60 group-hover:shadow-neon-blue transition-all duration-300">
                          <step.icon className="h-6 w-6 text-blue-400" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-blue-400">{step.title}</h3>
                      <p className="text-gray-300 leading-relaxed">{step.description}</p>
                      <div className="mt-4 flex items-center text-purple-400 text-sm font-medium group-hover:text-blue-400 transition-colors duration-300">
                        View details <ChevronRight className="ml-1 h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Empty space for opposite side on desktop */}
                <div className="hidden md:block w-5/12"></div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            {currentAccount ? (
              <Link to="/campaigns">
                <Button 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 text-lg px-8 py-6 transition-all duration-300 hover:scale-105"
                >
                  Start Voting Now <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Button 
                onClick={connectWallet}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 text-lg px-8 py-6 transition-all duration-300 hover:scale-105"
              >
                Connect Wallet to Start <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </section>
      
      {/* Roadmap Section */}
      <section id="roadmap" className="py-20 md:py-28 bg-gray-900/30 relative">
        <div className="container px-4 md:px-8 mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white text-center">
            Project <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Roadmap</span>
          </h2>
          <p className="text-lg text-gray-300 mb-16 text-center max-w-3xl mx-auto">
            Our development roadmap outlines our vision for the future of BlockVote and the key milestones we're working toward.
          </p>
          
          <div className="max-w-4xl mx-auto">
            {roadmapItems.map((item, index) => (
              <div 
                key={index} 
                className={`roadmap-item flex flex-col md:flex-row mb-12 ${
                  index % 2 !== 0 ? 'md:flex-row-reverse' : ''
                }`}
              >
                <div className={`md:w-1/2 ${index % 2 !== 0 ? 'md:pl-8' : 'md:pr-8'} mb-4 md:mb-0`}>
                  <Card className="h-full backdrop-blur-sm border border-blue-500/30 hover:scale-105 transition-all duration-300 group">
                    <CardContent className="p-6">
                      <div className="inline-block px-4 py-2 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-400 mb-4 group-hover:shadow-neon-blue transition-all duration-300">
                        {item.phase}
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-white">{item.title}</h3>
                      <p className="text-gray-300 leading-relaxed">{item.description}</p>
                      <div className="mt-4 flex items-center text-purple-400 text-sm font-medium group-hover:text-blue-400 transition-colors duration-300">
                        Learn more <ChevronRight className="ml-1 h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="md:w-1/2 flex justify-center items-center">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-2 border-blue-500/30 hover:scale-110 hover:shadow-neon-blue transition-all duration-300">
                    <item.icon className="h-10 w-10 text-blue-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Gradient orbs */}
        <div className="absolute top-1/3 left-10 w-80 h-80 bg-cyan-400/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-10 w-64 h-64 bg-pink-500/10 rounded-full blur-[100px]"></div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 border-t border-gray-800">
        <div className="container px-4 md:px-8 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse flex items-center justify-center">
                  <Vote className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-white">
                  Block<span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Vote</span>
                </span>
              </div>
              <p className="text-gray-400 mt-2">Secure blockchain voting for everyone</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              <div>
                <h4 className="text-white font-medium mb-3">Platform</h4>
                <ul className="space-y-2">
                  <li><button onClick={() => handleScrollToSection('#features')} className="text-gray-400 hover:text-blue-400 transition-colors">Features</button></li>
                  <li><button onClick={() => handleScrollToSection('#roadmap')} className="text-gray-400 hover:text-blue-400 transition-colors">Roadmap</button></li>
                  <li><Link to="/campaigns" className="text-gray-400 hover:text-blue-400 transition-colors">Campaigns</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-medium mb-3">Resources</h4>
                <ul className="space-y-2">
                  <li><Link to="/docs" className="text-gray-400 hover:text-blue-400 transition-colors">Documentation</Link></li>
                  <li><Link to="/api" className="text-gray-400 hover:text-blue-400 transition-colors">API</Link></li>
                  <li><Link to="/guides" className="text-gray-400 hover:text-blue-400 transition-colors">Guides</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-medium mb-3">Company</h4>
                <ul className="space-y-2">
                  <li><button onClick={() => handleScrollToSection('#about')} className="text-gray-400 hover:text-blue-400 transition-colors">About</button></li>
                  <li><Link to="/blog" className="text-gray-400 hover:text-blue-400 transition-colors">Blog</Link></li>
                  <li><Link to="/careers" className="text-gray-400 hover:text-blue-400 transition-colors">Careers</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-medium mb-3">Legal</h4>
                <ul className="space-y-2">
                  <li><Link to="/privacy" className="text-gray-400 hover:text-blue-400 transition-colors">Privacy</Link></li>
                  <li><Link to="/terms" className="text-gray-400 hover:text-blue-400 transition-colors">Terms</Link></li>
                  <li><Link to="/cookies" className="text-gray-400 hover:text-blue-400 transition-colors">Cookies</Link></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-500">© 2025 BlockVote. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};