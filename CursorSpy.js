CursorSpy = function () {
  this.startTime = 0;
  this._recording = false;
  this._packets = [];
  this._intervalSecs = false;

  this.useInterval = function (amt) {
    if(amt <= 0) {
      this._intervalSecs = false;
    } else {
      this._intervalSecs = amt;
    }
  }

  this.init = function () {
    var self = this;

    this._mousemove = function (e) {
      var packet = {};
      packet.type = "mousemove";
      packet.x = e.pageX;
      packet.y = e.pageY;
      packet.diff = new Date().getTime() - self.startTime;
      if(self._intervalSecs) {
        self.tmpPacket = packet;
      } else {
        self._packets.push(packet);
      }
    };

    this._click = function (e) {
      var packet = {};
      packet.type="click";
      packet.x = e.pageX;
      packet.y = e.pageY;
      packet.diff = new Date().getTime() - self.startTime;
      self._packets.push(packet);
    }

    this.cursor = document.createElement('div');
    this.cursor.style.width = "8px";
    this.cursor.style.height = "8px";
    this.cursor.style.borderRadius = "50%";
    this.cursor.style.display = 'none';
    this.cursor.style.position = 'fixed';
    this.cursor.style.zIndex = 999;
    this.cursor.style.backgroundColor = 'red';
    document.body.appendChild(this.cursor);
  };

  this.record = function () {
    this.stop();

    this._packets = [];
    this._recording = true;
    this.startTime = new Date().getTime();

    if(this._intervalSecs > 0) {
      var self = this;
      this.recordInterval = setInterval(function () {
       if(!self.tmpPacket) return;
       if(self._packets.length > 0 && self._packets[self._packets.length-1] == self.tmpPacket) {
         console.log("ignoring this one");
         return;
       }
       self._packets.push(self.tmpPacket);
      }, 100);
    }

    window.addEventListener('mousemove', this._mousemove);
    window.addEventListener('click', this._click);
  };

  this.stop = function () {
    //stop an active recording session
    window.removeEventListener('mousemove', this._mousemove);
    window.removeEventListener('click',this._click);

    this._recording = false;
    this.tmpPacket = false;
    clearInterval(this.recordInterval);

    //stop a play session
    clearTimeout(this._nextTimer);
    for(i in this._playTimers) {
      clearTimeout(this._playTimers[i]);
    }
  }

  this._index = 0;
  this._lastBurst = 0;
  this.play = function () {
    this.stop();

    this._index = 0;
    this._lastBurst = 0;
    this.burstSize = 30;
    this._play();
    this.cursor.style.display = 'block';
  }
  this._play = function () {
    // console.log("play more");
    var i;
    var count = 0;
    var self = this;
    this._playTimers = [];

    for(i = this._index; i < this._packets.length; i++) {
      var p = this._packets[i];

      var fn = (function (pack, ind) {
        return function () {
          if(pack.type == 'mousemove') {
            self.cursor.style.top = pack.y+"px";
            self.cursor.style.left = pack.x+"px";
          }
          console.log(ind);
        }
      })(p, i);
      this._playTimers.push(setTimeout(fn, p.diff - this._lastBurst));

      count++;
      if(count == this.burstSize) {
        this._nextTimer = setTimeout(function () {
          self._play();
        }, p.diff - this._lastBurst);

        this._lastBurst = p.diff;
        this._index = i+1;
        break;
      }
    }
  }
}