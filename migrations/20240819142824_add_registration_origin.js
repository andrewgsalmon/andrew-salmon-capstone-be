exports.up = function(knex) {
  return knex.schema.table('users', function(table) {
    table.string('auth_provider').defaultTo('local');
  });
};

exports.down = function(knex) {
  return knex.schema.table('users', function(table) {
    table.dropColumn('auth_provider');
  });
};