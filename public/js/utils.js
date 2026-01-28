/**
 * Utilitaires pour la gestion des durées
 */

/**
 * Convertit les minutes en format lisible (ex: 210 min → 3h30)
 */
function formatDuration(minutes) {
  if (!minutes) return '-';
  
  const mins = Math.floor(minutes);
  
  if (mins < 60) {
    return `${mins}min`;
  }
  
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  
  if (remainingMins === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h${remainingMins}`;
}
