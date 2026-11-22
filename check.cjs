const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
let nativeReceived;
const context = {
    window: {}, console: {log() {}}, setTimeout, clearTimeout, setInterval, clearInterval,
    Lampa: {
        Android: {openPlayer(url, data) { nativeReceived = {...data}; }},
        Player: {listener: {send() {}}}
    }
};
context.window.Lampa = context.Lampa;
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname, 'bridge.js'), 'utf8'), context);
for (const initial of [undefined, false]) {
    const data = {url: 'https://example.test/video.m3u8', timeline: {time: 42}, title: 'Test'};
    if (initial === false) data.iptv = false;
    context.Lampa.Player.listener.send('create', {data});
    assert.equal(data.iptv, true);
    context.Lampa.Android.openPlayer(data.url, data);
    assert.equal(nativeReceived.iptv, initial);
    assert.equal(nativeReceived.timeline.time, 42);
    assert.equal(Object.hasOwn(data, 'iptv'), initial === false);
}
const data = {url: 'https://example.test/video.m3u8'};
context.Lampa.Player.listener.send('create', {data});
context.Lampa.Player.listener.send('start', data);
assert.equal(Object.hasOwn(data, 'iptv'), false);
const iptv = {url: 'https://example.test/channel.m3u8', iptv: true};
context.Lampa.Player.listener.send('create', {data: iptv});
context.Lampa.Player.listener.send('destroy', {});
assert.equal(iptv.iptv, true);
console.log('Passed: preroll exclusion; native/internal flag restoration; timeline preservation; IPTV unchanged.');

