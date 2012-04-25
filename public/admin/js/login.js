(function() {

  require(['app/auth', 'util/admin-redirect'], function(auth) {
    return $(function() {
      var siteName;
      $('body').fadeIn();
      $('div.alert').hide();
      siteName = location.pathname.split('/')[1];
      if (siteName === 'websights') {
        $('a.cancel').remove();
      } else {
        $('a.cancel').attr('href', 'http://' + siteName + '/');
        $('#site-name').text(siteName);
      }
      $('#username').focus();
      $('#loginform').submit(function(event) {
        var password, rememberme, username;
        event.preventDefault();
        $('#alerts').slideUp('fast');
        username = $('#username').val();
        password = $('#password').val();
        rememberme = $('#rememberme').prop('checked');
        return auth.login(username, password, rememberme).then(function() {
          return location.href = './';
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
