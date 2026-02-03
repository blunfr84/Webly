/**
 * Version Switcher
 * Permet à l'utilisateur de basculer entre la vue desktop et mobile
 */

class VersionSwitcher {
  constructor() {
    this.storageKey = 'webly-version-mode';
    this.mobileStyleId = 'mobile-styles';
    this.init();
  }

  /**
   * Initialise le switcher
   */
  init() {
    // Récupérer la préférence sauvegardée ou détecter automatiquement
    const savedMode = localStorage.getItem(this.storageKey);
    
    if (savedMode) {
      // Utiliser la préférence de l'utilisateur
      this.setMode(savedMode);
    } else {
      // Détection automatique basée sur la taille de l'écran
      const isMobile = window.innerWidth < 768;
      this.setMode(isMobile ? 'mobile' : 'desktop');
    }

    // Ajouter le bouton switcher au header
    this.createSwitcherButton();

    // Écouter les changements de taille d'écran
    window.addEventListener('resize', () => {
      // Si l'utilisateur n'a pas défini de préférence, adapter automatiquement
      if (!localStorage.getItem(this.storageKey)) {
        const isMobile = window.innerWidth < 768;
        this.setMode(isMobile ? 'mobile' : 'desktop');
      }
    });
  }

  /**
   * Défini le mode (mobile ou desktop)
   */
  setMode(mode) {
    if (mode === 'mobile') {
      this.activateMobileMode();
    } else {
      this.activateDesktopMode();
    }

    // Sauvegarder la préférence
    localStorage.setItem(this.storageKey, mode);
    
    // Mettre à jour le bouton switcher
    this.updateSwitcherButton(mode);

    // Émettre un événement personnalisé
    window.dispatchEvent(new CustomEvent('versionChanged', { detail: { mode } }));
  }

  /**
   * Active la version mobile
   */
  activateMobileMode() {
    let mobileLink = document.getElementById(this.mobileStyleId);
    
    if (!mobileLink) {
      mobileLink = document.createElement('link');
      mobileLink.id = this.mobileStyleId;
      mobileLink.rel = 'stylesheet';
      mobileLink.href = '/css/mobile.css';
      document.head.appendChild(mobileLink);
    }
    
    // Ajouter une classe au body pour les contrôles CSS supplémentaires
    document.body.classList.add('mobile-view');
    document.body.classList.remove('desktop-view');
  }

  /**
   * Active la version desktop
   */
  activateDesktopMode() {
    const mobileLink = document.getElementById(this.mobileStyleId);
    
    if (mobileLink) {
      mobileLink.remove();
    }
    
    // Enlever la classe mobile
    document.body.classList.remove('mobile-view');
    document.body.classList.add('desktop-view');
  }

  /**
   * Crée le bouton switcher
   */
  createSwitcherButton() {
    // Attendre que le header soit prêt
    const waitForNav = () => {
      const nav = document.querySelector('nav');
      
      if (nav) {
        const button = document.createElement('button');
        button.id = 'version-switcher-btn';
        button.className = 'version-switcher';
        button.innerHTML = '📱 Version mobile';
        button.type = 'button';
        
        button.addEventListener('click', () => {
          const currentMode = localStorage.getItem(this.storageKey) || 'desktop';
          const newMode = currentMode === 'mobile' ? 'desktop' : 'mobile';
          this.setMode(newMode);
        });
        
        // Insérer le bouton dans le nav
        nav.appendChild(button);
      } else {
        // Réessayer si le header n'est pas encore chargé
        setTimeout(waitForNav, 100);
      }
    };

    waitForNav();
  }

  /**
   * Met à jour le texte du bouton switcher
   */
  updateSwitcherButton(mode) {
    const btn = document.getElementById('version-switcher-btn');
    if (btn) {
      btn.innerHTML = mode === 'mobile' ? '🖥️ Version desktop' : '📱 Version mobile';
    }
  }

  /**
   * Basculer entre les modes
   */
  toggle() {
    const currentMode = localStorage.getItem(this.storageKey) || 'desktop';
    const newMode = currentMode === 'mobile' ? 'desktop' : 'mobile';
    this.setMode(newMode);
  }

  /**
   * Obtenir le mode actuel
   */
  getCurrentMode() {
    return localStorage.getItem(this.storageKey) || 'desktop';
  }

  /**
   * Réinitialiser la préférence (utiliser la détection automatique)
   */
  resetPreference() {
    localStorage.removeItem(this.storageKey);
    const isMobile = window.innerWidth < 768;
    this.setMode(isMobile ? 'mobile' : 'desktop');
  }
}

// Initialiser au chargement du document
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.versionSwitcher = new VersionSwitcher();
  });
} else {
  window.versionSwitcher = new VersionSwitcher();
}
