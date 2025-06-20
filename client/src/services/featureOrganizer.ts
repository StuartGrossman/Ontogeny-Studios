export interface FeatureItem {
  text: string;
  priority: 'high' | 'medium' | 'low';
  complexity: 'simple' | 'moderate' | 'complex';
  estimatedHours?: number;
  dependencies?: string[];
}

export interface FeatureCategory {
  name: string;
  icon: string;
  description: string;
  features: FeatureItem[];
}

export class FeatureOrganizer {
  private static readonly CATEGORIES = {
    '🔐 Authentication & Security': {
      keywords: ['login', 'auth', 'security', 'password', 'permission', 'role', 'encrypt', '2fa', 'oauth', 'signin', 'signup', 'jwt', 'token', 'session'],
      description: 'User authentication, authorization, and security features'
    },
    '💳 Payment & Billing': {
      keywords: ['payment', 'billing', 'subscription', 'invoice', 'stripe', 'paypal', 'checkout', 'cart', 'purchase', 'credit', 'debit', 'transaction'],
      description: 'Payment processing, billing, and subscription management'
    },
    '🔔 Notifications & Communication': {
      keywords: ['notification', 'email', 'sms', 'push', 'alert', 'message', 'chat', 'mail', 'communication', 'reminder', 'webhook'],
      description: 'Messaging, notifications, and communication features'
    },
    '🔗 Integrations & APIs': {
      keywords: ['api', 'integration', 'connect', 'sync', 'webhook', 'third-party', 'external', 'import', 'export', 'rest', 'graphql'],
      description: 'External integrations and API connections'
    },
    '🎨 User Interface & Design': {
      keywords: ['ui', 'interface', 'design', 'theme', 'layout', 'style', 'css', 'component', 'visual', 'responsive', 'animation'],
      description: 'User interface design and visual elements'
    },
    '📱 Mobile & Responsive': {
      keywords: ['mobile', 'responsive', 'tablet', 'ios', 'android', 'app', 'touch', 'swipe', 'device', 'screen'],
      description: 'Mobile applications and responsive design'
    },
    '🛠️ Admin & Management': {
      keywords: ['admin', 'management', 'control', 'setting', 'config', 'moderate', 'dashboard', 'panel', 'cms', 'backend'],
      description: 'Administrative tools and management features'
    },
    '📊 Data & Analytics': {
      keywords: ['data', 'analytics', 'report', 'chart', 'graph', 'metric', 'statistic', 'insight', 'tracking', 'monitor'],
      description: 'Data analysis, reporting, and analytics'
    },
    '🚀 Performance & Optimization': {
      keywords: ['performance', 'optimization', 'cache', 'speed', 'load', 'compress', 'optimize', 'fast', 'efficient', 'memory'],
      description: 'Performance improvements and optimizations'
    },
    '📈 Reporting & Insights': {
      keywords: ['dashboard', 'overview', 'summary', 'status', 'monitor', 'kpi', 'business intelligence', 'metrics'],
      description: 'Business reporting and insights'
    },
    '💻 Core Functionality': {
      keywords: ['core', 'main', 'primary', 'essential', 'basic', 'fundamental', 'feature', 'function', 'business logic'],
      description: 'Core business logic and primary features'
    },
    '🌐 Other Features': {
      keywords: [],
      description: 'Miscellaneous features and functionality'
    }
  };

  static organizeFeatures(featuresText: string): FeatureCategory[] {
    const featureLines = featuresText.split('\n')
      .filter(line => line.trim())
      .map(line => line.trim());

    const categorizedFeatures: { [key: string]: FeatureItem[] } = {};

    // Initialize categories
    Object.keys(this.CATEGORIES).forEach(category => {
      categorizedFeatures[category] = [];
    });

    featureLines.forEach(feature => {
      const featureItem = this.parseFeature(feature);
      const category = this.categorizeFeature(featureItem.text);
      categorizedFeatures[category].push(featureItem);
    });

    // Convert to FeatureCategory array and filter empty categories
    return Object.entries(categorizedFeatures)
      .filter(([_, features]) => features.length > 0)
      .map(([categoryName, features]) => ({
        name: categoryName,
        icon: categoryName.split(' ')[0],
        description: this.CATEGORIES[categoryName as keyof typeof this.CATEGORIES].description,
        features: features.sort(this.sortFeaturesByPriority)
      }));
  }

