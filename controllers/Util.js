var _ = require('underscore');
class Util {
  /*
   *  Nothing here, yet.
  */
  contructor() {
    // DB Port on RDS is 5432.
  }

  dbConnectionString(env) {
    var user = ''
      , password = ''
      , dbName = '';
    switch(env) {
      case 'qa':
      case 'localhost':
      case 'prod':
        dbString = 'postgres://' + user + ':' + password + '@localhost/' + dryrun;
      break;
    }
    return dbString;
  }
}

module.exports = Util;