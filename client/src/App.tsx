import { useState, useEffect } from 'react'
import './App.css'
import ContactModal from './components/ContactModal'
import AboutModal from './components/AboutModal'
import ServicesModal from './components/ServicesModal'

type WindowName = 'businessProfile' | 'coreServices' | 'systemAnalysis' | 'keyMetrics';

interface WindowState {
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
}

interface WindowStates {
  [key: string]: WindowState;
}

// Add a comment to trigger deployment
function App() {
  const [code1, setCode1] = useState('')
  const [code2, setCode2] = useState('')
  const [scraperOutput, setScraperOutput] = useState('')
  const [serverStatus, setServerStatus] = useState('checking...')
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false)
  const [isServicesModalOpen, setIsServicesModalOpen] = useState(false)
  const [windowStates, setWindowStates] = useState<WindowStates>({
    businessProfile: { isOpen: true, isMinimized: false, isMaximized: false },
    coreServices: { isOpen: true, isMinimized: false, isMaximized: false },
    systemAnalysis: { isOpen: true, isMinimized: false, isMaximized: false },
    keyMetrics: { isOpen: true, isMinimized: false, isMaximized: false }
  })

  const toggleWindow = (windowName: WindowName, action: 'close' | 'minimize' | 'maximize') => {
    setWindowStates(prev => ({
      ...prev,
      [windowName]: {
        ...prev[windowName],
        isOpen: action === 'close' ? false : prev[windowName].isOpen,
        isMinimized: action === 'minimize' ? !prev[windowName].isMinimized : prev[windowName].isMinimized,
        isMaximized: action === 'maximize' ? !prev[windowName].isMaximized : prev[windowName].isMaximized
      }
    }))
  }

  const legacyCode = `// Business Profile & Metrics
interface BusinessMetrics {
  developmentSpeed: 'Rapid' | 'Efficient';
  costEfficiency: 'Competitive' | 'Optimized';
  teamExpertise: 'Expert' | 'Specialized';
}

class ServiceOfferings {
  private metrics: BusinessMetrics = {
    developmentSpeed: 'Rapid',
    costEfficiency: 'Competitive',
    teamExpertise: 'Expert'
  };

  public deliverProject(requirements: string): void {
    console.log('Delivering solutions in days, not weeks');
    console.log('Transforming requirements into systems');
  }

  public optimizeCosts(currentExpenses: number): number {
    return currentExpenses * 0.4; // 60% cost reduction
  }
}

class ServiceDelivery {
  public async analyzeNeeds(
    context: string
  ): Promise<void> {
    console.log('Deep analysis of requirements');
    console.log('Custom architecture design');
  }

  public validateQuality(
    metrics: BusinessMetrics
  ): boolean {
    return Object.values(metrics).every(metric => 
      metric === 'Rapid' || 
      metric === 'Competitive' || 
      metric === 'Expert'
    );
  }
}`

const modernCode = `// Core Services & Features
class ModernSolutions {
  private services = {
    customSoftware: 'Full-stack development',
    dataAnalytics: 'Business intelligence',
    automation: 'Process optimization',
    integration: 'API & system integration'
  };

  public async deliverSolution(): Promise<void> {
    console.log('Rapid development cycles');
    console.log('Custom-tailored solutions');
    console.log('Seamless integration');
  }

  public optimizeBusiness(): void {
    console.log('Reduce operational overhead');
    console.log('Enhance workflow efficiency');
    console.log('Implement cost-effective solutions');
  }
}

class BusinessIntelligence {
  public async analyzeData(): Promise<void> {
    console.log('Custom analytics dashboards');
    console.log('Real-time business insights');
    console.log('Predictive analytics');
  }

  public generateReports(): void {
    console.log('Comprehensive business metrics');
    console.log('Custom financial reporting');
    console.log('Performance analytics');
  }
}`

const generatePattern = (width: number, height: number) => {
  const patterns = [
    // Matrix-style rain
    () => {
      let pattern = '';
      for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
          pattern += Math.random() > 0.95 ? '█' : '░';
        }
        pattern += '\n';
      }
      return pattern;
    },
    // Binary pattern
    () => {
      let pattern = '';
      for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
          pattern += Math.random() > 0.5 ? '1' : '0';
        }
        pattern += '\n';
      }
      return pattern;
    },
    // Circuit board pattern
    () => {
      let pattern = '';
      for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
          if (Math.random() > 0.9) {
            pattern += '┼';
          } else if (Math.random() > 0.8) {
            pattern += '─';
          } else if (Math.random() > 0.7) {
            pattern += '│';
          } else {
            pattern += ' ';
          }
        }
        pattern += '\n';
      }
      return pattern;
    },
    // DNA helix
    () => {
      let pattern = '';
      for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
          const x = Math.sin(i * 0.5) * 5 + j;
          pattern += Math.abs(x - j) < 1 ? '█' : '░';
        }
        pattern += '\n';
      }
      return pattern;
    }
  ];
  return patterns[Math.floor(Math.random() * patterns.length)]();
};

