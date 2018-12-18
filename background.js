'use strict';
var interval = 0;
localStorage.unreadCount = 0; //To trigger notifications on new changes
if (!localStorage.isInitialized) {
   localStorage.Domain = ""; //The Zendesk Domain
   localStorage.ViewID = ""; //The Zendesk View ID to check
   localStorage.isActivated = false; // The display notifications activation.
   localStorage.notifrequency = 1; // The display frequency, in minutes.
   localStorage.checkfrequency = 60; // The check for new tickets, in seconds
   localStorage.isInitialized = true; // The option initialization.
   chrome.tabs.create({
      url: "options.html"
   });
}

function clickIcon() {
   checkState();
   updateIcon();
   if (
      JSON.parse(localStorage.isActivated)
   ) {
      var newURL = "https://" +
         localStorage.Domain +
         "/agent/filters/" +
         localStorage.ViewID;
   } else {
      var newURL = "options.html";
   }
   chrome.tabs.create({
      url: newURL
   });
};

function updateIcon(current) {
   if (!current) {
      chrome.storage.sync.get('number',
         function(data) {

            var current = data.number;
            current++;

            chrome.browserAction.setIcon({
               path: 'icon' +
                  current +
                  '.png'
            });
            //chrome.browserAction.setBadgeText({text: current.toString()});
            if (current > 4)
               current = 2;
            chrome.storage.sync.set({
               number: current
            }, function() {
               localStorage.IconId =
                  current;
            });
         });
   }
};

chrome.runtime.onMessage.addListener(
   function(message, sender,
      sendResponse) {
      if (message ===
         'getScreenState') {
         chrome.windows.get(sender.tab
            .windowId,
            function(chromeWindow) {
               // "normal", "minimized", "maximized" or "fullscreen"
               sendResponse(
                  chromeWindow
                  .state);

            });
         return true; // Signifies that we want to use sendResponse asynchronously
      }
   });

// Query the Zendesk API if this isActivated and update the icon count.
//TODO chrome.runtime.onMessageExternal.addListener and be silent on Calendar Events

function checkState() {
   if (
      JSON.parse(localStorage.isActivated)
   ) {
      $.get('https://' + localStorage.Domain +
         '/api/v2/views/' +
         localStorage.ViewID +
         '/execute.json',
         function(data) {
            var count = data.rows.length
               .toString();
            var prevcount =
               localStorage.count;
            chrome.extension.getBackgroundPage()
               .console.log(data);
            if (count == 0) {
               chrome.browserAction.setBadgeBackgroundColor({
                  color: [122,
                     186,
                     122,
                     255
                  ]
               });
               chrome.browserAction.setBadgeText({
                  text: '' +
                     count
               });
            } else if (prevcount ==
               count) {
               chrome.browserAction.setBadgeBackgroundColor({
                  color: [122,
                     186,
                     122,
                     255
                  ]
               });
               chrome.browserAction.setBadgeText({
                  text: '' +
                     count
               });
            } else {
               localStorage.unreadCount =
                  count;
               localStorage.count =
                  count;
               chrome.browserAction.setBadgeText({
                  text: '' +
                     count
               });
               chrome.browserAction.setBadgeBackgroundColor({
                  color: [255,
                     0, 0,
                     255
                  ]
               });
               updateIcon(1);
            }

         }).fail(function() {
         localStorage.unreadCount =
            9999;
         chrome.browserAction.setBadgeText({
            text: "ERR"
         });
         chrome.browserAction.setBadgeBackgroundColor({
            color: [255, 0,
               0, 255
            ]
         });
         updateIcon(1);
         //chrome.tabs.create({ url: "options.html" });

      });

   } else {
      chrome.browserAction.setBadgeText({
         text: 'DIS'
      });
      updateIcon(1);
      chrome.browserAction.setBadgeBackgroundColor({
         color: [255, 0, 0, 255]
      });
   }
   setTimeout(function() {
         checkState();
      }, localStorage.checkfrequency *
      1000);
}

function nowtime() {
   var time = /(..)(:..)/.exec(new Date()); // The prettyprinted time.
   var hour = time[1] % 12 || 12; // The prettyprinted hour.
   var period = time[1] < 12 ? ' a.m.' :
      ' p.m.'; // The period of the day.
   return (" now at " + hour + time[2] +
      ' ' + period);
}

setInterval(function() { //notifications

   if (localStorage.notify == 0) { // having this at 0 means that our interval notifrequency has passed and we can show a notification.
      localStorage.notify = 1; //reset for displaying this per interval of notifrequency
      if (localStorage.unreadCount >=
         1) { //show notification
         if (localStorage.unreadCount ==
            9999) { //TODO for api errors later
            localStorage.unreadCount =
               "in error, please check that you are logged in"; //Dirty fix to display the notifiaction of error
         }
         //new Notification("New Tickets in your ViewID", {
         // body: localStorage.count,
         //});
         updateIcon();
         chrome.notifications.create(
            '', {
               type: 'basic',
               iconUrl: 'icon5.png',
               title: 'Acquia',
               message: "Number of TAM tickets is now " +
                  localStorage
                  .unreadCount
            },
            function(
               notificationId) {}
         );
         localStorage.unreadCount =
            0;
      }
   }

   interval++;

   if (
      JSON.parse(localStorage.isActivated) &&
      localStorage.notifrequency <=
      interval
   ) {

      localStorage.isFullScreen =
         (screen.width == window.outerWidth) &&
         (screen.height == window
            .outerHeight);

      if (localStorage.isFullScreen) {
         localStorage.notify = 1;
      } else {
         localStorage.notify = 0;
      }
      interval = 0;
   }

}, 60000);

//Support detectiong of full screen
function isFullScreen(callback) {
   chrome.runtime.sendMessage(
      'getScreenState',
      function(result) {
         callback(result ===
            'fullscreen');
      });
}

//TODO fix this, if screen is in presentation mode be silent.
chrome.runtime.onMessage.addListener(
   function(message, sender,
      sendResponse) {
      if (message ===
         'getScreenState') {
         chrome.windows.get(sender.tab
            .windowId,
            function(chromeWindow) {
               // "normal", "minimized", "maximized" or "fullscreen"
               sendResponse(
                  chromeWindow
                  .state);
            });
         return true; // Signifies that we want to use sendResponse asynchronously
      }
   });
// Remember the icon color
chrome.runtime.onInstalled.addListener(
   function() {
      chrome.storage.sync.set({
         number: 1
      }, function() {});
   });

chrome.extension.onMessage.addListener(
   function(request, sender,
      sendResponse) {
      switch (true) {
         case request.restart:
            timer = null;
            checkState();
            break;
      }
      return true;
   });

//Click on icon
chrome.browserAction.onClicked.addListener(
   clickIcon);
checkState();
