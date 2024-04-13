exports.up = function(knex) {
  return knex.schema.createTable('likes', function(table) {
    table.increments('id').primary();
    table.string('user_email').notNullable();
    table.string('artist_id').notNullable();
    table.string('artist_name').notNullable();
    table.string('artist_img');
    table.timestamp("created_at").defaultTo(knex.fn.now());
      table
        .timestamp("updated_at")
        .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('likes');
};
