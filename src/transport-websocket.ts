/*
 * Copyright 2015 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module RtmpJs.Browser {

  // TODO
  var DEFAULT_RTMP_PORT = 1935;

  var TCPSocket = (<any>navigator).mozTCPSocket;

  export class RtmpTransport extends BaseTransport {
    host: string;
    port: number;
    ssl: boolean;

    constructor(connectionSettings) {
      super();

      if (typeof connectionSettings === 'string') {
        connectionSettings = {host: connectionSettings};
      }

      this.host = connectionSettings.host || 'localhost';
      this.port = connectionSettings.port || DEFAULT_RTMP_PORT;
      this.ssl = !!connectionSettings.ssl || false;
    }

    connect(properties, args?) {
      if (!TCPSocket) {
        throw new Error('Your browser does not support socket communication.\n' +
          'Currenly only Firefox with enabled mozTCPSocket is allowed (see README.md).');
      }

      var channel = this._initChannel(properties, args);

      var writeQueue = [], socketError = false;
      var createRtmpSocket = (<any>window).createRtmpSocket;
      var socket = createRtmpSocket ?
        createRtmpSocket({host: this.host, port: this.port, ssl: this.ssl}) :
        TCPSocket.open(this.host, this.port, { useSecureTransport: this.ssl, binaryType: 'arraybuffer' });


      var sendData = function (data) {
        return socket.send(data.buffer, data.byteOffset, data.byteLength);
      };

      socket.onopen = function (e) {
        channel.ondata = function (data) {
          var buf = new Uint8Array(data);
          writeQueue.push(buf);
          if (writeQueue.length > 1) {
            return;
          }
          release || console.log('Bytes written: ' + buf.length);
          if (sendData(buf)) {
            writeQueue.shift();
          }
        };
        channel.onclose = function () {
          socket.close();
        };
        channel.start();
      };
      socket.ondrain = function (e) {
        writeQueue.shift();
        release || console.log('Write completed');
        while (writeQueue.length > 0) {
          release || console.log('Bytes written: ' + writeQueue[0].length);
          if (!sendData(writeQueue[0])) {
            break;
          }
          writeQueue.shift();
        }
      };
      socket.onclose = function (e) {
        channel.stop(socketError);
      };
      socket.onerror = function (e) {
        socketError = true;
        console.error('socket error: ' + e.data);
      };
      socket.ondata = function (e) {
        release || console.log('Bytes read: ' + e.data.byteLength);
        channel.push(new Uint8Array(e.data));
      };
    }
  }

}
