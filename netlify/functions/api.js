const express = require('express');
const serverless = require('serverless-http');
const { registerRoutes } = require('../../server/routes.ts');

const app = express();
app.use(express.json());

// Register all routes with the express app
registerRoutes(app).then(() => {
  console.log('Routes registered successfully');
});

// Map API routes to /.netlify/functions/api/
const handler = serverless(app, {
  basePath: '/api'
});

module.exports = { handler };