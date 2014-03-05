 var iTunesOnly = true;
 if (window.location.hash) {
     hashPlay = window.open(window.location.hash.split("#").join("spotify:track:"));
     hashPlay.close();
 }

 $.get("//itunes.apple.com/gb/rss/topsongs/limit=50/explicit=true/xml", function (data) {
     var items = data.querySelectorAll("entry");

     for (var n = 0; n < items.length; n++) {
         var title = items[n].querySelectorAll("name")[0].textContent.split(/ *\([^)]*\) */g).join("");
         var thumbnail = items[n].querySelectorAll("image")[2].textContent;
         var itunesURL = items[n].querySelectorAll('link')[1].getAttribute('href');
         var artist = items[n].querySelectorAll('artist')[0].textContent;
         var spotifyURL = encodeURIComponent(title);
         $('.music').append('<div class="song" onclick="clickedSONG(\'' + addslashes(thumbnail) + '\',\'' + addslashes(spotifyURL) + '\',\'' + addslashes(itunesURL) + '\')"><img class="art" src="' + addslashes(thumbnail) + '"><p>' + title + '</p><p>' + artist + '</p></div>');

     }
 });

 function toggleMode() {
     if ($('#myonoffswitch').is(":checked") === true) {
         iTunesOnly = true;
         console.log('true')
     } else {
         iTunesOnly = false;
         console.log('false')
     }
 }

 function addslashes(a) {
     return (a + "").replace(/[\\"']/g, "\\$&").replace(/\u0000/g, "\\0");
 }

 function clickedSONG(bgURL, spotifyURL, itunesURL) {
     var audio = $(".player");
     audio[0].pause();
     if (iTunesOnly === false) {
         $.get("//ws.spotify.com/search/1/track", {
             "q": spotifyURL
         }, function (data) {
             var item = data.querySelectorAll("track")[0].getAttribute('href');
             history.pushState(item, "", item.split("spotify:track:").join("#"));
             //window.location.assign("spotify:search:track:" + spotifyURL);
             location.href = item;

         });
     } else {
         $("#playersrc").attr("src", itunesURL);
         audio[0].pause();
         audio[0].load();
         audio[0].play();
     }
     $(".chngBG").remove();
     $('head').append("<style class='chngBG'>body\:\:before{ background-image\:url(" + bgURL + ")!important;}</style>");
 }