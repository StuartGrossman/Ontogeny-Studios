import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Examples from './pages/Examples';
import Dashboard from './pages/Dashboard';
import InventoryPage from './pages/InventoryPage';
import CustomerPortalPage from './pages/CustomerPortalPage';
import APIIntegrationPage from './pages/APIIntegrationPage';
import PayrollPage from './pages/PayrollPage';
import SchedulingPage from './pages/SchedulingPage';
import LogisticsPage from './pages/LogisticsPage';
import './App.css';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return currentUser ? <>{children}</> : <Navigate to="/" />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Main />
      </Router>
    </AuthProvider>
  );
};

const Main: React.FC = () => {
  const location = useLocation();
  const { currentUser, signInWithGoogle } = useAuth();

  const codeContentRef = useRef<HTMLDivElement>(null);
  const [codeBoxOpacity, setCodeBoxOpacity] = useState(1);
  const [isHoveringRightSide] = useState(false);

  // Don't show the main navbar on the dashboard pages since they have their own navigation
  const dashboardPaths = ['/dashboard', '/inventory', '/customer-portal', '/api-integration', '/payroll', '/scheduling', '/logistics'];
  const shouldShowNavbar = !dashboardPaths.includes(location.pathname);

  useEffect(() => {
    const codeContent = codeContentRef.current;
    if (codeContent) {
      // Reset scroll position when component mounts/remounts
      codeContent.scrollTop = 0;
      
      let scrollInterval: NodeJS.Timeout;
      let resetTimeout: NodeJS.Timeout;
      let startTime: number;
      
      const startScrolling = () => {
        startTime = Date.now();
        
        scrollInterval = setInterval(() => {
          if (codeContentRef.current) {
            const elapsedTime = Date.now() - startTime;
            
            // Check if 25 seconds have passed
            if (elapsedTime >= 25000) { // 25 seconds = 25000ms
              // Clear the scrolling interval
              clearInterval(scrollInterval);
              
              // Reset to top and restart after a brief pause
              resetTimeout = setTimeout(() => {
                if (codeContentRef.current) {
                  codeContentRef.current.scrollTop = 0; // Reset to top
                  // Restart scrolling after a brief delay
                  setTimeout(() => {
                    startScrolling();
                  }, 100);
                }
              }, 500); // Brief pause before restarting
            } else {
              // Continue scrolling
              const { scrollTop, scrollHeight, clientHeight } = codeContentRef.current;
              const maxScroll = scrollHeight - clientHeight;
              
              if (scrollTop < maxScroll) {
                codeContentRef.current.scrollTop += 1; // Scroll down by 1 pixel for smoother effect
              }
            }
          }
        }, 20); // Faster interval for smoother scrolling
      };
      
      // Force a small delay to ensure DOM is ready, then start scrolling
      const initDelay = setTimeout(() => {
        startScrolling();
      }, 100);

      return () => {
        clearTimeout(initDelay);
        clearTimeout(resetTimeout);
        if (scrollInterval) {
          clearInterval(scrollInterval);
        }
      };
    }
  }, [location.pathname]); // Reset when route changes

  useEffect(() => {
    console.log('Component mounted, setting up scroll listener');
    const handleScroll = () => {
      console.log('Scroll detected, position:', window.scrollY, 'Hovering right side:', isHoveringRightSide);
      if (isHoveringRightSide) {
        const scrollPosition = window.scrollY;
        const maxScroll = 300; // Adjust this value to control when the fade completes
        const newOpacity = Math.max(0, 1 - scrollPosition / maxScroll);
        console.log('Setting opacity to:', newOpacity);
        setCodeBoxOpacity(newOpacity);
      } else {
        console.log('Not hovering, resetting opacity to 1');
        setCodeBoxOpacity(1); // Reset opacity if not hovering
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    console.log('Scroll listener added');
    return () => {
      window.removeEventListener('scroll', handleScroll);
      console.log('Scroll listener removed');
    };
  }, [isHoveringRightSide]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={
          <div className="app">
            <div className="split-screen">
              {/* Left side - Brand */}
              <div className="brand-section">
                <h1 className="brand-title">
                  <span className="gradient-text">Ontogeny</span>
                  <span className="brand-subtitle">Labs</span>
                </h1>
                <p className="brand-description">
                  Custom software for your business
                </p>
                <div className="button-container">
                  {currentUser ? (
                    <button 
                      className="dashboard-button"
                      onClick={() => window.location.href = '/dashboard'}
                    >
                      Go to Dashboard
                    </button>
                  ) : (
                    <button 
                      className="login-button"
                      onClick={handleGoogleLogin}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Sign in with Google
                    </button>
                  )}
                  <button 
                    className="examples-button"
                    onClick={() => window.location.href = '/examples'}
                  >
                    Examples
                  </button>
                </div>
              </div>

              {/* Right side - Code Window */}
              <div className="code-box" style={{ opacity: codeBoxOpacity, zIndex: 0 }}>
                <div className="code-header">
                  <div className="code-dot red"></div>
                  <div className="code-dot yellow"></div>
                  <div className="code-dot green"></div>
                  <span className="code-title">server.js</span>
                </div>
                <div className="code-content" ref={codeContentRef}>
                  <pre>
                    <code dangerouslySetInnerHTML={{ __html: `
<span style="color: #6272a4; font-style: italic;">// React + TypeScript + GraphQL API Integration</span>
<span style="color: #ff79c6; font-weight: bold;">import</span> { <span style="color: #50fa7b;">useState</span>, <span style="color: #50fa7b;">useEffect</span>, <span style="color: #50fa7b;">useCallback</span> } <span style="color: #ff79c6; font-weight: bold;">from</span> <span style="color: #f1fa8c; font-style: italic;">'react'</span>;
<span style="color: #ff79c6; font-weight: bold;">import</span> { <span style="color: #8be9fd;">gql</span>, <span style="color: #50fa7b;">useQuery</span>, <span style="color: #50fa7b;">useMutation</span> } <span style="color: #ff79c6; font-weight: bold;">from</span> <span style="color: #f1fa8c; font-style: italic;">'@apollo/client'</span>;
<span style="color: #ff79c6; font-weight: bold;">import</span> { <span style="color: #50fa7b;">useAuth</span> } <span style="color: #ff79c6; font-weight: bold;">from</span> <span style="color: #f1fa8c; font-style: italic;">'@/hooks/useAuth'</span>;
<span style="color: #ff79c6; font-weight: bold;">import</span> <span style="color: #ff79c6; font-weight: bold;">type</span> { <span style="color: #8be9fd;">User</span>, <span style="color: #8be9fd;">Post</span>, <span style="color: #8be9fd;">Comment</span> } <span style="color: #ff79c6; font-weight: bold;">from</span> <span style="color: #f1fa8c; font-style: italic;">'@/types'</span>;

<span style="color: #6272a4; font-style: italic;">// GraphQL Queries & Mutations</span>
<span style="color: #ff79c6; font-weight: bold;">const</span> <span style="color: #8be9fd; font-weight: bold;">GET_USER_PROFILE</span> = <span style="color: #8be9fd;">gql</span>\`
  <span style="color: #ff79c6; font-weight: bold;">query</span> <span style="color: #8be9fd;">GetUserProfile</span>($<span style="color: #8be9fd;">id</span>: <span style="color: #8be9fd;">ID!</span>) {
    <span style="color: #50fa7b;">user</span>(id: $id) {
      <span style="color: #8be9fd;">id</span> <span style="color: #8be9fd;">name</span> <span style="color: #8be9fd;">email</span> 
      <span style="color: #50fa7b;">posts</span> { <span style="color: #8be9fd;">id</span> <span style="color: #8be9fd;">title</span> <span style="color: #8be9fd;">content</span> }
      <span style="color: #50fa7b;">comments</span> { <span style="color: #8be9fd;">id</span> <span style="color: #8be9fd;">content</span> <span style="color: #50fa7b;">post</span> { <span style="color: #8be9fd;">id</span> <span style="color: #8be9fd;">title</span> } }
      <span style="color: #50fa7b;">followers</span> { <span style="color: #8be9fd;">id</span> <span style="color: #8be9fd;">name</span> } 
      <span style="color: #50fa7b;">following</span> { <span style="color: #8be9fd;">id</span> <span style="color: #8be9fd;">name</span> }
    }
  }
\`;

<span style="color: #ff79c6; font-weight: bold;">const</span> <span style="color: #8be9fd; font-weight: bold;">CREATE_POST</span> = <span style="color: #8be9fd;">gql</span>\`
  <span style="color: #ff79c6; font-weight: bold;">mutation</span> <span style="color: #8be9fd;">CreatePost</span>($<span style="color: #8be9fd;">input</span>: <span style="color: #8be9fd;">PostInput!</span>) {
    <span style="color: #50fa7b;">createPost</span>(input: $input) {
      <span style="color: #8be9fd;">id</span> <span style="color: #8be9fd;">title</span> <span style="color: #8be9fd;">content</span> <span style="color: #8be9fd;">createdAt</span>
      <span style="color: #50fa7b;">author</span> { <span style="color: #8be9fd;">id</span> <span style="color: #8be9fd;">name</span> } 
      <span style="color: #50fa7b;">comments</span> { <span style="color: #8be9fd;">id</span> <span style="color: #8be9fd;">content</span> }
    }
  }
\`;

<span style="color: #6272a4; font-style: italic;">// Custom Hook for Data Fetching</span>
<span style="color: #ff79c6; font-weight: bold;">const</span> <span style="color: #50fa7b;">useUserData</span> = (<span style="color: #8be9fd;">userId</span>: <span style="color: #8be9fd; font-weight: bold;">string</span>) => {
  <span style="color: #ff79c6; font-weight: bold;">const</span> { <span style="color: #8be9fd;">data</span>, <span style="color: #8be9fd;">loading</span>, <span style="color: #8be9fd;">error</span>, <span style="color: #50fa7b;">refetch</span> } = <span style="color: #50fa7b;">useQuery</span>(<span style="color: #8be9fd; font-weight: bold;">GET_USER_PROFILE</span>, {
    <span style="color: #8be9fd;">variables</span>: { <span style="color: #8be9fd;">id</span>: userId },
    <span style="color: #8be9fd;">fetchPolicy</span>: <span style="color: #f1fa8c; font-style: italic;">'cache-and-network'</span>
  });
  <span style="color: #ff79c6; font-weight: bold;">return</span> { <span style="color: #8be9fd;">user</span>: data?.user, <span style="color: #8be9fd;">loading</span>, <span style="color: #8be9fd;">error</span>, <span style="color: #50fa7b;">refetch</span> };
};

<span style="color: #6272a4; font-style: italic;">// Main Component</span>
<span style="color: #ff79c6; font-weight: bold;">const</span> <span style="color: #8be9fd; font-weight: bold;">UserProfile</span>: <span style="color: #8be9fd;">React.FC</span>&lt;{ <span style="color: #8be9fd;">userId</span>: <span style="color: #8be9fd; font-weight: bold;">string</span> }&gt; = ({ <span style="color: #8be9fd;">userId</span> }) => {
  <span style="color: #ff79c6; font-weight: bold;">const</span> { <span style="color: #8be9fd;">user</span>, <span style="color: #8be9fd;">loading</span>, <span style="color: #8be9fd;">error</span>, <span style="color: #50fa7b;">refetch</span> } = <span style="color: #50fa7b;">useUserData</span>(userId);
  <span style="color: #ff79c6; font-weight: bold;">const</span> { <span style="color: #8be9fd;">user</span>: <span style="color: #8be9fd;">authUser</span> } = <span style="color: #50fa7b;">useAuth</span>();
  <span style="color: #ff79c6; font-weight: bold;">const</span> [<span style="color: #50fa7b;">createPost</span>] = <span style="color: #50fa7b;">useMutation</span>(<span style="color: #8be9fd; font-weight: bold;">CREATE_POST</span>);
  <span style="color: #ff79c6; font-weight: bold;">const</span> [<span style="color: #8be9fd;">newPost</span>, <span style="color: #50fa7b;">setNewPost</span>] = <span style="color: #50fa7b;">useState</span>({ <span style="color: #8be9fd;">title</span>: <span style="color: #f1fa8c; font-style: italic;">''</span>, <span style="color: #8be9fd;">content</span>: <span style="color: #f1fa8c; font-style: italic;">''</span> });
  <span style="color: #ff79c6; font-weight: bold;">const</span> [<span style="color: #8be9fd;">isSubmitting</span>, <span style="color: #50fa7b;">setIsSubmitting</span>] = <span style="color: #50fa7b;">useState</span>(<span style="color: #ff79c6; font-weight: bold;">false</span>);

  <span style="color: #6272a4; font-style: italic;">// Memoized Handlers</span>
  <span style="color: #ff79c6; font-weight: bold;">const</span> <span style="color: #50fa7b;">handleSubmit</span> = <span style="color: #50fa7b;">useCallback</span>(<span style="color: #ff79c6; font-weight: bold;">async</span> (<span style="color: #8be9fd;">e</span>: <span style="color: #8be9fd;">React.FormEvent</span>) => {
    e.preventDefault();
    <span style="color: #ff79c6; font-weight: bold;">if</span> (!newPost.title.trim() || !newPost.content.trim()) <span style="color: #ff79c6; font-weight: bold;">return</span>;
    
    <span style="color: #50fa7b;">setIsSubmitting</span>(<span style="color: #ff79c6; font-weight: bold;">true</span>);
    <span style="color: #ff79c6; font-weight: bold;">try</span> {
      <span style="color: #ff79c6; font-weight: bold;">await</span> <span style="color: #50fa7b;">createPost</span>({
        <span style="color: #8be9fd;">variables</span>: { <span style="color: #8be9fd;">input</span>: { ...newPost, <span style="color: #8be9fd;">authorId</span>: userId } },
        <span style="color: #50fa7b;">update</span>: (<span style="color: #8be9fd;">cache</span>, { <span style="color: #8be9fd;">data</span> }) => {
          <span style="color: #ff79c6; font-weight: bold;">const</span> <span style="color: #8be9fd;">existing</span> = cache.readQuery({ 
            <span style="color: #8be9fd;">query</span>: <span style="color: #8be9fd; font-weight: bold;">GET_USER_PROFILE</span>, 
            <span style="color: #8be9fd;">variables</span>: { <span style="color: #8be9fd;">id</span>: userId } 
          });
          cache.writeQuery({
            <span style="color: #8be9fd;">query</span>: <span style="color: #8be9fd; font-weight: bold;">GET_USER_PROFILE</span>,
            <span style="color: #8be9fd;">variables</span>: { <span style="color: #8be9fd;">id</span>: userId },
            <span style="color: #8be9fd;">data</span>: {
              <span style="color: #8be9fd;">user</span>: {
                ...existing.user,
                <span style="color: #50fa7b;">posts</span>: [...existing.user.posts, data.createPost]
              }
            }
          });
        }
      });
      <span style="color: #50fa7b;">setNewPost</span>({ <span style="color: #8be9fd;">title</span>: <span style="color: #f1fa8c; font-style: italic;">''</span>, <span style="color: #8be9fd;">content</span>: <span style="color: #f1fa8c; font-style: italic;">''</span> });
    } <span style="color: #ff79c6; font-weight: bold;">catch</span> (<span style="color: #8be9fd;">err</span>) {
      console.error(<span style="color: #f1fa8c; font-style: italic;">'Error creating post:'</span>, err);
    } <span style="color: #ff79c6; font-weight: bold;">finally</span> {
      <span style="color: #50fa7b;">setIsSubmitting</span>(<span style="color: #ff79c6; font-weight: bold;">false</span>);
    }
  }, [newPost, userId, createPost]);

  <span style="color: #ff79c6; font-weight: bold;">if</span> (loading) <span style="color: #ff79c6; font-weight: bold;">return</span> <span style="color: #ff79c6; font-weight: bold;">null</span>;
  <span style="color: #ff79c6; font-weight: bold;">if</span> (error) <span style="color: #ff79c6; font-weight: bold;">return</span> <span style="color: #ff79c6; font-weight: bold;">null</span>;
  <span style="color: #ff79c6; font-weight: bold;">return</span> <span style="color: #ff79c6; font-weight: bold;">null</span>;
};

<span style="color: #ff79c6; font-weight: bold;">export</span> <span style="color: #ff79c6; font-weight: bold;">default</span> <span style="color: #8be9fd; font-weight: bold;">UserProfile</span>;
                    ` }} />
                  </pre>
                </div>
              </div>
            </div>
          </div>
        } />
        <Route path="/examples" element={<Examples />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/customer-portal" element={<CustomerPortalPage />} />
        <Route path="/api-integration" element={<APIIntegrationPage />} />
        <Route path="/payroll" element={<PayrollPage />} />
        <Route path="/scheduling" element={<SchedulingPage />} />
        <Route path="/logistics" element={<LogisticsPage />} />
      </Routes>
    </>
  );
};

export default App;