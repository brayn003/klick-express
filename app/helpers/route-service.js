const { Router } = require('express');

const controllerHoc = fn => (req, res, next) => {
  fn(req, res).catch(next);
};

const declareApiRoutes = (routes = []) => {
  const router = Router();
  routes.forEach((route) => {
    const properties = route.replace(/\s+/g, ' ').trim().split(' ');
    if (properties.length < 3) {
      throw new Error(`'${route}' is not a valid route definition`);
    }
    const [method, url, ...controllers] = properties;
    const loadedControllers = controllers.map((c) => {
      const path = `~controllers/${c}`;
      // eslint-disable-next-line import/no-dynamic-require
      return controllerHoc(require(path));
    });
    router[method](url, ...loadedControllers);
  });
  return router;
};

module.exports = { declareApiRoutes };
