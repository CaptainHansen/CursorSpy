CursorSpy = function () {
  this.startTime = 0;
  this._recording = false;
  this._packets = [];
  this._intervalSecs = false;
  this.localStore = true;

  this.useInterval = function (amt) {
    if(amt <= 0) {
      this._intervalSecs = false;
    } else {
      this._intervalSecs = amt;
    }
  }

  this.disableLocalStore = function () {
    this.localStore = false;
    return this;
  }
  this.enableLocalStore = function () {
    this.localStore = true;
    return this;
  }

  this.on = function (ev, fn) {
    switch(ev) {
      case "data":
      case "endPlay":
        this['_fn_'+ev] = fn;
        return this;
      default:
        throw new Error("Event '"+ev+"' not recognized.");
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
        self.ondata(packet);
      }
    };

    this._mousedown = function (e) {
      var packet = {
        type: 'mousedown',
        diff: new Date().getTime() - self.startTime
      }
      self.ondata(packet);
    }

    this._mouseup = function (e) {
      var packet = {
        type: 'mouseup',
        diff: new Date().getTime() - self.startTime
      }
      self.ondata(packet);
    }

    this._scroll = function (e) {
      var packet = {
        type: 'scroll',
        diff: new Date().getTime() - self.startTime,
        x: window.pageXOffset || document.documentElement.scrollLeft,
        y: window.pageYOffset || document.documentElement.scrollTop
      };
      self.ondata(packet);
    }

    this.cursor = document.createElement('div');
    this.cursor.style.width = "8px";
    this.cursor.style.height = "8px";
    this.cursor.style.borderRadius = "50%";
    this.cursor.style.display = 'none';
    this.cursor.style.position = 'absolute';
    this.cursor.style.zIndex = 999;
    this.cursor.style.backgroundColor = 'red';
    document.body.appendChild(this.cursor);
  };
  this.init();

  this.ondata = function (d) {
    if(this.localStore) {
      this._packets.push(d);
    }
    if(typeof this._fn_data == 'function') {
      this._fn_data(d);
    }
  }

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
         return;
       }
       self.ondata(self.tmpPacket);
      }, this._intervalSecs);
    }

    window.addEventListener('mousemove', this._mousemove);
    // window.addEventListener('click', this._click);
    window.addEventListener('mousedown', this._mousedown);
    window.addEventListener('mouseup', this._mouseup);
    window.addEventListener('scroll', this._scroll);
  };

  this.stop = function () {
    //stop an active recording session
    window.removeEventListener('mousemove', this._mousemove);
    // window.removeEventListener('click',this._click);
    window.removeEventListener('mousedown', this._mousedown);
    window.removeEventListener('mouseup', this._mouseup);
    window.removeEventListener('scroll', this._scroll);

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
          switch(pack.type) {
            case 'mousemove':
              self.cursor.style.top = pack.y+"px";
              self.cursor.style.left = pack.x+"px";
              break;
            case 'mousedown':
              self.cursor.style.backgroundColor = 'black';
              break;
            case 'mouseup':
              self.cursor.style.backgroundColor = 'red';
              break;
            case "scroll":
              window.scrollTo(pack.x, pack.y);
              break;
          }

          if(ind == self._packets.length-1) self._fn_endPlay();
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

CursorSpy.prototype._fn_endPlay = function () {}