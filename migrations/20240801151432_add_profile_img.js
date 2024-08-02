exports.up = function(knex) {
  return knex.schema.table('users', function(table) {
    table.string('profile_img').defaultTo('profile-avatar.jpeg');
  });
};

exports.down = function(knex) {
  return knex.schema.table('users', function(table) {
    table.dropColumn('profile_img');
  });
};
