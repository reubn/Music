//Smooth Scroll Hack
$('.music').on('touchstart', function (event) {});
//Song Links
if (window.location.hash) {
    $.ajax({
        type: 'GET',
        dataType: 'jsonp',
        url: '//embed.spotify.com/oembed/',
        data: {
            url: window.location.hash.split("#").join("spotify:track:")
        }
    }).done(function (data) {
        $('head').append("<style class='chngBG'>body::before{ background-image:url(" + data.thumbnail_url.split("cover").join("640") + ")!important;}</style>");
    });
    window.open(window.location.hash.split("#").join("spotify:track:")).close();
}

//Vars
var music = [];
var hasSpotify;
var audio = $(".player");
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
$.get("http://itunes.apple.com/gb/rss/topsongs/limit=50/explicit=true/xml", function (data) {
    var items = data.getElementsByTagName("entry");

    for (var n = 0; n < items.length; n++) {
        var title = items[n].querySelector("name").textContent.split(/ *\[[^)]*\] *| *\([^)]*\) */g).join("");
        var artist = items[n].querySelector('artist').textContent;
        var thumbnail = items[n].getElementsByTagName("image")[2].textContent.split("170x170").join("340x340");
        var itunesURL = items[n].getElementsByTagName('link')[1].getAttribute('href');
        var songInfo = [title, artist, thumbnail, itunesURL, encodeURIComponent(title)];
        music.push(songInfo);
        var songPosition = music.length - 1;
        $('.music').append('<div class="song" onclick="clickedSONG(' + songPosition + ')"><img class="art" src="' + thumbnail + '"><p>' + title + '</p><p>' + artist + '</p></div>');

    }
});

function playiTunes(itunesURL) {
    $("#playersrc").attr("src", itunesURL);
    audio[0].pause();
    audio[0].load();
    audio[0].play();
}

function clickedSONG(songPosition) {
    var song = music[songPosition];
    var art = song[1];
    //console.log(art.trim().toLowerCase().split(" ")[0]);
    audio[0].pause();
    if (hasSpotify === true) {
        $.get("//ws.spotify.com/search/1/track", {
            "q": song[4]
        }, function (data) {
            var num = 0;
            var found = false;
            while (found === false) {
                //console.log(data.querySelectorAll("artist")[num].textContent.trim().toLowerCase().split(" ")[0]);
                if (data.querySelectorAll("artist")[num].textContent.trim().toLowerCase().split(" ")[0] == art.trim().toLowerCase().split(" ")[0]) {
                    //console.log('True ' + num);
                    var url = data.querySelectorAll("track")[num].getAttribute('href');
                    music[songPosition].push(url);
                    history.pushState(url, "", url.split("spotify:track:").join("#"));
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