import React from 'react'
import { Link } from 'react-router-dom'
import { Vote } from 'lucide-react'

const Footer:React.FC = () => {
  const handleScrollToSection = (sectionId: string) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };
  return (
    <>
    <footer className="max-w-[1540px] py-12 border-t border-gray-800">
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
    </>
  )
}

export default Footer