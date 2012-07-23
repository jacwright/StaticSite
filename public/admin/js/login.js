(function() {

  require(['app/auth', 'util/admin-redirect'], function(auth) {
    return $(function() {
      $('body').fadeIn();
      $('div.alert').hide();
      $('a.register-new').attr('href', $('a.register-new').attr('href') + location.hash);
      $('a.cancel').attr('href', 'http://' + auth.siteName + '/');
      $('#site-name').text(auth.siteName);
      $('#username').focus();
      $('#loginform').submit(function(event) {
        var password, rememberme, username;
        event.preventDefault();
        $('#alerts').slideUp('fast');
        username = $('#username').val();
        password = $('#password').val();
        rememberme = $('#rememberme').prop('checked');
        return auth.login(username, password, rememberme).then(function() {
          return location.pathname = location.pathname.replace(/[^\/]+$/, '');
        }, function(err) {
          console.log(err);
          return $('#alerts').slideDown('fast').find('.msg').text(err.message);
        });
      });
      $('div.alert .close').click(function(event) {
        event.preventDefault();
        $(this).closest('.alert').slideUp('fast');
        return $('#username').focus();
      });
      return $('a.forgot-password').click(function(event) {
        event.preventDefault();
        $('#forgot').toggle('fast');
        return $('#username').focus();
      });
    });
  });

}).call(this);