  private static parseFeature(featureText: string): FeatureItem {
    // Extract priority from text
    const priorityMatch = featureText.match(/\((high|medium|low) priority\)$/i);
    const cleanText = priorityMatch 
      ? featureText.replace(/\s*\((high|medium|low) priority\)$/i, '')
      : featureText;
    
    const priority = (priorityMatch?.[1]?.toLowerCase() as 'high' | 'medium' | 'low') || 'medium';
    const complexity = this.determineComplexity(cleanText);
    const estimatedHours = this.estimateHours(cleanText, complexity);

    return {
      text: cleanText,
      priority,
      complexity,
      estimatedHours
    };
  }

  private static categorizeFeature(featureText: string): string {
    const lowerText = featureText.toLowerCase();
    
    // Find the best matching category
    for (const [categoryName, categoryInfo] of Object.entries(this.CATEGORIES)) {
      if (categoryInfo.keywords.some(keyword => lowerText.includes(keyword))) {
        return categoryName;
      }
    }
    
    // Default to "Other Features" if no match found
    return '🌐 Other Features';
  }

  private static determineComplexity(featureText: string): 'simple' | 'moderate' | 'complex' {
    const lowerText = featureText.toLowerCase();
    
    // Complex features
    const complexKeywords = [
      'ai', 'machine learning', 'blockchain', 'real-time', 'video', 'streaming',
      'complex algorithm', 'advanced', 'neural', 'deep learning', 'computer vision',
      'natural language', 'recommendation engine', 'big data', 'distributed'
    ];
    
    // Simple features
    const simpleKeywords = [
      'button', 'text', 'color', 'simple', 'basic', 'static', 'display',
      'show', 'hide', 'toggle', 'link', 'image', 'icon'
    ];
    
    if (complexKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'complex';
    }
    
    if (simpleKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'simple';
    }
    
    return 'moderate';
  }

  private static estimateHours(featureText: string, complexity: 'simple' | 'moderate' | 'complex'): number {
    const baseHours = {
      simple: 4,
      moderate: 16,
      complex: 40
    };
    
    const lowerText = featureText.toLowerCase();
    let multiplier = 1;
    
    // Adjust based on scope indicators
    if (lowerText.includes('full') || lowerText.includes('complete') || lowerText.includes('comprehensive')) {
      multiplier *= 1.5;
    }
    
    if (lowerText.includes('integration') || lowerText.includes('api')) {
      multiplier *= 1.3;
    }
    
    if (lowerText.includes('custom') || lowerText.includes('advanced')) {
      multiplier *= 1.4;
    }
    
    return Math.round(baseHours[complexity] * multiplier);
  }

  private static sortFeaturesByPriority(a: FeatureItem, b: FeatureItem): number {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    
    if (priorityDiff !== 0) return priorityDiff;
    
    // Secondary sort by complexity (complex first)
    const complexityOrder = { complex: 0, moderate: 1, simple: 2 };
    return complexityOrder[a.complexity] - complexityOrder[b.complexity];
  }

  static generateFeatureSummary(categories: FeatureCategory[]): {
    totalFeatures: number;
    totalEstimatedHours: number;
    priorityBreakdown: { high: number; medium: number; low: number };
    complexityBreakdown: { simple: number; moderate: number; complex: number };
  } {
    let totalFeatures = 0;
    let totalEstimatedHours = 0;
    const priorityBreakdown = { high: 0, medium: 0, low: 0 };
    const complexityBreakdown = { simple: 0, moderate: 0, complex: 0 };

    categories.forEach(category => {
      category.features.forEach(feature => {
        totalFeatures++;
        totalEstimatedHours += feature.estimatedHours || 0;
        priorityBreakdown[feature.priority]++;
        complexityBreakdown[feature.complexity]++;
      });
    });

    return {
      totalFeatures,
      totalEstimatedHours,
      priorityBreakdown,
      complexityBreakdown
    };
  }
} 