const generateMetrics = () => {
  const metrics = [
    `CPU Usage: ${Math.floor(Math.random() * 100)}% [${generateProgressBar(Math.random() * 100)}]`,
    `Memory: ${Math.floor(Math.random() * 1000)}MB / 2048MB [${generateProgressBar(Math.random() * 100)}]`,
    `Network: ${Math.floor(Math.random() * 1000)}KB/s [${generateProgressBar(Math.random() * 100)}]`,
    `Disk I/O: ${Math.floor(Math.random() * 500)}MB/s [${generateProgressBar(Math.random() * 100)}]`,
    `Active Users: ${Math.floor(Math.random() * 1000)} [${generateProgressBar(Math.random() * 100)}]`,
    `Response Time: ${Math.floor(Math.random() * 100)}ms [${generateProgressBar(Math.random() * 100)}]`,
    `Error Rate: ${(Math.random() * 0.1).toFixed(2)}% [${generateProgressBar(Math.random() * 100)}]`,
    `Cache Hit: ${Math.floor(Math.random() * 100)}% [${generateProgressBar(Math.random() * 100)}]`
  ];
  return metrics.join('\n');
};

const generateProgressBar = (percentage: number) => {
  const width = 20;
  const filled = Math.floor(percentage * width / 100);
  return '[' + '█'.repeat(filled) + '░'.repeat(width - filled) + ']';
};

const generateAnalysis = () => {
  const analyses = [
    'Analyzing system performance...',
    'Calculating resource utilization...',
    'Monitoring network traffic...',
    'Evaluating database queries...',
    'Processing user requests...',
    'Optimizing cache efficiency...',
    'Balancing load distribution...',
    'Measuring response times...',
    'Tracking error patterns...',
    'Generating performance reports...',
    'Scanning security protocols...',
    'Updating system metrics...',
    'Compiling analytics data...',
    'Running diagnostics...',
    'Checking system health...'
  ];
  return analyses[Math.floor(Math.random() * analyses.length)];
};

const scraperOutputs = [
  'Analyzing business requirements...',
  'Designing custom solution architecture...',
  'Implementing rapid development cycles...',
  'Integrating modern technologies...',
  'Optimizing operational efficiency...',
  'Deploying cost-effective solutions...',
  'Configuring analytics dashboards...',
  'Setting up automated workflows...',
  'Implementing API integrations...',
  'Finalizing custom features...'
];

const keyMetrics = [
  { value: '60%', label: 'Cost Reduction' },
  { value: '5 Days', label: 'Average Delivery' },
  { value: '15+', label: 'Years Experience' },
  { value: '99.9%', label: 'Uptime' }
];

useEffect(() => {
  const typeCode = async (code: string, setCode: React.Dispatch<React.SetStateAction<string>>) => {
    let currentCode = '';
    for (let i = 0; i < code.length; i++) {
      currentCode += code[i];
      setCode(currentCode);
      await new Promise(resolve => setTimeout(resolve, 20));
    }
  }

  const runScraper = async () => {
    let currentOutput = '';
    let patternCount = 0;
    
    const updateScraper = () => {
      if (patternCount % 3 === 0) {
        currentOutput = generatePattern(40, 5) + '\n';
      } else if (patternCount % 3 === 1) {
        currentOutput = generateMetrics() + '\n';
      } else {
        currentOutput = generateAnalysis() + '\n';
      }
      setScraperOutput(currentOutput);
      patternCount++;
    };

    // Initial update
    updateScraper();

    // Set up interval for continuous updates
    const interval = setInterval(updateScraper, 1500); // Faster updates

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }

  const checkServer = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/health')
      const data = await response.json()
      setServerStatus(data.message)
    } catch (error) {
      setServerStatus('Server is not running')
    }
  }

  typeCode(legacyCode, setCode1)
  typeCode(modernCode, setCode2)
  runScraper()
  checkServer()
}, [])

