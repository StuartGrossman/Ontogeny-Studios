import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Examples from './pages/Examples';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <Main />
    </Router>
  );
};

const Main: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const codeContentRef = useRef<HTMLDivElement>(null);
  const [codeBoxOpacity, setCodeBoxOpacity] = useState(1);
  const [isHoveringRightSide, setIsHoveringRightSide] = useState(false);

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

  const handleMouseEnter = () => {
    console.log('Mouse entered right side');
    setIsHoveringRightSide(true);
  };
  const handleMouseLeave = () => {
    console.log('Mouse left right side');
    setIsHoveringRightSide(false);
  };

  return (
    <>
      <Navbar />
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
                    <div className="static-text" style={{ opacity: 1 - codeBoxOpacity, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', zIndex: 0 }}>
                      <h2>Discover More</h2>
                      <p>Scroll down to explore additional content and insights.</p>
            </div>
          </div>
        } />
        <Route path="/examples" element={<Examples />} />
      </Routes>
    </>
  );
};

export default App;