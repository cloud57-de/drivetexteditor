//
// Module Client ******************************************
//

import h from './mod_helper';
import o from './mod_operations';
import editor from './mod_editor';
import driveappsutil from './mod_driveappsutil';

function initClientStandalone() {
    let f = function(){
        $('#info').empty();
        $('#stl').html("Standalone-mode");
        // Information dialog
        $('#main').append( $('#t_dialog').html() );
        $('#dialog').show();
        // Open button
        $("#opentexteditor").bind("click",function(){
            let lsname = 'Cloud57TextEditorLocalStorage';
            $('#fn').prop('disabled',true);
            $('#fn').css('color','#f0f0f0');
            $('#fn').val('Textfile in your local storage');
            // Save function
            $('#sbtn').prop('disabled', false);
            $('#sbtn').css('color','#f0f0f0');
            $('#sbtn').bind("click",function(){
                localStorage.setItem(lsname,editor.getValue());
                editor.focus();
            });
            // Get data from the local storage
            let lsitem = localStorage.getItem(lsname);
            if (lsitem != null){
                editor.setValue(lsitem);
            }
            // Open editor
            $('#editor').css('visibility','visible');
            $('#dialog').remove();
            editor.gotoLine(0);
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
                $('#userprofile').css("visibility","visible");
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
