'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/writing',
      handler: 'writing.index',
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/writing/:slug',
      handler: 'writing.article',
      config: { auth: false },
    },
  ],
};
