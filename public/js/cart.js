/**
 * Système de panier amélioré
 */

const CART_STORAGE_KEY = 'consultpro_cart';

class Cart {
  constructor() {
    this.items = this.loadFromStorage();
  }

  /**
   * Charge le panier depuis localStorage
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Erreur chargement panier:', e);
      return [];
    }
  }

  /**
   * Sauvegarde le panier dans localStorage
   */
  saveToStorage() {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.items));
      this.notifyObservers();
    } catch (e) {
      console.error('Erreur sauvegarde panier:', e);
    }
  }

  /**
   * Ajoute un service au panier
   */
  addItem(service, quantity = 1, options = {}) {
    const existingItem = this.items.find(item => item.serviceId === service.id);
    const selectedOptions = options.selectedOptions || {};
    // selectedOptions est maintenant un objet: {optionName: quantity, ...}

    if (existingItem) {
      existingItem.quantity += quantity;
      if (selectedOptions !== undefined) {
        existingItem.selectedOptions = { ...existingItem.selectedOptions, ...selectedOptions };
      }
    } else {
      this.items.push({
        serviceId: service.id,
        quantity: quantity,
        service: service,
        selectedOptions: selectedOptions || {}
      });
    }

    this.saveToStorage();
    return this;
  }

  /**
   * Retire un service du panier
   */
  removeItem(serviceId) {
    this.items = this.items.filter(item => item.serviceId !== serviceId);
    this.saveToStorage();
    return this;
  }

  /**
   * Met à jour la quantité
   */
  updateQuantity(serviceId, quantity) {
    const item = this.items.find(i => i.serviceId === serviceId);
    if (item) {
      item.quantity = Math.max(1, parseInt(quantity) || 1);
      this.saveToStorage();
    }
    return this;
  }

  /**
   * Met à jour les options sélectionnées
   */
  setSelectedOptions(serviceId, selectedOptions) {
    const item = this.items.find(i => i.serviceId === serviceId);
    if (item) {
      // selectedOptions est maintenant un objet avec {optionName: quantity}
      item.selectedOptions = (typeof selectedOptions === 'object' && !Array.isArray(selectedOptions)) 
        ? selectedOptions 
        : {};
      this.saveToStorage();
    }
    return this;
  }

  /**
   * Vide le panier
   */
  clear() {
    this.items = [];
    this.saveToStorage();
    return this;
  }

  /**
   * Obtient le nombre total d'articles
   */
  getItemCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Obtient le total du panier
   */
  getTotal() {
    return this.items.reduce((sum, item) => sum + this.getItemTotal(item), 0);
  }

  /**
   * Total d'un article (avec option déplacement)
   */
  getItemTotal(item) {
    const unitPrice = this.getServiceUnitPrice(item.service);
    const optionsTotal = this.getOptionsTotal(item);
    return (unitPrice + optionsTotal) * item.quantity;
  }

  /**
   * Prix unitaire selon le type de service
   */
  getServiceUnitPrice(service) {
    if (!service) return 0;
    if (service.type === 'subscription') {
      return service.subscriptionPrice ?? service.price ?? 0;
    }
    return service.price ?? 0;
  }

  /**
   * Total des options sélectionnées (par unité)
   */
  getOptionsTotal(item) {
    const selected = item.selectedOptions || {};
    const options = Array.isArray(item.service?.options) ? item.service.options : [];
    let total = 0;
    
    for (const [optionName, quantity] of Object.entries(selected)) {
      const opt = options.find(o => o.name === optionName);
      if (opt && quantity > 0) {
        total += (opt.price || 0) * parseInt(quantity);
      }
    }
    
    return total;
  }

  /**
   * Obtient tous les articles
   */
  getItems() {
    return this.items;
  }

  /**
   * Vérifie si le panier est vide
   */
  isEmpty() {
    return this.items.length === 0;
  }

  /**
   * Observateurs pour les mises à jour
   */
  observers = [];

  subscribe(observer) {
    this.observers.push(observer);
  }

  notifyObservers() {
    this.observers.forEach(observer => observer(this));
  }
}

// Instance globale du panier
const cart = new Cart();
