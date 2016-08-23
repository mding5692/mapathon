//
window.onload = function() {
    var icon = document.getElementById('nav-icon');
    icon.onclick = function() {
        var side = document.getElementById('side');
        var pos = side.offsetLeft;
        if (pos === -320) {
            var open = setInterval(frame, 5);
            function frame() {
                if (pos != 0) {
                    pos += 5;
                    side.style.left = pos + 'px';
                } else {
                    clearInterval(open);
                }
            }
        } else {
            var close = setInterval(frame, 5);
            function frame() {
                if (pos != -320) {
                    pos -= 5;
                    side.style.left = pos + 'px';
                } else {
                    clearInterval(close);
                }
            }
        }
    }
}
