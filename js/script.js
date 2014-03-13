//Smooth Scroll Hack
$('.music').on('touchstart', function (event) {});
//Song Links
var hashPlay;
if (window.location.hash) {
    $.ajax({
        type: 'GET',
        dataType: 'jsonp',
        url: '//embed.spotify.com/oembed/',
        data: {
            url: window.location.hash.replace(/#/g, "spotify:track:")
        }
    }).done(function (data) {
        $('head').append("<style class='chngBG'>body::before{ background-image:url(" + data.thumbnail_url.replace(/cover/g, "640") + ")!important;}</style>");
    });
    hashPlay = window.open(window.location.hash.replace(/#/g, "spotify:track:"));
    hashPlay.close();
}

//Vars
var music = [];
var hasSpotify;
var audio = $(".player")[0];
var isMobile = {
    a: function () {
        return navigator.userAgent.match(/Android/i);
    },
    b: function () {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    i: function () {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    o: function () {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    w: function () {
        return navigator.userAgent.match(/IEMobile/i);
    },
    t: function () {
        return (isMobile.a() || isMobile.b() || isMobile.i() || isMobile.o() || isMobile.w());
    }
};

if (!isMobile.t()) {
    $.ajax({
        type: 'GET',
        dataType: 'script',
        timeout: 1000,
        url: 'https://wlunlyjfwn.spotilocal.com:4370/r',
        error: function (jqXHR) {

            if (jqXHR.status == '404') {
                hasSpotify = true;
            } else {
                hasSpotify = false;
            }
            console.info('This ↑ ' + jqXHR.status + ' ↑ is checking if Spotify is installed ;\)');
        }

    });
} else {
    hasSpotify = false;
}
$.ajax({
        type: 'GET',
        url: "http://itunes.apple.com/gb/rss/topsongs/limit=50/explicit=true/json",
        dataType: 'json',
        success: function (data) {
            var items = data.feed.entry;

            for (var n = 0; n < items.length; n++) {
                var title = items[n]['im:name'].label.replace(/ *\[[^)]*\] *| *\([^)]*\) */g, "");
                var artist = items[n]['im:artist'].label;
                var thumbnail = items[n]['im:image'][2].label.replace(/170x170/g, "340x340");
                var itunesURL = items[n].link[1].attributes.href;
                var songInfo = [title, artist, thumbnail, itunesURL, encodeURIComponent(title)];
                music.push(songInfo);
                $('.music').append('<article class="song" onclick="clickedSONG(' + (music.length-1) + ')"><img class="art" src="' + thumbnail + '"><p>' + title + '</p><p>' + artist + '</p></article>');

            }
        }
        });

    function playiTunes(itunesURL) {
        $("#playersrc").attr("src", itunesURL);
        audio.pause();
        audio.load();
        audio.play();
    }

    function clickedSONG(sP) {
        var song = music[sP];
        var artist = song[1];
        window.document.title = "Music - " + song[0];
        audio.pause();
        if (hasSpotify === true) {
            $.get("//ws.spotify.com/search/1/track.json", {
                "q": song[4]
            }, function (data) {
                var num = 0;
                var found = false;
                while (found === false) {
                    if (data.tracks[num].artists[0].name.trim().toLowerCase().split(" ")[0] == artist.trim().toLowerCase().split(" ")[0]) {
                        //console.log('True ' + num);
                        var url = data.tracks[num].href;
                        music[sP].push(url);
                        history.pushState(url, "", url.replace(/spotify:track:/g, "#"));
                        location.href = url;
                        found = true;
                        
                    } else {
                        num++;
                        //console.log('False ' + num);
                        found = false;
                    };
                    if (num == 20) {
                        playiTunes(song[3]);
                        break;
                    }
                }


            });
        } else {
            playiTunes(song[3]);
        }
        $(".chngBG").remove();
        $('head').append("<style class='chngBG'>body::before{ background-image:url(" + song[2] + ")!important;}</style>");
    }