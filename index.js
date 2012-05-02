/**
 * Cantina: Conf
 *
 * Centralized configuration for Cantina applications.
 *
 * Persists to:
 *   - memory (default)
 *   - file
 *   - redis
 *
 * Basically, a wrapper around nconf.
 */

var Conf = require('./lib/conf.js');

// Export a Singleton instance.
module.exports = new Conf();
