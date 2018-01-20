/**
 * Rtmp over WebSocket proxy
 */
module RtmpJs.Browser {

  export class RtmpWsTransport extends BaseTransport {
    wsurl: string;
    socket: WebSocket;

    constructor(connectionSettings) {
      super();

      if (typeof connectionSettings === 'string') {
        connectionSettings = {url: connectionSettings};
      }

      this.wsurl = connectionSettings.url;
    }

    connect(properties, args?) {
      var channel = this._initChannel(properties, args);

      var socketError = false;
      var socket = new WebSocket(this.wsurl);
      this.socket = socket;
      socket.binaryType = 'arraybuffer';

      release || console.log('Opening binary websocket connection: ' + this.wsurl);

      socket.onopen = function () {
        channel.ondata = function (data) {
          var buf = new Uint8Array(data);
          release || console.log('Bytes written: ' + buf.length);
          socket.send(buf.buffer);
        };
        channel.onclose = function () {
          socket.close();
        };
        channel.start();
      };
      socket.onclose = function (e) {
        channel.stop(socketError);
      };
      socket.onerror = function (e) {
        socketError = true;
        release || console.error('WebSocket error: ', e);
      };
      socket.onmessage = function (e) {
        release || console.log('Bytes read: ', e.data.byteLength);
        channel.push(new Uint8Array(e.data));
      };
    }

    close() {
      this.socket.close();
    }
  }

}
