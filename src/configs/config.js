module.exports = {
  development: {
    username: 'database_username',
    password: 'database_password',
    database: 'project_name_development',
    host: '127.0.0.1',
    dialect: 'postgres',
    operatorsAliases: '0',
  },
  test: {
    username: 'database_username',
    password: 'database_password',
    database: 'project_name_test',
    host: '127.0.0.1',
    dialect: 'postgres',
    operatorsAliases: '0',
  },
  production: {
    username: 'database_username',
    password: 'database_password',
    database: 'project_name_production',
    host: '127.0.0.1',
    dialect: 'postgres',
    operatorsAliases: '0',
  },
};