$.get("//itunes.apple.com/gb/rss/topsongs/limit=50/explicit=true/xml").done(function(a) {
  a = a.querySelectorAll("entry");
  for (var b = 0;b < a.length;b++) {
    var c = a[b].querySelectorAll("name")[0].textContent.split("(").join("").split(")").join(""), d = a[b].querySelectorAll("image")[2].textContent, e = a[b].querySelectorAll("artist")[0].textContent, f = encodeURIComponent(c);
    $(".music").append('<div class="song" onclick="clickedSONG(\'' + addslashes(d) + "','" + addslashes(f) + '\')"><img class="art" src="' + addslashes(d) + '"><p>' + c + "</p><p>" + addslashes(e) + "</p></div>");
  }
});
function addslashes(a) {
  return(a + "").replace(/[\\"']/g, "\\$&").replace(/\u0000/g, "\\0");
}
function clickedSONG(a, b) {
  $.get("//ws.spotify.com/search/1/track", {q:b}).done(function(a) {
    a = a.querySelectorAll("track")[0].getAttribute("href");
    location.href = a;
  });
  location.href = "spotify:search:" + b;
  $(".chngBG").remove();
  $("head").append("<style class='chngBG'>body::before{ background-image:url(" + a + ")!important;}</style>");
}
