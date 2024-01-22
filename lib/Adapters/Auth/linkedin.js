"use strict";

// Helper functions for accessing the linkedin API.
var Parse = require('parse/node').Parse;

const httpsRequest = require('./httpsRequest'); // Returns a promise that fulfills iff this user id is valid.


function validateAuthData(authData) {
  return request('me', authData.access_token, authData.is_mobile_sdk).then(data => {
    if (data && data.id == authData.id) {
      return;
    }

    throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'Linkedin auth is invalid for this user.');
  });
} // Returns a promise that fulfills iff this app id is valid.


function validateAppId() {
  return Promise.resolve();
} // A promisey wrapper for api requests


function request(path, access_token, is_mobile_sdk) {
  var headers = {
    Authorization: 'Bearer ' + access_token,
    'x-li-format': 'json'
  };

  if (is_mobile_sdk) {
    headers['x-li-src'] = 'msdk';
  }

  return httpsRequest.get({
    host: 'api.linkedin.com',
    path: '/v2/' + path,
    headers: headers
  });
}

module.exports = {
  validateAppId: validateAppId,
  validateAuthData: validateAuthData
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9BZGFwdGVycy9BdXRoL2xpbmtlZGluLmpzIl0sIm5hbWVzIjpbIlBhcnNlIiwicmVxdWlyZSIsImh0dHBzUmVxdWVzdCIsInZhbGlkYXRlQXV0aERhdGEiLCJhdXRoRGF0YSIsInJlcXVlc3QiLCJhY2Nlc3NfdG9rZW4iLCJpc19tb2JpbGVfc2RrIiwidGhlbiIsImRhdGEiLCJpZCIsIkVycm9yIiwiT0JKRUNUX05PVF9GT1VORCIsInZhbGlkYXRlQXBwSWQiLCJQcm9taXNlIiwicmVzb2x2ZSIsInBhdGgiLCJoZWFkZXJzIiwiQXV0aG9yaXphdGlvbiIsImdldCIsImhvc3QiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0EsSUFBSUEsS0FBSyxHQUFHQyxPQUFPLENBQUMsWUFBRCxDQUFQLENBQXNCRCxLQUFsQzs7QUFDQSxNQUFNRSxZQUFZLEdBQUdELE9BQU8sQ0FBQyxnQkFBRCxDQUE1QixDLENBRUE7OztBQUNBLFNBQVNFLGdCQUFULENBQTBCQyxRQUExQixFQUFvQztBQUNsQyxTQUFPQyxPQUFPLENBQUMsSUFBRCxFQUFPRCxRQUFRLENBQUNFLFlBQWhCLEVBQThCRixRQUFRLENBQUNHLGFBQXZDLENBQVAsQ0FBNkRDLElBQTdELENBQWtFQyxJQUFJLElBQUk7QUFDL0UsUUFBSUEsSUFBSSxJQUFJQSxJQUFJLENBQUNDLEVBQUwsSUFBV04sUUFBUSxDQUFDTSxFQUFoQyxFQUFvQztBQUNsQztBQUNEOztBQUNELFVBQU0sSUFBSVYsS0FBSyxDQUFDVyxLQUFWLENBQWdCWCxLQUFLLENBQUNXLEtBQU4sQ0FBWUMsZ0JBQTVCLEVBQThDLHlDQUE5QyxDQUFOO0FBQ0QsR0FMTSxDQUFQO0FBTUQsQyxDQUVEOzs7QUFDQSxTQUFTQyxhQUFULEdBQXlCO0FBQ3ZCLFNBQU9DLE9BQU8sQ0FBQ0MsT0FBUixFQUFQO0FBQ0QsQyxDQUVEOzs7QUFDQSxTQUFTVixPQUFULENBQWlCVyxJQUFqQixFQUF1QlYsWUFBdkIsRUFBcUNDLGFBQXJDLEVBQW9EO0FBQ2xELE1BQUlVLE9BQU8sR0FBRztBQUNaQyxJQUFBQSxhQUFhLEVBQUUsWUFBWVosWUFEZjtBQUVaLG1CQUFlO0FBRkgsR0FBZDs7QUFLQSxNQUFJQyxhQUFKLEVBQW1CO0FBQ2pCVSxJQUFBQSxPQUFPLENBQUMsVUFBRCxDQUFQLEdBQXNCLE1BQXRCO0FBQ0Q7O0FBQ0QsU0FBT2YsWUFBWSxDQUFDaUIsR0FBYixDQUFpQjtBQUN0QkMsSUFBQUEsSUFBSSxFQUFFLGtCQURnQjtBQUV0QkosSUFBQUEsSUFBSSxFQUFFLFNBQVNBLElBRk87QUFHdEJDLElBQUFBLE9BQU8sRUFBRUE7QUFIYSxHQUFqQixDQUFQO0FBS0Q7O0FBRURJLE1BQU0sQ0FBQ0MsT0FBUCxHQUFpQjtBQUNmVCxFQUFBQSxhQUFhLEVBQUVBLGFBREE7QUFFZlYsRUFBQUEsZ0JBQWdCLEVBQUVBO0FBRkgsQ0FBakIiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBIZWxwZXIgZnVuY3Rpb25zIGZvciBhY2Nlc3NpbmcgdGhlIGxpbmtlZGluIEFQSS5cbnZhciBQYXJzZSA9IHJlcXVpcmUoJ3BhcnNlL25vZGUnKS5QYXJzZTtcbmNvbnN0IGh0dHBzUmVxdWVzdCA9IHJlcXVpcmUoJy4vaHR0cHNSZXF1ZXN0Jyk7XG5cbi8vIFJldHVybnMgYSBwcm9taXNlIHRoYXQgZnVsZmlsbHMgaWZmIHRoaXMgdXNlciBpZCBpcyB2YWxpZC5cbmZ1bmN0aW9uIHZhbGlkYXRlQXV0aERhdGEoYXV0aERhdGEpIHtcbiAgcmV0dXJuIHJlcXVlc3QoJ21lJywgYXV0aERhdGEuYWNjZXNzX3Rva2VuLCBhdXRoRGF0YS5pc19tb2JpbGVfc2RrKS50aGVuKGRhdGEgPT4ge1xuICAgIGlmIChkYXRhICYmIGRhdGEuaWQgPT0gYXV0aERhdGEuaWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhyb3cgbmV3IFBhcnNlLkVycm9yKFBhcnNlLkVycm9yLk9CSkVDVF9OT1RfRk9VTkQsICdMaW5rZWRpbiBhdXRoIGlzIGludmFsaWQgZm9yIHRoaXMgdXNlci4nKTtcbiAgfSk7XG59XG5cbi8vIFJldHVybnMgYSBwcm9taXNlIHRoYXQgZnVsZmlsbHMgaWZmIHRoaXMgYXBwIGlkIGlzIHZhbGlkLlxuZnVuY3Rpb24gdmFsaWRhdGVBcHBJZCgpIHtcbiAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xufVxuXG4vLyBBIHByb21pc2V5IHdyYXBwZXIgZm9yIGFwaSByZXF1ZXN0c1xuZnVuY3Rpb24gcmVxdWVzdChwYXRoLCBhY2Nlc3NfdG9rZW4sIGlzX21vYmlsZV9zZGspIHtcbiAgdmFyIGhlYWRlcnMgPSB7XG4gICAgQXV0aG9yaXphdGlvbjogJ0JlYXJlciAnICsgYWNjZXNzX3Rva2VuLFxuICAgICd4LWxpLWZvcm1hdCc6ICdqc29uJyxcbiAgfTtcblxuICBpZiAoaXNfbW9iaWxlX3Nkaykge1xuICAgIGhlYWRlcnNbJ3gtbGktc3JjJ10gPSAnbXNkayc7XG4gIH1cbiAgcmV0dXJuIGh0dHBzUmVxdWVzdC5nZXQoe1xuICAgIGhvc3Q6ICdhcGkubGlua2VkaW4uY29tJyxcbiAgICBwYXRoOiAnL3YyLycgKyBwYXRoLFxuICAgIGhlYWRlcnM6IGhlYWRlcnMsXG4gIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgdmFsaWRhdGVBcHBJZDogdmFsaWRhdGVBcHBJZCxcbiAgdmFsaWRhdGVBdXRoRGF0YTogdmFsaWRhdGVBdXRoRGF0YSxcbn07XG4iXX0=