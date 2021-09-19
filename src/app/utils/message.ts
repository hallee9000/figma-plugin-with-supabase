export function sendMessageToBackground(type, data?) {
    parent.postMessage({pluginMessage: {...(data || {}), type}}, '*');
}
