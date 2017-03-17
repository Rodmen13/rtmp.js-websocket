/**
 * Rtmp over WebSocket proxy
 */
module RtmpJs.Browser {

  export class RtmpWsTransport extends BaseTransport {
    wsurl: string;

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
      socket.binaryType = 'arraybuffer';

      release || console.log('Opening binary websocket connection: ' + this.wsurl);

      var sendData = function (data) {
        return socket.send(data.buffer);
      };

      socket.onopen = function () {
        channel.ondata = function (data) {
          var buf = new Uint8Array(data);
          release || console.log('Bytes written: ' + buf.length);
          if (!sendData(buf)) {
            release || console.log('Error writing to WebSocket');
          }
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
        release || console.error('WebSocket error: ' + e.message);
      };
      socket.onmessage = function (e) {
        release || console.log('Bytes read: ' + e.data.byteLength);
        channel.push(new Uint8Array(e.data));
      };
    }
  }

}
