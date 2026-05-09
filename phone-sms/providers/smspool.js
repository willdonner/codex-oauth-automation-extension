// phone-sms/providers/smspool.js - SMSPool SMS-Activate-compatible adapter metadata.
(function attachSmsPoolProvider(root, factory) {
  root.PhoneSmsPoolProvider = factory(root);
})(typeof self !== 'undefined' ? self : globalThis, function createSmsPoolProviderModule(root) {
  const PROVIDER_ID = 'smspool';
  const DEFAULT_BASE_URL = 'https://api.smspool.net/stubs/handler_api';
  const DEFAULT_SERVICE_CODE = '671';
  const DEFAULT_SERVICE_LABEL = 'OpenAI / ChatGPT';
  const DEFAULT_COUNTRY_ID = 1;
  const DEFAULT_COUNTRY_LABEL = 'United States';

  function normalizeSmsPoolCountryId(value, fallback = DEFAULT_COUNTRY_ID) {
    const parsed = Math.floor(Number(value));
    if (parsed === 187) return DEFAULT_COUNTRY_ID;
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
    const fallbackParsed = Math.floor(Number(fallback));
    return Number.isFinite(fallbackParsed) && fallbackParsed > 0 ? fallbackParsed : DEFAULT_COUNTRY_ID;
  }

  function normalizeSmsPoolCountryLabel(value = '', fallback = DEFAULT_COUNTRY_LABEL) {
    return String(value || '').trim() || fallback;
  }

  function normalizeSmsPoolMaxPrice(value = '') {
    const heroModule = root.PhoneSmsHeroSmsProvider;
    if (heroModule?.normalizeHeroSmsMaxPrice) {
      return heroModule.normalizeHeroSmsMaxPrice(value);
    }
    const rawValue = String(value ?? '').trim();
    if (!rawValue) return '';
    const numeric = Number(rawValue);
    if (!Number.isFinite(numeric) || numeric <= 0) return '';
    return String(Math.round(numeric * 10000) / 10000);
  }

  function normalizeSmsPoolCountryFallback(value = []) {
    const heroModule = root.PhoneSmsHeroSmsProvider;
    if (heroModule?.normalizeHeroSmsCountryFallback) {
      return heroModule.normalizeHeroSmsCountryFallback(value);
    }
    const source = Array.isArray(value)
      ? value
      : String(value || '')
        .split(/[\r\n,，、]+/)
        .map((entry) => String(entry || '').trim())
        .filter(Boolean);
    const seen = new Set();
    const normalized = [];
    for (const entry of source) {
      const id = normalizeSmsPoolCountryId(
        entry && typeof entry === 'object' && !Array.isArray(entry)
          ? (entry.id ?? entry.countryId)
          : entry,
        0
      );
      if (!id || seen.has(id)) continue;
      seen.add(id);
      normalized.push({
        id,
        label: String(entry?.label || entry?.countryLabel || '').trim() || `Country #${id}`,
      });
      if (normalized.length >= 20) break;
    }
    return normalized;
  }

  function resolveCountryConfig(state = {}) {
    return {
      id: normalizeSmsPoolCountryId(state.smsPoolCountryId),
      label: normalizeSmsPoolCountryLabel(state.smsPoolCountryLabel),
    };
  }

  function resolveCountryCandidates(state = {}) {
    const primary = resolveCountryConfig(state);
    const seen = new Set([primary.id]);
    const candidates = [primary];
    normalizeSmsPoolCountryFallback(state.smsPoolCountryFallback).forEach((entry) => {
      const id = normalizeSmsPoolCountryId(entry.id, 0);
      if (!id || seen.has(id)) return;
      seen.add(id);
      candidates.push({ id, label: normalizeSmsPoolCountryLabel(entry.label, `Country #${id}`) });
    });
    return candidates;
  }

  function createProvider() {
    return {
      id: PROVIDER_ID,
      label: 'SMSPool',
      defaultCountryId: DEFAULT_COUNTRY_ID,
      defaultCountryLabel: DEFAULT_COUNTRY_LABEL,
      defaultProduct: DEFAULT_SERVICE_LABEL,
      defaultServiceCode: DEFAULT_SERVICE_CODE,
      normalizeCountryId: normalizeSmsPoolCountryId,
      normalizeCountryLabel: normalizeSmsPoolCountryLabel,
      normalizeCountryFallback: normalizeSmsPoolCountryFallback,
      normalizeMaxPrice: normalizeSmsPoolMaxPrice,
      resolveCountryCandidates,
    };
  }

  return {
    PROVIDER_ID,
    DEFAULT_BASE_URL,
    DEFAULT_COUNTRY_ID,
    DEFAULT_COUNTRY_LABEL,
    DEFAULT_SERVICE_CODE,
    DEFAULT_SERVICE_LABEL,
    createProvider,
    normalizeSmsPoolCountryFallback,
    normalizeSmsPoolCountryId,
    normalizeSmsPoolCountryLabel,
    normalizeSmsPoolMaxPrice,
  };
});
