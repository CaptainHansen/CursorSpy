CursorSpy
=========

Honestly, I got bored one day and wrote this after I read an article online about WebSockets and how you could use one to record where a user points their cursor on your webpage for some really enhanced analytics and then be able to "play back" the user interaction later.  This code does exactly that.  Records cursor interactions on an entire webpage, including clicks, and is capable of playing back what was just recorded.

This code will also record mousedown and mouseup events.  The virtual cursor will change from red to black when the mouse button was depressed, and back to red when it was released.

##Initialization##

CursorSpy will initialize itself append a div representing the cursor for playback upon creation, however, no event listeners will be attached until the instance's record method is called.

```javascript
var spy = new CursorSpy();

//to record
spy.record();

//here is where you would move the cursor around the screen

//end recording
spy.stop();

//and to playback
spy.play();
```

As of yet there is no method for changing the appearance of the cursor's representative div.

##Practical Example##

As I hinted at before, this is a feature that is very easy to implement with a WebSocket for real mouse capturing analytics.  Here is an example for using a websocket to send the cursor data straight to the web server.

```javascript
var spy = new CursorSpy();

var ws = new WebSocket('ws://myhost/cursorspy');

//disable the local storage of data
spy.disableLocalStore();

//tell CursorSpy what you want it to do when it gets a new event
spy.on('data', function (d) {
  ws.send(JSON.stringify(d));
});

//record away!
spy.record();
```

##Recording MouseMove events on an interval##

Now, obviously, it might not be the best idea to send EVERY single mousemove event over the internet, especially if the client doesn't have a very fast connection.  The solution is to use an interval for sending events.

This doesn't keep a cache of events to send every so often.  It rather only sends one mousemove event every so often.  The record method sets an interval in JavaScript and every time that interval is hit, a mousemove datapacket is created and recorded (but only if a mousemove event has fired since the last mousemove event was pushed).

```javascript
var spy = new CursorSpy();

// the useInterval method takes one argument - the number of milliseconds to wait between pushing a new data packet
// this example will add a new data packet (if it has changed) every 100 milliseconds, or 10 times a second, however you want to look at it.

spy.useInterval(100);

spy.record();
```