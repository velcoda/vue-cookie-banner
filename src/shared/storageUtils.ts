const getConsentValuesFromStorage = (): Array<string> => {
  const cookieComply = localStorage.getItem('cookie-banner');

  if (!cookieComply) {
    return [];
  }

  if (cookieComply === 'all') {
    return ['all'];
  }

  return JSON.parse(cookieComply);
};

export { getConsentValuesFromStorage };
