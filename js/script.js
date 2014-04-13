//Smooth Scroll Hack
$('.music').on('touchstart', function (event) {});

//Vars
var music = [];
var hasSpotify;
var audio = $(".player")[0];
var currentSongID = false;
var countryCode;
var nextSongTimer = false;
var isMobile = {
    t: function () {
        return (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/iPhone|iPad|iPod/i) || navigator.userAgent.match(/Opera Mini/i) || navigator.userAgent.match(/IEMobile/i));
    }
};

//Key Controls
$(window).keypress(function (e) {
    if (e.which == 113) {
        if (currentSongID !== false) {
            clickedSong(currentSongID - 1);
        }
    }
    if (e.which == 101) {
        if (currentSongID !== false) {
            clickedSong(currentSongID + 1);
        }
    }
});


//Basic Functions
function playSong(url, mode) {
    if (mode === 1) {
        window.frames.invisif.document.location.href = url;
        if (nextSongTimer !== false) {
            clearInterval(nextSongTimer);
            nextSongTimer = setInterval(function () {
                if(currentSongID + 1){
                clickedSong(currentSongID + 1);
                }else{
                clickedSong(0);
                }
                clearInterval(nextSongTimer);
            }, music[currentSongID][6] * 1000);
        }
    } else if (mode === 0) {
        $("#playersrc").attr("src", url);
        audio.pause();
        audio.load();
        audio.play();
    }
}

