import React, { useState } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  Menu, 
  X, 
  ChevronRight,
  Home,
  Zap,
  Brain,
  Target,
  Settings,
  Database,
  Code,
  HelpCircle,
  Shield,
  Search,
  GitBranch,
  ExternalLink
} from 'lucide-react';

// Documentation page components (will be created in subsequent tasks)
import GettingStarted from './docs/GettingStarted';
import SystemOverview from './docs/SystemOverview';
import WisdomOracleAPI from './docs/WisdomOracleAPI';
import AletheiaAPI from './docs/AletheiaAPI';
import MASEvaluationAPI from './docs/MASEvaluationAPI';
import StressTestingAPI from './docs/StressTestingAPI';
import ScenarioExportAPI from './docs/ScenarioExportAPI';
import DatabaseSchemas from './docs/DatabaseSchemas';
import AdvancedTutorials from './docs/AdvancedTutorials';
import ConfigurationGuide from './docs/ConfigurationGuide';
import APIExamples from './docs/APIExamples';
import Troubleshooting from './docs/Troubleshooting';
import InteractiveAPIExplorer from './docs/InteractiveAPIExplorer';
import SystemArchitecture from './docs/SystemArchitecture';
import SecurityGuide from './docs/SecurityGuide';
import DeploymentGuide from './docs/DeploymentGuide';
import VersionHistory from './docs/VersionHistory';

