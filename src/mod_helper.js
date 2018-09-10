//
// Module Helper ******************************************
//

function getParam(name) {
    return (new URL(window.location.href)).searchParams.get(name);
}

function showLoader(){
    $('#info').html("<div class='loader'/>");
}

function showLoginError(msg){
    if( msg == "popup_blocked_by_browser"){
        $("#info").html("Login error!<br><span class='red'>" + msg + "</span><br><br>Allow popups and redirects and reload page!");
    } else
    if( msg == "popup_closed_by_user"){
        $("#info").html("Login error!<br><span class='red'>" + msg + "</span><br><br>Reload page and do not close popup!");
    } else
    if( msg == "access_denied"){
        $("#info").html("Login error!<br><span class='red'>" + msg + "</span><br><br>Wrong password or login process canceled!");
    }
}

export default {
    getParam,
    showLoader,
    showLoginError
}
