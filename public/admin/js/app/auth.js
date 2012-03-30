(function() {

  define(['lib/crypto', 'lib/promises', 'lib/s3'], function(crypto, promises, s3) {
    var aes, path, sha1;
    sha1 = crypto.sha1, aes = crypto.aes;
    path = 'auth/';
    return {
      login: function(username, password, remember) {
        var deferred, passwordSha, usernameSha;
        deferred = new promises.Deferred();
        usernameSha = sha1(username);
        passwordSha = sha1(password);
        $.get(path + usernameSha).then(function(cypher) {
          var creds, key, secret, _ref;
          _ref = aes.decrypt(cypher, passwordSha).split(':'), key = _ref[0], secret = _ref[1];
          if (!(key && secret)) {
            return deferred.fail(new Error('Incorrect Password'));
          }
          s3.auth(key, secret);
          creds = username + ':' + key + ':' + secret;
          sessionStorage.setItem('creds', creds);
          if (remember) localStorage.setItem('creds', creds);
          return deferred.fulfill();
        }, function() {
          return deferred.fail(new Error('Incorrect Username'));
        });
        return deferred.promise;
      },
      authorize: function() {
        var creds, key, secret, username, _ref;
        creds = sessionStorage.getItem('creds');
        if (!creds) {
          creds = localStorage.getItem('creds');
          if (creds) sessionStorage.setItem('creds', creds);
        }
        if (!creds) return false;
        _ref = creds.split(':'), username = _ref[0], key = _ref[1], secret = _ref[2];
        s3.auth(key, secret);
        return username;
      }
    };
  });

}).call(this);