const Documentation = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  const navigationStructure = [
    {
      section: 'Getting Started',
      icon: Home,
      items: [
        { id: 'getting-started', title: 'Quick Start Guide', path: '/docs/getting-started' },
        { id: 'system-overview', title: 'System Overview', path: '/docs/overview' },
        { id: 'configuration', title: 'Configuration & Setup', path: '/docs/configuration' },
      ]
    },
    {
      section: 'API Reference',
      icon: Code,
      items: [
        { id: 'wisdom-oracle-api', title: 'Wisdom Oracle API', path: '/docs/api/wisdom-oracle' },
        { id: 'aletheia-api', title: 'Aletheia Learning API', path: '/docs/api/aletheia' },
        { id: 'mas-evaluation-api', title: 'MAS Evaluation API', path: '/docs/api/mas-evaluation' },
        { id: 'stress-testing-api', title: 'Stress Testing API', path: '/docs/api/stress-testing' },
        { id: 'scenario-export-api', title: 'Scenario Export API', path: '/docs/api/scenario-export' },
      ]
    },
    {
      section: 'Data & Schemas',
      icon: Database,
      items: [
        { id: 'database-schemas', title: 'Database Schemas', path: '/docs/schemas' },
        { id: 'api-examples', title: 'API Examples', path: '/docs/examples' },
      ]
    },
    {
      section: 'Tutorials',
      icon: Brain,
      items: [
        { id: 'advanced-tutorials', title: 'Advanced Tutorials', path: '/docs/tutorials' },
        { id: 'system-architecture', title: 'System Architecture', path: '/docs/architecture' },
      ]
    },
    {
      section: 'Tools',
      icon: Zap,
      items: [
        { id: 'api-explorer', title: 'Interactive API Explorer', path: '/docs/api-explorer' },
      ]
    },
    {
      section: 'Operations',
      icon: Settings,
      items: [
        { id: 'deployment', title: 'Deployment Guide', path: '/docs/deployment' },
        { id: 'security', title: 'Security & Authentication', path: '/docs/security' },
        { id: 'troubleshooting', title: 'Troubleshooting', path: '/docs/troubleshooting' },
      ]
    },
    {
      section: 'Reference',
      icon: HelpCircle,
      items: [
        { id: 'version-history', title: 'Version History', path: '/docs/changelog' },
      ]
    },
  ];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <button 
              onClick={toggleSidebar}
              style={styles.menuButton}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div style={styles.headerTitle}>
              <BookOpen style={styles.headerIcon} />
              <h1 style={styles.title}>Aethos & Aletheia Documentation</h1>
            </div>
          </div>
          
          <div style={styles.headerRight}>
            <div style={styles.searchContainer}>
              <Search style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            <a 
              href="https://github.com/your-org/aethos-aletheia" 
              target="_blank" 
              rel="noopener noreferrer"
              style={styles.githubLink}
            >
              <GitBranch size={20} />
              <ExternalLink size={14} style={styles.externalIcon} />
            </a>
          </div>
        </div>
      </header>

      <div style={styles.mainContent}>
        {/* Sidebar */}
        <aside 
          style={{
            ...styles.sidebar,
            transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          }}
        >
          <nav style={styles.navigation}>
            {navigationStructure.map((section, sectionIndex) => (
              <div key={sectionIndex} style={styles.navSection}>
                <div style={styles.sectionHeader}>
                  <section.icon style={styles.sectionIcon} />
                  <h3 style={styles.sectionTitle}>{section.section}</h3>
                </div>
                <ul style={styles.navList}>
                  {section.items.map((item) => (
                    <li key={item.id} style={styles.navItem}>
                      <Link
                        to={item.path}
                        style={{
                          ...styles.navLink,
                          ...(isActiveLink(item.path) ? styles.navLinkActive : {})
                        }}
                      >
                        <ChevronRight style={styles.navChevron} />
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Documentation Content */}
        <main style={styles.content}>
          <Routes>
            {/* Redirect root docs to getting started */}
            <Route path="/" element={<Navigate to="/docs/getting-started" replace />} />
            
            {/* Getting Started Section */}
            <Route path="/getting-started" element={<GettingStarted />} />
            <Route path="/overview" element={<SystemOverview />} />
            <Route path="/configuration" element={<ConfigurationGuide />} />
            
            {/* API Reference */}
            <Route path="/api/wisdom-oracle" element={<WisdomOracleAPI />} />
            <Route path="/api/aletheia" element={<AletheiaAPI />} />
            <Route path="/api/mas-evaluation" element={<MASEvaluationAPI />} />
            <Route path="/api/stress-testing" element={<StressTestingAPI />} />
            <Route path="/api/scenario-export" element={<ScenarioExportAPI />} />
            
            {/* Data & Schemas */}
            <Route path="/schemas" element={<DatabaseSchemas />} />
            <Route path="/examples" element={<APIExamples />} />
            
            {/* Tutorials */}
            <Route path="/tutorials" element={<AdvancedTutorials />} />
            <Route path="/architecture" element={<SystemArchitecture />} />
            
            {/* Tools */}
            <Route path="/api-explorer" element={<InteractiveAPIExplorer />} />
            
            {/* Operations */}
            <Route path="/deployment" element={<DeploymentGuide />} />
            <Route path="/security" element={<SecurityGuide />} />
            <Route path="/troubleshooting" element={<Troubleshooting />} />
            
            {/* Reference */}
            <Route path="/changelog" element={<VersionHistory />} />
            
            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/docs/getting-started" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#0a0f14',
    color: '#cfd8e3',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    backgroundColor: 'rgba(11, 14, 17, 0.95)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '12px 24px',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    backdropFilter: 'blur(8px)',
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  menuButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    backgroundColor: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    color: '#cfd8e3',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  headerIcon: {
    width: '28px',
    height: '28px',
    color: '#23d9d9',
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    margin: 0,
    color: '#ffffff',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  searchContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    width: '16px',
    height: '16px',
    color: '#8f9aa6',
    zIndex: 1,
  },
  searchInput: {
    width: '300px',
    padding: '8px 16px 8px 40px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    color: '#cfd8e3',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s ease',
  },
  githubLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    color: '#cfd8e3',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'all 0.2s ease',
  },
  externalIcon: {
    opacity: 0.6,
  },
  mainContent: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  sidebar: {
    width: '320px',
    backgroundColor: 'rgba(11, 14, 17, 0.6)',
    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'transform 0.3s ease',
    overflow: 'auto',
    flexShrink: 0,
  },
  navigation: {
    padding: '24px 0',
  },
  navSection: {
    marginBottom: '32px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0 24px 12px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    marginBottom: '16px',
  },
  sectionIcon: {
    width: '18px',
    height: '18px',
    color: '#23d9d9',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  navList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  navItem: {
    margin: '2px 0',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 24px',
    color: '#8f9aa6',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    borderLeft: '3px solid transparent',
  },
  navLinkActive: {
    color: '#23d9d9',
    backgroundColor: 'rgba(35, 217, 217, 0.1)',
    borderLeftColor: '#23d9d9',
  },
  navChevron: {
    width: '14px',
    height: '14px',
    opacity: 0.6,
  },
  content: {
    flex: 1,
    overflow: 'auto',
    backgroundColor: '#0a0f14',
  },
};

export default Documentation;