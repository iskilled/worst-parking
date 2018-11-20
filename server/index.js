const express = require('express');
const mongoose = require('mongoose');
const { ApolloServer } = require('apollo-server-express');
const jwt = require('jsonwebtoken');

require('dotenv').config({ path: 'variables.env' });
const { typeDefs } = require('./graphql/schema');
const { resolvers } = require('./graphql/resolvers');

// Defines the port to be used by the application
const PORT = process.env.PORT || 4000;

// ID cannot represent value: { _bsontype: "ObjectID", ...
const { ObjectId } = mongoose.Types;
ObjectId.prototype.valueOf = function() {
  return this.toString();
};

// Create GraphQL schema
const server = new ApolloServer({
  typeDefs,
  resolvers,
  playground: {
    endpoint: `http://localhost:${PORT}/graphql`,
    // List of possible settings below
    settings: {
      'general.betaUpdates': false,
      'editor.cursorShape': 'line', // possible values: 'line', 'block', 'underline'
      'editor.fontSize': 14,
      'editor.fontFamily': `'Source Code Pro', 'Consolas', 'Inconsolata', 'Droid Sans Mono', 'Monaco', monospace`,
      'editor.theme': 'dark', // possible values: 'dark', 'light'
      'editor.reuseHeaders': true,
      'request.credentials': 'omit', // possible values: 'omit', 'include', 'same-origin'
      'tracing.hideTracingResponse': true,
    }
  }
});

// Initializes express server
const app = express();

// Set up JWT authentication middleware
app.use(async (req, res, next) => {
  const token = req.headers['authorization'];
  if (token !== "null" && token !== "") {
    try {
      const currentUser = await jwt.verify(token, process.env.SECRET);
      req.currentUser = currentUser;
    } catch (err) {
      console.error(err);
    }
  }
  next();
});

// Setup GraphQL Middleware
server.applyMiddleware({ app });

// Connects to database
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true })
  .then(() => console.log('DB connected 🎉'))
  .catch(err => console.error(err));

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});