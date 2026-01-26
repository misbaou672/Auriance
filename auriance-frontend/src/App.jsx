// src/App.jsx
import React, { useState, useEffect } from 'react';
import { getCurrentUser } from './services/api';
import { LanguageProvider } from './contexts/LanguageContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Inscription from './pages/inscription';
import Demo from './pages/demo';
import VoiceRecognitionWithSidebar from './pages/VoiceRecognitionWithSidebar';
// Marketing Pages
import MarketingHome from './pages/marketing/MarketingHome';
import FeaturesPage from './pages/marketing/FeaturesPage';
import PricingPage from './pages/marketing/PricingPage';
import ApiDocsPage from './pages/marketing/ApiDocsPage';
import ContactPage from './pages/marketing/ContactPage';
import FAQPage from './pages/marketing/FAQPage';
import SettingsPage from './pages/settings/SettingsPage';
import GlobalAIChat from './components/GlobalAIChat';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [history, setHistory] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const navigate = (page) => {
    setHistory(prev => [...prev, currentPage]);
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const goBack = () => {
    if (history.length > 0) {
      const prevPage = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      setCurrentPage(prevPage);
    } else {
      setCurrentPage('home');
    }
  };

  useEffect(() => {
    // 1. Restauration Session Utilisateur
    const token = localStorage.getItem('token');
    if (token) {
      getCurrentUser(token)
        .then(user => {
          console.log("Session restaurée pour:", user.username);
          setCurrentUser(user);
        })
        .catch(err => {
          console.error("Session invalide:", err);
          localStorage.removeItem('token');
        });
    }

    // 2. Application des Préférences Globales
    try {
      const savedSettings = localStorage.getItem('auriance_settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        const root = document.documentElement;
        if (settings.fontSize) {
          switch (settings.fontSize) {
            case 'small': root.style.fontSize = '14px'; break;
            case 'medium': root.style.fontSize = '16px'; break;
            case 'large': root.style.fontSize = '20px'; break;
            default: root.style.fontSize = '16px';
          }
        }
      }
    } catch (e) {
      console.warn("Erreur chargement préférences:", e);
    }
  }, []);

  const handleLoginSuccess = (data) => {
    setCurrentUser(data.user);
    navigate('voice');
  };

  const handleRegisterSuccess = (data) => {
    setCurrentUser(data.user);
    navigate('voice');
  };

  // Helper to check if we are on a marketing page to render Header/Footer
  const isMarketingPage = ['features', 'pricing', 'docs', 'contact', 'faq'].includes(currentPage);

  return (
    <LanguageProvider>
      <div className="App">
        {/* HEADER GLOBAL (pour pages marketing) */}
        {isMarketingPage && (
          <Header
            onNavigate={(page) => navigate(page)}
            onNavigateToLogin={() => navigate('login')}
            currentUser={currentUser}
            onNavigateToDashboard={() => navigate('voice')}
          />
        )}

        {/* ROUTES MARKETING */}
        {currentPage === 'home' && (
          <Home
            onNavigate={(page) => navigate(page)}
            onNavigateToDemo={() => navigate('demo')}
            onNavigateToLogin={() => navigate('login')}
            currentUser={currentUser}
            onNavigateToDashboard={() => navigate('voice')}
          />
        )}
        {currentPage === 'features' && <FeaturesPage onBack={() => goBack()} />}
        {currentPage === 'pricing' && <PricingPage onNavigateToContact={() => navigate('contact')} />}
        {currentPage === 'docs' && <ApiDocsPage />}
        {currentPage === 'contact' && <ContactPage />}
        {currentPage === 'faq' && (
          <FAQPage
            onNavigate={(page) => navigate(page)}
            onNavigateToLogin={() => navigate('login')}
            currentUser={currentUser}
            onNavigateToDashboard={() => navigate('voice')}
          />
        )}

        {/* FOOTER GLOBAL (pour pages marketing) */}
        {isMarketingPage && <Footer />}

        {/* APPLICATION PAGES (No Header/Footer from Marketing) */}
        {currentPage === 'login' && (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onNavigateToRegister={() => navigate('inscription')}
          />
        )}
        {currentPage === 'inscription' && (
          <Inscription
            onRegisterSuccess={handleRegisterSuccess}
            onNavigateToLogin={() => navigate('login')}
            onNavigateToHome={() => navigate('home')}
          />
        )}
        {currentPage === 'voice' && currentUser && (
          <VoiceRecognitionWithSidebar
            user={currentUser}
            onBack={() => navigate('home')}
            onLogout={() => {
              localStorage.removeItem('token');
              setCurrentUser(null);
              navigate('login');
            }}
          />
        )}
        {currentPage === 'settings' && currentUser && (
          <SettingsPage
            currentUser={currentUser}
            onLogout={() => {
              localStorage.removeItem('token');
              setCurrentUser(null);
              navigate('login');
            }}
          />
        )}
        {currentPage === 'demo' && (
          <Demo
            onNavigate={(page) => navigate(page)}
            onNavigateToLogin={() => navigate('login')}
            currentUser={currentUser}
            onNavigateToDashboard={() => navigate('voice')}
          />
        )}

        {/* Assistant IA Global */}
        <GlobalAIChat />
      </div>
    </LanguageProvider>
  );
}

export default App;