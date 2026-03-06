/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE analytics_events (
      id SERIAL PRIMARY KEY,
      event_type VARCHAR(100) NOT NULL,
      user_id INTEGER,
      properties JSONB NOT NULL DEFAULT '{}',
      timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX analytics_events_event_type_idx ON analytics_events(event_type);
    CREATE INDEX analytics_events_user_id_idx ON analytics_events(user_id);
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.sql('DROP TABLE IF EXISTS analytics_events CASCADE;');
};
