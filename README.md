CursorSpy
=========

Honestly, I got bored one day and wrote this after I read an article online about WebSockets and how you could use one to record where a user points their cursor on your webpage for some really enhanced analytics and then be able to "play back" the user interaction later.  This code does exactly that.  Records cursor interactions on an entire webpage, including clicks, and is capable of playing back what was just recorded.

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