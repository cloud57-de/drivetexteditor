//
// Module Client ******************************************
//

import dot from 'dot';
import h from './mod_helper';
import o from './mod_operations';
import editor from './mod_editor';
import ls from './mod_localstorage';
import driveappsutil from './mod_driveappsutil';

//
// Local helper
//

function createFileslist(icon){
    $('#fileslist').empty();
    if (ls.getFiles().length > 0) {
        let t = dot.template( $('#t_file').html() );
        ls.getFiles().forEach(function(f){
            // Basic information
            let elem = {
                id: f.id,
                name: f.name,
                icon: icon
            };
            // Filesize
            let fl = f.content.length;
            if (fl < 1024){
                elem.filesize = fl + "bytes";
                if (fl==1) elem.filesize = fl + "byte";
            }
            if (fl >= 1024){
                elem.filesize = Math.ceil( fl / 1024 ) + "kbytes";
            }
            // Create date
            try{
                let datearr = f.createdate.split("T");
                let date = datearr[0];
                elem.createdate = date + " / ";
            } catch(e){
                elem.createdate = "";
            }
            // And go
            $('#fileslist').append( t(elem) );
        })
    } else {
        $('#fileslist').html("<div class='red'><i>Currently there are no files in your browser's local storage.</i></div>");
    }
}

//
// The clients
//

function initClientStandalone() {
    let f = function(){
        $('#info').empty();
        $('#stl').html("Standalone-mode");
        // Information dialog
        $('#main').append( $('#t_dialog_info').html() );
        $('#dialog_info').show();
        // Bind function "New"
        $("#newfile").bind("click",function(){
            // Prepare GUI
            $('#fn').prop('disabled',false);
            $('#fn').css('color','#f0f0f0');
            $('#fn').val('NewTextfile');
            $('#sbtn').prop('disabled', false);
            $('#sbtn').css('color','#f0f0f0');
            // Bind function to save a text to the browser's local storage
            $('#sbtn').bind("click",function(){
                ls.getFiles().push({
                    "id" : "file_" + Date.now(),
                    "name" : $('#fn').val(),
                    "createdate" : new Date(),
                    "content" : editor.getValue()
                })
                ls.update();
                editor.focus();
            });
            // Open editor
            $('#editor').css('visibility','visible');
            $('#dialog_info').remove();
            editor.gotoLine(0);
            editor.focus();
        });
        // Bind function "Open"
        $("#openfiles").bind("click",function(){
            $('#dialog_info').remove();
            $('#main').append( $('#t_dialog_openfiles').html() );
            createFileslist("open_in_browser");
            $('#dialog_files').show();
            // Bind function to open a file from the browser's local storage
            $('#fileslist').bind("click",function(e){
                let id = e.target.id;
                if( id.startsWith('file_') ){
                    ls.getFiles().forEach(function(f){
                        if( f.id == id ){
                            $('#fn').prop('disabled',false);
                            $('#fn').css('color','#f0f0f0');
                            $('#fn').val(f.name)
                            editor.setValue(f.content);
                            // Save function
                            $('#sbtn').prop('disabled', false);
                            $('#sbtn').css('color','#f0f0f0');
                            $('#sbtn').bind("click",function(){
                                ls.getFiles().forEach(function(f){
                                    if( f.id == id ){
                                        f.content = editor.getValue();
                                        f.name = $('#fn').val();
                                    }
                                })
                                ls.update();
                                editor.focus();
                            });
                            // Open editor
                            $('#editor').css('visibility','visible');
                            $('#dialog_files').remove();
                            editor.gotoLine(0);
                            editor.focus();
                        }
                    })
                }
            });
        });
        // Bind function "Delete"
        $("#deletefiles").bind("click",function(){
            $('#dialog_info').remove();
            $('#main').append( $('#t_dialog_deletefiles').html() );
            createFileslist("delete_forever");
            $('#dialog_files').show();
            // Bind function to delete a file from the browser's local storage
            $('#fileslist').bind("click",function(e){
                let id = e.target.id;
                if( id.startsWith('file_') ){
                    ls.getFiles().forEach(function(f){
                        if( f.id == id ){
                            ls.getFiles().splice(ls.getFiles().indexOf(f),1);
                        };
                    });
                    ls.update();
                    createFileslist("delete_forever");
                }
            });
        });
        // Init the editor
        editor.init();
    }
    setTimeout(f,1024); // Wait some time to enjoy the loader :)
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
