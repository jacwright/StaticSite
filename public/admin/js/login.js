(function() {

  require(['app/auth', 'util/admin-redirect'], function(auth) {
    return $(function() {
      $('body').fadeIn();
      $('div.alert-message').hide();
      $('.cancel').click(function(event) {
        event.preventDefault();
        return history.back();
      });
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
      $('div.alert-message .close').click(function(event) {
        event.preventDefault();
        $(this).closest('.alert-message').slideUp('fast');
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
