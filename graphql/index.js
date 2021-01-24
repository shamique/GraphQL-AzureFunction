// Import Apollo Azure integration library
const { ApolloServer, gql } = require('apollo-server-azure-functions');
const { CosmosClient } = require('@azure/cosmos');

// Add correct values to each variable
const connectionString = "ADD_CONNECTION_STRING";
const databaseName = "ADD_DATABASE_NAME";
const containerName = "ADD_CONTAINER_NAME";

// Create connection to Cosmo DB
// Connection string is read from local.settings.json file
const client = new CosmosClient(connectionString);

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type User {
    id: Int,
    first_name: String
    last_name: String,
    email: String
  },

  type Query {
    user(id: Int!): User,
    users: [User]
  }
`;

getUser = async (_, { id }) => {
  let query = "SELECT * FROM c WHERE c.id = @userId";
  let params = [{ name: "@userId", value: id.toString() }];

  let { resources: items } = await client.database(databaseName).container(containerName)
    .items.query({ query: query, parameters: params }).fetchAll();

  if (items.length > 0) {
    return items[0];
  }

  return null;
};

getAllUser = async () => {
  let { resources: items } = await client.database(databaseName).container(containerName)
    .items.query({ query: "SELECT * from c" }).fetchAll();
  return items;
};

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    user: getUser,
    users: getAllUser
  }
};

const server = new ApolloServer({ typeDefs, resolvers, playground: false });
exports.graphqlHandler = server.createHandler();