(function() {

  require(['app/auth', 'util/admin-redirect'], function(auth) {
    return $(function() {
      $('body').fadeIn();
      $('div.alert').hide();
      $('a.cancel').attr('href', $('a.cancel').attr('href') + location.hash);
      $('#key').focus();
      $('#registerform').submit(function(event) {
        var key, password, rememberme, secret, username;
        event.preventDefault();
        $('#alerts').slideUp('fast');
        key = $('#key').val();
        secret = $('#secret').val();
        username = $('#username').val();
        password = $('#password').val();
        rememberme = $('#rememberme').prop('checked');
        return auth.register(key, secret, username, password, rememberme).then(function() {
          return auth.login(username, password, rememberme).then(function() {
            return location.pathname = location.pathname.replace(/[^\/]+$/, '');
          }, function(err) {
            console.log(err);
            return $('#alerts').slideDown('fast').find('.msg').text(err.message);
          });
        }, function(err) {
          console.log(err);
          return $('#alerts').slideDown('fast').find('.msg').text(err.message);
        });
      });
      $('div.alert .close').click(function(event) {
        event.preventDefault();
        $(this).closest('.alert').slideUp('fast');
        return $('#key').focus();
      });
      return $('#registerform').keyup(function(event) {
        if (event.which === 27) return location.href = $('a.cancel').attr('href');
      });
    });
  });

}).call(this);
