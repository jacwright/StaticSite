(function() {

  define(['./crypto/crypto'], function() {
    return {
      aes: Crypto.AES,
      md5: Crypto.MD5,
      sha1: Crypto.SHA1,
      hmac: Crypto.HMAC,
      utf8: {
        encode: Utf8.encode,
        decode: Utf8.decode
      },
      hex: {
        toBytes: Crypto.util.hexToBytes,
        toHex: Crypto.util.bytesToHex
      },
      base64: {
        encrypt: Crypto.util.bytesToBase64,
        decrypt: Crypto.util.base64ToBytes
      }
    };
  });

}).call(this);
