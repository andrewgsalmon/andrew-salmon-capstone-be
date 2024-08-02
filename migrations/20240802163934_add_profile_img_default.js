exports.up = function(knex) {
  return knex.schema.table('users', function(table) {
    table.string('profile_img').defaultTo('profile-avatar.jpeg').alter();
  });
};

exports.down = function(knex) {
  return knex.schema.table('users', function(table) {
    table.string('profile_img').defaultTo(null).alter();
  });
};
