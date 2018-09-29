(function (algolia, $, _, Shopify) {
  'use strict';

  if (algolia.config.powered_by) {
    console.log("You're using Algolia !\n" +
      'Visit https://www.algolia.com/ for more insight about what we do.');
  }

  /* No conflict */
  algolia.$ = algolia.jQuery = $.noConflict(true);
  algolia._ = algolia.underscore = algolia.lodash = _.noConflict();

  /* Store variables */
  algolia.storeName = window.location.hostname.replace(/^www\./, '').replace(/^([^.]*)\..*$/, '$1');

  /* Client setup */
  algolia.client = algoliasearch(algolia.config.app_id, algolia.config.search_api_key);
  algolia.templates = {};
  algolia.indices = {};
  algolia.full_results = window.location.href.match(/\/search/);
  // we want to match /collections/<handle> but only if handle != 'all'
  algolia.is_collection_results_page = !!window.location.pathname.match(/^\/collections\/(?!all)([^/]+)[/]*$/);

  /* We use Hogan as our templating engine with a custom delimiter: [[ ... ]] */
  algolia.hoganOptions = { delimiters: '[[ ]]' };
  algolia.getTemplate = function getTemplate (name) {
    return document.getElementById('template_algolia_' + name).innerHTML;
  };
  algolia.compileTemplate = function compileHoganTemplate (name) {
    return Hogan.compile(algolia.getTemplate(name), algolia.hoganOptions);
  };
  algolia.render = function render (template, obj) {
    obj = _.assign({}, obj, { helpers: algolia.hoganHelpers });
    return template.render(obj);
  };

  /* Add CSS block after current script */
  algolia.appendStyle = function appendStyle (content) {
    function insertAfter(newNode, referenceNode) {
      referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }
    var scripts = document.getElementsByTagName('script');
    var currentScript = scripts[scripts.length - 1];
    var style = document.createElement('style');
    style.innerHTML = content;
    insertAfter(style, currentScript);
  }

  /* Here because we need to ensure we have a fallback with '$ '. */
  algolia.money_format = algolia.getTemplate('money_format').replace(/^\s+|\s+$/g, '');
  algolia.formatMoney = function formatMoney (cents) {
    var val = (cents / 100.0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    var format = algolia.money_format;

    // Not necessary, but allows for more risk tolerance if Shopify.formatMoney doesn't work as we want
    var regexp = /^([^{}]*)\{\{amount\}\}([^{}]*)$/;
    if (format.match(regexp)) {
      return format.replace(regexp, "$1" + val + "$2");
    }

    if (!_.isUndefined(Shopify) && !_.isUndefined(Shopify.formatMoney)) {
      return Shopify.formatMoney(cents, format);
    }

    return '$' + val;
  };
}(algoliaShopify, $, _, Shopify));
