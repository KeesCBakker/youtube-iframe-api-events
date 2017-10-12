(function() {

  //don't load twice
  if (typeof window['parseYouTubeFrame'] === 'function')
    return;

  window['parseYouTubeFrame'] = parseYouTubeFrame;

  //check if YT API is loaded
  if (typeof window['YT'] === 'undefined')
    loadYouTubeJsApi();
  else
    waitForReadyStateComplete();

  //loads the YT API
  function loadYouTubeJsApi() {

    //called when the YT API is ready
    window['onYouTubeIframeAPIReady'] = waitForReadyStateComplete;

    //load script
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";

    //insert script
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }

  function waitForReadyStateComplete() {
    if (document.readyState === "complete") {
      parseframes();
    } else {
      document.addEventListener('DOMContentLoaded', parseframes);
    }
  }

  function parseframes() {

    var iframes = document.getElementsByTagName('iframe');
    for (var i = 0; i < iframes.length; i++) {
      var iframe = iframes[i];
      if (iframe.src && iframe.src.indexOf('https://www.youtube.com/embed/') == 0) {
        parseYouTubeFrame(iframe, i);
      }
    }
  }

  function parseYouTubeFrame(player, nr) {

    //ensure player ID
    if (!player.id) {
      player.id = '_yt_' + nr;
    }

    //ensure api enabled
    if (player.src && player.src.indexOf('enablejsapi=1') == -1) {

      var src = player.src;
      if (src.indexOf('?') == -1) {
        src += '?';
      }

      player.src = src.replace('?', '?enablejsapi=1&');
    }

    //Don't initialize a player twice!  
    var YT = window['YT'];

    if (typeof YT.get(player.id) === 'undefined' && player.id != 'A') {
      new YT.Player(player.id, {
        events: {
          'onReady': function(ev) {
            dispatch(player, 'YT-onReady', ev);
          },
          'onStateChange': function(ev) {
            dispatch(player, 'YT-onStateChange', ev);
          },
          'onError': function(ev) {
            dispatch(player, 'YT-onError', ev);
          },
        }
      });
    }
  }

  function dispatch(player, name, state) {
    var evnt = new CustomEvent(name, {
      'detail': state
    });
    evnt.initEvent(name, true, false);
    player.dispatchEvent(evnt);
  }

})();

(function() {

  if (typeof window.CustomEvent === "function") return false;

  function CustomEvent(event, params) {
    params = params || {
      bubbles: false,
      cancelable: false,
      detail: undefined
    };
    var evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }

  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
})();
