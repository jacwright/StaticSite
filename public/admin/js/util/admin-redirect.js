(function() {

  (function() {
    if (location.hostname === 's3.amazonaws.com' && location.protocol === 'https:') {
      return;
    }
    if (location.hostname !== 's3.amazonaws.com') {
      location.href = '/admin/';
    } else if (location.protocol !== 'https:') {
      location.protocol = 'https:';
    }
    throw new Error('Cannot administer site from this location. Redirecting...');
  })();

}).call(this);