//Song Links
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
    playSong(window.location.hash.replace(/#/g, "spotify:track:"), 1);
}

//Detect If Spotify Is Installed
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
                $.ajax({
                    type: 'GET',
                    dataType: 'script',
                    timeout: 1000,
                    url: 'https://wlunlyjfwn.spotilocal.com:4371/r',
                    error: function (jqXHR) {

                        if (jqXHR.status == '404') {
                            hasSpotify = true;
                        } else {
                            hasSpotify = false;
                        }
                        console.info('This ↑ ' + jqXHR.status + ' ↑ is checking if Spotify is installed');
                    }

                });
            }
            console.info('This ↑ ' + jqXHR.status + ' ↑ is checking if Spotify is installed');
        }

    });

} else {
    if (confirm("Do you want to play via Spotify?")) {
        hasSpotify = true;
    } else {
        hasSpotify = false;
    }

}
//Get Country Code
$.getJSON('http://freegeoip.net/json/', function (data) {
    countryCode = data.country_code;

    //Get basic iTunes Feed
    console.log();
    $.ajax({
        type: 'GET',
        url: "http://itunes.apple.com/" + countryCode + "/rss/topsongs/limit=50/explicit=true/json",
        dataType: 'json',
        success: function (data) {
            var items = data.feed.entry;

            for (var n = 0; n < items.length; n++) {
                var title = items[n]['im:name'].label.replace(/ *\[[^)]*\] *| *\([^)]*\) */g, "");
                var artist = items[n]['im:artist'].label;
                var thumbnail = items[n]['im:image'][2].label.replace(/170x170/g, "340x340");
                var itunesURL;
                if (items[n].link[1]) {
                    itunesURL = items[n].link[1].attributes.href;
                } else {
                    itunesURL = false;
                }
                var songInfo = [title, artist, thumbnail, itunesURL, encodeURIComponent(title)];
                music.push(songInfo);
                var image = $('<img class="art" src="' + thumbnail + '">')
                //For Future Fav Feature
                /*var image = $('<img class="art" src="' + thumbnail + '">').hover(function () {
                    $(this).css("background-image", "url(" + $(this).attr("src") + ")");
                    $(this).attr("src", "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBvcGFjaXR5PSIwLjc1IiBmaWxsPSIjMjMyMzIzIiBkPSJNMCwwdjE3MGgxNzBWMEgweiBNMTI5LjQ2NCw3OS4wOTJsLTI0LjMzNywxNy42ODZsOS4zMzUsMjguNzEzCgljMS43LDUuMjMxLTAuNTUsNi44NjYtNSwzLjYzNWwtMjQuNDM1LTE3Ljc0bC0yNC40MDUsMTcuNzM2Yy00LjQ0OSwzLjIzMy02LjY5OCwxLjU5OS00Ljk5OC0zLjYzMWw5LjMyNS0yOC42ODJsLTI0LjQxLTE3LjcyMQoJYy00LjQ1MS0zLjIzMS0zLjU5Mi01Ljg3NSwxLjkwOC01Ljg3NUg3Mi42Mmw5LjMzMS0yOC43MDJjMS43LTUuMjMxLDQuNDgzLTUuMjMxLDYuMTg0LDBsOS4zMzEsMjguNzAyaDMwLjA4NwoJQzEzMy4wNTMsNzMuMjEzLDEzMy45MTMsNzUuODU4LDEyOS40NjQsNzkuMDkyeiIvPgo8L3N2Zz4=");
                    var thisElement = $(this);
                    var timer = setInterval(function () {
                        if (thisElement.is(":hover")) {
                            thisElement.attr("src", "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCgkgd2lkdGg9IjE3MHB4IiBoZWlnaHQ9IjE3MHB4Ij4KPHBhdGggb3BhY2l0eT0iMC44NSIgZmlsbD0iI0ZGRUUxRCIgZD0iTTQwLjUzOSw3OS4wODhjLTQuNDUxLTMuMjMxLTMuNTkyLTUuODc1LDEuOTA4LTUuODc1aDg1LjEwNmM1LjUsMCw2LjM2LDIuNjQ1LDEuOTExLDUuODc5CglsLTY4Ljg0Miw1MC4wM2MtNC40NDksMy4yMzMtNi42OTgsMS41OTktNC45OTgtMy42MzFsMjYuMzI3LTgwLjk4YzEuNy01LjIzMSw0LjQ4My01LjIzMSw2LjE4NCwwbDI2LjMyNyw4MC45OAoJYzEuNyw1LjIzMS0wLjU1LDYuODY2LTUsMy42MzVMNDAuNTM5LDc5LjA4OHoiLz4KPC9zdmc+")
                        }
                        clearInterval(timer);
                    }, 1000)
                }, function () {
                    $(this).attr("src", $(this).css("background-image").replace("url(", "").replace(")", ""));
                    $(this).css("background-image", "");
                });//*/
                $('.music').append($('<article class="song"><p>' + title + '</p><p>' + artist + '</p></article>').prepend(image).click(clickedSong));

            }
        }
    });
});
// Fun debug suffix func
function numSuffix(num) {
    if (num > 3 && num < 21) // catch teens, which are all 'th'
        sufx = num + 'th';
    else if (num % 10 == 1) // exceptions ending in '1'
        sufx = num + 'st';
    else if (num % 10 == 2) // exceptions ending in '2'
        sufx = num + 'nd';
    else if (num % 10 == 3) // exceptions ending in '3'
        sufx = num + 'rd';
    else
        sufx = num + 'th';

    return sufx
}
// Play Song Handler
function clickedSong(songPos) {
    var songPosition;
    if (!isNaN(songPos)) {
        songPosition = songPos;
        currentSongID = songPos;
    } else {
        songPosition = $(this).index() - 1;
        currentSongID = $(this).index() - 1;
    }
    console.info("User clicked song " + songPosition + " (" + numSuffix(songPosition + 1) + ")");
    var song = music[songPosition];
    var artist = song[1];
    window.document.title = song[0] + ' - ' + song[1];
    audio.pause();
    //IF HAS SPOTIFY
    if (hasSpotify === true) {
        //TRY WITHOUT ARTIST NAME
        console.info("User has Spotify");
        $.get("//ws.spotify.com/search/1/track.json", {
            "q": song[4]
        }, function (data) {
            var num = 0;
            var found = false;
            while (found === false) {
                //IF ARTIST IS MATCH
                var artistString;
                for (var key in data.tracks[num].artists) {
                    artistString = artistString + " " + data.tracks[num].artists[key].name.trim().toLowerCase();
                }
                if (artistString.indexOf(artist.trim().toLowerCase().split(" ")[0]) != -1) {
                    console.info("Artist matches with only title");
                    var url = data.tracks[num].href;
                    music[songPosition].push(url);
                    music[songPosition].push(data.tracks[num].length);
                    history.pushState(url, "", url.replace(/spotify:track:/g, "#"));
                    playSong(url, 1);
                    found = true;

                } else {
                    //IF ARTIST ISNT MATCH
                    console.info("Artist doesnt match with only title");
                    num++;
                    //console.log('False ' + num);
                    found = false;
                }
                // IF TRIED 20 TIMES
                if (num == 20) {
                    console.info("Tried with only title 20 times with no matches");
                    //TRY WITH ARTIST NAME
                    $.get("//ws.spotify.com/search/1/track.json", {
                        "q": song[4] + " " + artist
                    }, function (data) {
                        var num = 0;
                        var found = false;
                        while (found === false) {
                            var artistString;
                            for (var key in data.tracks[num].artists) {
                                artistString = artistString + " " + data.tracks[num].artists[key].name.trim().toLowerCase();
                            }
                            if (artistString.indexOf(artist.trim().toLowerCase().split(" ")[0]) != -1) {
                                console.info("Artist matches with title and artist");
                                //console.log('True ' + num);
                                var url = data.tracks[num].href;
                                music[songPosition].push(url);
                                music[songPosition].push(data.tracks[num].length);
                                history.pushState(url, "", url.replace(/spotify:track:/g, "#"));
                                playSong(url, 1);
                                found = true;
                                break;
                                //IF ARTIST ISNT MATCH WITH ARTIST IN QUERY
                            } else {
                                console.info("Artist doesnt match with title and artist");
                                num++;
                                found = false;
                            }
                            //IF WITH ARTIST IN QUERY TRIED 20 TIMES
                            if (num == 20) {
                                console.info("Tried with title and artist 20 times with no matches");
                                playSong(song[3], 0);
                                break;
                            }
                        }

                    });
                    break;


                }
            }


        });
    } else {
        playSong(song[3], 0);
    }
    $(".chngBG").remove();
    $('head').append("<style class='chngBG'>body::before{ background-image:url(" + song[2] + ")!important;}</style>");
}