return (
  <div className="app">
    <div className="title-bar">
      <h1 className="company-name">Ontogeny Studios</h1>
      <nav className="nav-links">
        <a href="#" className="nav-link" onClick={(e) => {
          e.preventDefault();
          setIsAboutModalOpen(true);
        }}>About</a>
        <a href="#" className="nav-link" onClick={(e) => {
          e.preventDefault();
          setIsServicesModalOpen(true);
        }}>Services</a>
        <a href="#" className="nav-link" onClick={(e) => {
          e.preventDefault();
          setIsContactModalOpen(true);
        }}>Contact</a>
      </nav>
    </div>

    {windowStates.businessProfile.isOpen && (
      <div className={`terminal-window ${windowStates.businessProfile.isMinimized ? 'minimized' : ''}`}>
        <div className="terminal-header">
          <span className="terminal-title">Business Profile</span>
          <div className="terminal-controls">
            <div 
              className="terminal-control minimize" 
              onClick={() => toggleWindow('businessProfile', 'minimize')}
            />
            <div 
              className="terminal-control maximize" 
              onClick={() => toggleWindow('businessProfile', 'maximize')}
            />
            <div 
              className="terminal-control close" 
              onClick={() => toggleWindow('businessProfile', 'close')}
            />
          </div>
        </div>
        <div className="terminal-content">
          <div className="typing">
            {code1.split('\n').map((line, i) => {
              if (line.startsWith('*')) return <span key={i} className="comment">{line}</span>
              if (line.startsWith('interface')) return <span key={i} className="type">{line}</span>
              if (line.startsWith('class')) return <span key={i} className="type">{line}</span>
              if (line.includes('async')) return <span key={i} className="keyword">{line}</span>
              if (line.includes('private')) return <span key={i} className="keyword">{line}</span>
              if (line.includes('constructor')) return <span key={i} className="function">{line}</span>
              if (line.includes('get')) return <span key={i} className="function">{line}</span>
              if (line.includes('//')) return <span key={i} className="comment">{line}</span>
              if (line.match(/\d+/)) return <span key={i} className="number">{line}</span>
              if (line.match(/['"`].*['"`]/)) return <span key={i} className="string">{line}</span>
              return <span key={i}>{line}</span>
            })}
          </div>
        </div>
      </div>
    )}

    {windowStates.coreServices.isOpen && (
      <div className={`terminal-window ${windowStates.coreServices.isMinimized ? 'minimized' : ''}`}>
        <div className="terminal-header">
          <span className="terminal-title">Core Services</span>
          <div className="terminal-controls">
            <div 
              className="terminal-control minimize" 
              onClick={() => toggleWindow('coreServices', 'minimize')}
            />
            <div 
              className="terminal-control maximize" 
              onClick={() => toggleWindow('coreServices', 'maximize')}
            />
            <div 
              className="terminal-control close" 
              onClick={() => toggleWindow('coreServices', 'close')}
            />
          </div>
        </div>
        <div className="terminal-content">
          <div className="typing">
            {code2.split('\n').map((line, i) => {
              if (line.startsWith('*')) return <span key={i} className="comment">{line}</span>
              if (line.startsWith('interface')) return <span key={i} className="type">{line}</span>
              if (line.startsWith('class')) return <span key={i} className="type">{line}</span>
              if (line.includes('async')) return <span key={i} className="keyword">{line}</span>
              if (line.includes('private')) return <span key={i} className="keyword">{line}</span>
              if (line.includes('constructor')) return <span key={i} className="function">{line}</span>
              if (line.includes('deliver')) return <span key={i} className="function">{line}</span>
              if (line.includes('//')) return <span key={i} className="comment">{line}</span>
              if (line.match(/\d+/)) return <span key={i} className="number">{line}</span>
              if (line.match(/['"`].*['"`]/)) return <span key={i} className="string">{line}</span>
              return <span key={i}>{line}</span>
            })}
          </div>
        </div>
      </div>
    )}

    {windowStates.keyMetrics.isOpen && (
      <div className={`key-metrics ${windowStates.keyMetrics.isMinimized ? 'minimized' : ''}`}>
        <div className="key-metrics-header">
          <div className="key-metrics-title">Business Impact Analysis</div>
          <div className="terminal-controls">
            <div 
              className="terminal-control minimize" 
              onClick={() => toggleWindow('keyMetrics', 'minimize')}
            />
            <div 
              className="terminal-control maximize" 
              onClick={() => toggleWindow('keyMetrics', 'maximize')}
            />
            <div 
              className="terminal-control close" 
              onClick={() => toggleWindow('keyMetrics', 'close')}
            />
          </div>
        </div>
        <div className="key-metrics-content">
          <div className="key-metrics-grid">
            {keyMetrics.map((metric, index) => (
              <div key={index} className="metric-card">
                <div className="metric-value">{metric.value}</div>
                <div className="metric-label">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}

    {windowStates.systemAnalysis.isOpen && (
      <div className={`terminal-window scraper-window ${windowStates.systemAnalysis.isMinimized ? 'minimized' : ''}`}>
        <div className="terminal-header">
          <span className="terminal-title">System Analysis</span>
          <div className="terminal-controls">
            <div 
              className="terminal-control minimize" 
              onClick={() => toggleWindow('systemAnalysis', 'minimize')}
            />
            <div 
              className="terminal-control maximize" 
              onClick={() => toggleWindow('systemAnalysis', 'maximize')}
            />
            <div 
              className="terminal-control close" 
              onClick={() => toggleWindow('systemAnalysis', 'close')}
            />
          </div>
        </div>
        <div className="terminal-content">
          <pre className="typing">
            {scraperOutput}
          </pre>
        </div>
      </div>
    )}

    <ContactModal 
      isOpen={isContactModalOpen} 
      onClose={() => setIsContactModalOpen(false)} 
    />

    <AboutModal 
      isOpen={isAboutModalOpen} 
      onClose={() => setIsAboutModalOpen(false)} 
    />

    <ServicesModal 
      isOpen={isServicesModalOpen} 
      onClose={() => setIsServicesModalOpen(false)} 
    />
  </div>
)
}

export default App
