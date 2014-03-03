$.get("//itunes.apple.com/gb/rss/topsongs/limit=50/explicit=true/xml")
    .done(function (data) {
        var items = data.querySelectorAll("entry");

        for (var n = 0; n < items.length; n++) {
            var title = items[n].querySelectorAll("name")[0].textContent.split(/ *\([^)]*\) */g).join("");
            var thumbs = items[n].querySelectorAll("image");
            var thumbnail = thumbs[2].textContent;
            var artistpre = items[n].querySelectorAll('artist');
            var artist = artistpre[0].textContent;
            var spotifyURL = encodeURIComponent(title);
            $('.music').append('<div class="song" onclick="clickedSONG(\'' + thumbnail + '\',\'' + spotifyURL + '\')"><img class="art" src="' + thumbnail + '"><p>' + title + '</p><p>' + artist + '</p></div>');

        }
    });

function clickedSONG(bgURL, spotifyURL) {
    $.get("//ws.spotify.com/search/1/track", { "q": spotifyURL })
        .done(function (data) {
            var item = data.querySelectorAll("track")[0].getAttribute('href');
            location.href = item;

        });
    //location.href = spotifyURL;
    $(".chngBG").remove();
    $('head').append("<style class='chngBG'>body\:\:before{ background-image\:url(" + bgURL + ")!important;}</style>");

}