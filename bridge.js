/* Playback bridge: temporary playback metadata and Android handoff. */
(function () {
    'use strict';
    if (window.playbackBridgeLoaded) return;
    window.playbackBridgeLoaded = true;
    var pending = [];
    function restore(data) {
        for (var i = pending.length - 1; i >= 0; i--) {
            if (!data || pending[i].data === data) {
                var item = pending.splice(i, 1)[0];
                clearTimeout(item.timer);
                if (item.had) item.data.iptv = item.value;
                else delete item.data.iptv;
            }
        }
    }
    function install() {
        if (!window.Lampa || !Lampa.Player || !Lampa.Player.listener || !Lampa.Android || typeof Lampa.Android.openPlayer !== 'function') return false;
        var listener = Lampa.Player.listener;
        var send = listener.send;
        var open = Lampa.Android.openPlayer;
        Lampa.Android.openPlayer = function (url, data) {
            restore(data);
            return open.apply(this, arguments);
        };
        listener.send = function (type, payload) {
            if (type === 'start' || type === 'ready' || type === 'external') restore(payload);
            if (type === 'destroy' || type === 'close') restore();
            var result = send.apply(this, arguments);
            var data = type === 'create' && payload && payload.data;
            if (data && !data.iptv && typeof data.url === 'string' && /^https?:\/\//i.test(data.url)) {
                var item = {data: data, had: Object.prototype.hasOwnProperty.call(data, 'iptv'), value: data.iptv};
                pending.push(item);
                // The preroll exclusion exists only until actual player launch.
                data.iptv = true;
                item.timer = setTimeout(function () { restore(data); }, 15000);
                console.log('[PlaybackBridge] preroll excluded');
            }
            return result;
        };
        console.log('[PlaybackBridge] installed');
        return true;
    }
    if (!install()) {
        var attempts = 0;
        var timer = setInterval(function () {
            if (install() || ++attempts >= 40) clearInterval(timer);
        }, 250);
    }
}());

