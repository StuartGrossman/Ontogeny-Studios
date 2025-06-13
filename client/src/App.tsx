import React, { useEffect, useRef } from 'react';
import './App.css';

const App: React.FC = () => {
  const codeContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const codeContent = codeContentRef.current;
    if (codeContent) {
      // Auto-scroll to a certain point and back to top
      const scrollInterval = setInterval(() => {
        const { scrollTop, scrollHeight, clientHeight } = codeContent;
        if (scrollTop < scrollHeight - clientHeight) {
          codeContent.scrollTop += 1; // Scroll down by 1 pixel for smoother effect
        } else {
          codeContent.scrollTop = 0; // Reset to top when reaching bottom
        }
      }, 20); // Faster interval for smoother scrolling

      return () => clearInterval(scrollInterval);
    }
  }, []);

  return (
    <div className="app">
      <div className="split-screen">
        {/* Left side - Brand */}
        <div className="brand-section">
          <h1 className="brand-title">
            <span className="gradient-text">Ontogeny</span>
            <span className="brand-subtitle">Labs</span>
          </h1>
          <p className="brand-description">
            Building the future of software development
          </p>
        </div>

        {/* Right side - Code Window */}
        <div className="code-box">
          <div className="code-header">
            <div className="code-dot red"></div>
            <div className="code-dot yellow"></div>
            <div className="code-dot green"></div>
            <span className="code-title">server.js</span>
          </div>
          <div className="code-content" ref={codeContentRef}>
            <pre>
              <code dangerouslySetInnerHTML={{ __html: `
                import <span style="color: #ff79c6; font-weight: bold; background-color: red;">React</span>, { <span style="color: #ff79c6; font-weight: bold;">useState</span>, <span style="color: #ff79c6; font-weight: bold;">useEffect</span> } 
                from <span style="color: #f1fa8c;">'react'</span>;
                
                <span style="color: #6272a4; font-style: italic;">// LinkedInProfile Component</span>
                const <span style="color: #ff79c6; font-weight: bold;">LinkedInProfile</span>: <span style="color: #8be9fd; font-weight: bold;">React.FC</span> = () => {
                  const [<span style="color: #f8f8f2;">profileData</span>, <span style="color: #50fa7b; font-weight: 500;">setProfileData</span>] = 
                    <span style="color: #50fa7b; font-weight: 500;">useState</span>&lt;<span style="color: #ff79c6; font-weight: bold;">any</span>&gt;(<span style="color: #ff79c6; font-weight: bold;">null</span>);
                  const [<span style="color: #f8f8f2;">isLoading</span>, <span style="color: #50fa7b; font-weight: 500;">setIsLoading</span>] = 
                    <span style="color: #50fa7b; font-weight: 500;">useState</span>&lt;<span style="color: #ff79c6; font-weight: bold;">boolean</span>&gt;(<span style="color: #ff79c6; font-weight: bold;">true</span>);
                
                  <span style="color: #6272a4; font-style: italic;">// Fetch LinkedIn profile data</span>
                  <span style="color: #50fa7b; font-weight: 500;">useEffect</span>(() => {
                    const <span style="color: #f8f8f2;">fetchProfile</span> = 
                      <span style="color: #ff79c6; font-weight: bold;">async</span> () => {
                        <span style="color: #ff79c6; font-weight: bold;">try</span> {
                          <span style="color: #50fa7b; font-weight: 500;">setIsLoading</span>(<span style="color: #ff79c6; font-weight: bold;">true</span>);
                          const <span style="color: #f8f8f2;">response</span> = 
                            <span style="color: #ff79c6; font-weight: bold;">await</span> 
                            <span style="color: #50fa7b; font-weight: 500;">linkedInApiCall</span>();
                          <span style="color: #50fa7b; font-weight: 500;">setProfileData</span>(<span style="color: #f8f8f2;">response</span>.<span style="color: #f8f8f2;">data</span>);
                        } <span style="color: #ff79c6; font-weight: bold;">catch</span> (<span style="color: #f8f8f2;">error</span>) {
                          <span style="color: #8be9fd; font-weight: 500;">console</span>.<span style="color: #50fa7b; font-weight: 500;">error</span>(
                            <span style="color: #f1fa8c;">'Error fetching profile'</span>, 
                            <span style="color: #f8f8f2;">error</span>
                          );
                        } <span style="color: #ff79c6; font-weight: bold;">finally</span> {
                          <span style="color: #50fa7b; font-weight: 500;">setIsLoading</span>(<span style="color: #ff79c6; font-weight: bold;">false</span>);
                        }
                      };
                    <span style="color: #50fa7b; font-weight: 500;">fetchProfile</span>();
                  }, []);
                
                  <span style="color: #6272a4; font-style: italic;">// Fake LinkedIn API call</span>
                  const <span style="color: #f8f8f2;">linkedInApiCall</span> = 
                    <span style="color: #ff79c6; font-weight: bold;">async</span> () => {
                      <span style="color: #ff79c6; font-weight: bold;">return</span> {
                        <span style="color: #f8f8f2;">data</span>: {
                          <span style="color: #f8f8f2;">userId</span>: <span style="color: #f1fa8c;">'linkedin123'</span>,
                          <span style="color: #f8f8f2;">fullName</span>: 
                            <span style="color: #f1fa8c;">'Jane Smith'</span>,
                          <span style="color: #f8f8f2;">headline</span>: 
                            <span style="color: #f1fa8c;">'Senior Developer at TechCorp'</span>,
                          <span style="color: #f8f8f2;">connections</span>: <span style="color: #bd93f9;">850</span>
                        }
                      };
                    };
                
                  <span style="color: #ff79c6; font-weight: bold;">if</span> (<span style="color: #f8f8f2;">isLoading</span>) {
                    <span style="color: #ff79c6; font-weight: bold;">return</span> (
                      <div>Fetching profile...</div>
                    );
                  }
                
                  <span style="color: #ff79c6; font-weight: bold;">return</span> (
                    <div className="profile-card">
                      <h2>{<span style="color: #f8f8f2;">profileData</span>.<span style="color: #f8f8f2;">fullName</span>}</h2>
                      <p>{<span style="color: #f8f8f2;">profileData</span>.<span style="color: #f8f8f2;">headline</span>}</p>
                      <p>Connections: 
                        {<span style="color: #f8f8f2;">profileData</span>.<span style="color: #f8f8f2;">connections</span>}</p>
                    </div>
                  );
                };
                
                export <span style="color: #ff79c6; font-weight: bold;">default</span> <span style="color: #ff79c6; font-weight: bold;">LinkedInProfile</span>;
              ` }} />
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;