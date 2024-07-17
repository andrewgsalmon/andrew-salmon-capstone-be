exports.up = function(knex) {
  return knex.schema.table('likes', function(table) {
    table.string('artist_genre');
  });
};

exports.down = function(knex) {
  return knex.schema.table('likes', function(table) {
    table.dropColumn('artist_genre');
  });
};