// phone-sms/providers/registry.js — 接码平台注册表
(function attachPhoneSmsProviderRegistry(root, factory) {
  root.PhoneSmsProviderRegistry = factory(root);
})(typeof self !== 'undefined' ? self : globalThis, function createPhoneSmsProviderRegistry(root) {
  const PROVIDER_HERO_SMS = 'hero-sms';
  const PROVIDER_FIVE_SIM = '5sim';
  const PROVIDER_SMS_POOL = 'smspool';
  const PROVIDER_NEXSMS = 'nexsms';
  const DEFAULT_PROVIDER = PROVIDER_HERO_SMS;

  function normalizeProviderId(value = '') {
    const normalized = String(value || '').trim().toLowerCase();
    if (normalized === PROVIDER_FIVE_SIM) {
      return PROVIDER_FIVE_SIM;
    }
    if (normalized === PROVIDER_SMS_POOL || normalized === 'sms-pool') {
      return PROVIDER_SMS_POOL;
    }
    if (normalized === PROVIDER_NEXSMS || normalized === 'nex-sms') {
      return PROVIDER_NEXSMS;
    }
    return PROVIDER_HERO_SMS;
  }

  function getProviderModule(providerId = DEFAULT_PROVIDER) {
    const normalized = normalizeProviderId(providerId);
    if (normalized === PROVIDER_FIVE_SIM) {
      return root.PhoneSmsFiveSimProvider || null;
    }
    if (normalized === PROVIDER_SMS_POOL) {
      return root.PhoneSmsPoolProvider || null;
    }
    if (normalized === PROVIDER_NEXSMS) {
      return root.PhoneSmsNexSmsProvider || null;
    }
    return root.PhoneSmsHeroSmsProvider || null;
  }

  function createProvider(providerId = DEFAULT_PROVIDER, deps = {}) {
    const module = getProviderModule(providerId);
    if (!module || typeof module.createProvider !== 'function') {
      throw new Error(`Phone SMS provider is not loaded: ${normalizeProviderId(providerId)}`);
    }
    return module.createProvider(deps);
  }

  function getProviderLabel(providerId = DEFAULT_PROVIDER) {
    const normalized = normalizeProviderId(providerId);
    if (normalized === PROVIDER_FIVE_SIM) {
      return '5sim';
    }
    if (normalized === PROVIDER_SMS_POOL) {
      return 'SMSPool';
    }
    if (normalized === PROVIDER_NEXSMS) {
      return 'NexSMS';
    }
    return 'HeroSMS';
  }

  return {
    PROVIDER_HERO_SMS,
    PROVIDER_FIVE_SIM,
    PROVIDER_SMS_POOL,
    PROVIDER_NEXSMS,
    DEFAULT_PROVIDER,
    normalizeProviderId,
    getProviderModule,
    createProvider,
    getProviderLabel,
  };
});
