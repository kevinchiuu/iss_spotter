const request = require('request');

const fetchMyIP = function(callback) {
  
  request('https://api.ipify.org?format=json', (err, res, body) => {
    
    const ip = JSON.parse(body).ip;

    if (err) {
      callback(err, null);
      return;
    }
    
    if (res.statusCode !== 200) {
      const msg = `Status Code ${res.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }

    callback(null, ip);

  });

};

const fetchCoordsByIP = function(ip, callback) {
  request(`https://freegeoip.app/json/${ip}`, (err, res, body) => {

    const { latitude, longitude } = JSON.parse(body);

    if (err) {
      callback(err, null);
      return;
    }

    if (res.statusCode !== 200) {
      const msg = (`Status Code ${res.statusCode} when fetching coordinates for IP: ${body}`);
      callback(Error(msg), null);
      return;
    }

    callback(null, {latitude, longitude});

  });
};

const fetchISSFlyOverTimes = function(coords, callback) {
  const url = `http://api.open-notify.org/iss-pass.json?lat=${coords.latitude}&lon=${coords.longitude}`;

  request(url, (err, res, body) => {
    if (err) {
      callback(err, null);
      return;
    }

    if (res.statusCode !== 200) {
      callback(Error(`Status Code ${res.statusCode} when fetching ISS pass times: ${body}`), null);
      return;
    }

    const data = JSON.parse(body).response;
    callback(null, data);
  });
};

const nextISSTimesForMyLocation = function(callback) {
  fetchMyIP((err, ip) => {
    if (err) {
      callback(err, null);
      return;
    }

    fetchCoordsByIP(ip, (err, loc) => {
      if (err) {
        callback(err, null);
        return;
      }

      fetchISSFlyOverTimes(loc, (err, nxtPass) => {
        if (err) {
          callback(err, null);
          return;
        }

        callback(null, nxtPass);
      });
    });
  });
};

module.exports = { nextISSTimesForMyLocation };