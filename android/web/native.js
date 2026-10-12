import { Capacitor, SystemBars, SystemBarsStyle } from '@capacitor/core';
import { App } from '@capacitor/app';

if (Capacitor.isNativePlatform()) {
  const root = document.documentElement;
  const syncBars = () => SystemBars.setStyle({
    style: root.dataset.theme === 'dark' ? SystemBarsStyle.Dark : SystemBarsStyle.Light,
  }).catch(error => console.warn('System bar style could not be updated:', error));
  new MutationObserver(syncBars).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  syncBars();

  const syncViewport = () => {
    root.style.setProperty('--app-visible-height', `${window.visualViewport?.height ?? window.innerHeight}px`);
  };
  window.visualViewport?.addEventListener('resize', syncViewport);
  window.addEventListener('resize', syncViewport);
  syncViewport();

  if (Capacitor.getPlatform() === 'android') {
    App.addListener('backButton', async ({ canGoBack }) => {
      const preview = document.getElementById('hover-preview');
      const fallback = document.getElementById('fallback-detail');
      const popupClose = document.querySelector('.leaflet-popup .detail-close');
      if (preview && !preview.hidden) {
        const close = preview.querySelector('.preview-close');
        if (close) close.click(); else preview.hidden = true;
      } else if (popupClose) {
        popupClose.click();
      } else if (fallback && !fallback.hidden) {
        document.getElementById('close-detail')?.click();
      } else if (document.activeElement instanceof HTMLInputElement) {
        document.activeElement.blur();
      } else if (canGoBack) {
        window.history.back();
      } else {
        await App.exitApp();
      }
    }).catch(error => console.warn('Android back button listener unavailable:', error));
  }
}
