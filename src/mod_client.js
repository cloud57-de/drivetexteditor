//
// Module Client ******************************************
//

import h from './mod_helper';
import o from './mod_operations';
import editor from './mod_editor';
import driveappsutil from './mod_driveappsutil';

function initClientStandalone() {
    let f = function(){
        $('#stl').html("Standalone-mode");
        $('#fn').prop('disabled', true);
        $('#info').empty();
        $('#main').append( $('#t_dialog').html() );
        $('#dialog').show();
        $("#opentexteditor").bind("click",function(){
            $('#editor').css('visibility','visible');
            $('#dialog').remove();
            editor.focus();
        })
        editor.init();
    }
    setTimeout(f,2048); // Wait some time to enjoy the loader :)
}

function initClientInstall(){
    driveappsutil.init().then(function(){
        driveappsutil.login().then(function(user){
            $('#info').html("Installation done.");
        }).catch(function(err){
            h.showLoginError(err.error);
            console.log(err);
        })
    }).catch(function(err){
        $("#info").html("Initialization error!<br><span class='red'>" + err.error + "</span>");
        console.log(err);
    })
}

function initClientStandard(){
    driveappsutil.init().then(function(){
        driveappsutil.login().then(function(user){
            try{
                $('#userimage').attr("src",gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getImageUrl());
                editor.init();
                let state = JSON.parse(h.getParam("state"));
                if (state == undefined) return;
                if (state.action == "open") {
                    let id = state.ids[0];
                    o.showFileContent(id);
                } else
                if (state.action == "create") {
                    let id = state.folderId;
                    o.createFile(id);
                }
            } catch(e) {
                $("#info").html("Error!<br><span class='red'>" + e + "</span><br><br>The URL seems to be incorrect.");
            }
        }).catch(function(err){
            h.showLoginError(err.error);
            console.log(err);
        })
    }).catch(function(err){
        $("#info").html("Initialization error!<br><span class='red'>" + err.error + "</span>");
        console.log(err);
    });
}

export default {
    initClientInstall,
    initClientStandalone,
    initClientStandard
}
