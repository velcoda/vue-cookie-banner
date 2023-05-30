import CookieBanner from './components/CookieBanner.vue';

export default {
  install: (app) => {
    if (!window) return;

    app.component('VueCookieBanner', CookieBanner);
  },
};
