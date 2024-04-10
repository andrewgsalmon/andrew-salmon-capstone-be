// import seed data files, arrays of objects
const usersData = require('../seed-data/users');

exports.seed = async function(knex) {
  await knex('user').del();
  await knex('user').insert(usersData);
};