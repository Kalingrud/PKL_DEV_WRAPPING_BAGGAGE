const axios = require('axios');
const ExtApiLog = require('../models/ExtApiLog');

function maskSensitiveHeaders(headers) {
  try {
    const clone = { ...(headers || {}) };
    if (clone.Authorization) clone.Authorization = '****';
    if (clone.authorization) clone.authorization = '****';
    return clone;
  } catch (_) {
    return headers;
  }
}

function truncate(str, max = 10000) {
  try {
    const s = typeof str === 'string' ? str : JSON.stringify(str);
    return s.length > max ? s.slice(0, max) + ` ...[truncated ${s.length - max}]` : s;
  } catch (e) {
    return String(str);
  }
}

function truncateString(value, maxLen = 50) {
  try {
    const s = String(value || '');
    return s.length > maxLen ? s.slice(0, maxLen) : s;
  } catch (_) {
    return '';
  }
}

function createExtApiClient() {
  const client = axios.create({ timeout: 15000 });

  client.interceptors.request.use((config) => {
    config._startedAt = Date.now();
    return config;
  });

  client.interceptors.response.use(
    async (res) => {
      const started = res.config._startedAt || Date.now();
      const duration = Date.now() - started;

      const fullUrl = res.config.url;
      const url = new URL(fullUrl);
      const headersMasked = maskSensitiveHeaders(res.config.headers || {});

      const methodOnly = truncateString((res.config.method || 'GET').toUpperCase(), 10);

      ExtApiLog.create({
        trx_code: truncateString(headersMasked['x-trx-code'] || headersMasked['X-Trx-Code'] || '', 20),
        from_ip: headersMasked['x-origin-ip'] || headersMasked['X-Origin-Ip'] || null,
        trx_req: methodOnly,
        duration,
        trx_resp: String(res.status),
        api_target: fullUrl,
        target_get: fullUrl,
        target_post: res.config.data ? truncate(res.config.data) : null,
        target_header: truncate(headersMasked),
        response: truncate(res.data),
        flag: 'success'
      })
        .then((id) => {
          try { console.log(`extapi_log saved (success): ${id}`); } catch (_) {}
        })
        .catch((e) => {
          try { console.error('extapi_log insert error (success handler):', e.message); } catch (_) {}
        });

      return res;
    },
    async (err) => {
      const cfg = err.config || {};
      const started = cfg._startedAt || Date.now();
      const duration = Date.now() - started;

      try {
        const fullUrl = cfg.url || '';
        const url = fullUrl ? new URL(fullUrl) : { origin: '' };
        const headersMasked = maskSensitiveHeaders(cfg.headers || {});
        const methodOnly = truncateString((cfg.method || 'GET').toUpperCase(), 10);
        ExtApiLog.create({
          trx_code: truncateString(headersMasked['x-trx-code'] || headersMasked['X-Trx-Code'] || '', 20),
          from_ip: headersMasked['x-origin-ip'] || headersMasked['X-Origin-Ip'] || null,
          trx_req: methodOnly,
          duration,
          trx_resp: err.response ? String(err.response.status) : 'ERR',
          api_target: fullUrl,
          target_get: fullUrl,
          target_post: cfg.data ? truncate(cfg.data) : null,
          target_header: truncate(headersMasked),
          response: truncate({ message: err.message, data: err.response?.data }),
          flag: 'error'
        })
          .then((id) => {
            try { console.log(`extapi_log saved (error): ${id}`); } catch (_) {}
          })
          .catch((e) => {
            try { console.error('extapi_log insert error (error handler):', e.message); } catch (_) {}
          });
      } catch (_) {
        // ignore logging error
      }

      throw err;
    }
  );

  return client;
}

module.exports = { createExtApiClient };


