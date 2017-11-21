// Data ******************************************

var id = undefined;
var token = undefined;
var state = undefined;
var editor = undefined;
var gref = {
  "client_id":"758681145932-76cra1qkeomh8nd1qens6u2q317cqpfa.apps.googleusercontent.com",
  "discoveryDocs": ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
};

// Start/Entrypoint ******************************************

$(function(){
  // ACE
  editor = ace.edit("editor");
  editor.renderer.setShowGutter(true);
  // JQuery extention
  $.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
       return null;
    }
    else{
       return decodeURI(results[1]) || 0;
    }
  }
  // Check params
  state = $.urlParam("state");
  if(state==undefined){
    gapi.load('client:auth2', initClientInstall);
  } else {
    gapi.load('client:auth2', initClient);
  }
})

// Init ******************************************

function initClientInstall(){
  gref.scope = "https://www.googleapis.com/auth/drive.install";
  gapi.client.init(gref).then(function(){
    gapi.auth2.getAuthInstance().signIn().then(function(){
      $('#wait').html("Installation done.");
    }).catch(function(err){
      console.log(err)
      alert("Error! See console for details.");
    });
  }).catch(function(err){
    console.log(err);
    alert("Error! See console for details.");
  });
};
function initClient(){
  gref.scope = "https://www.googleapis.com/auth/drive";
  gapi.client.init(gref).then(function(){
    if(gapi.auth2.getAuthInstance().currentUser.get().isSignedIn()){
      exe();
    } else {
      gapi.auth2.getAuthInstance().signIn().then(function(){
        exe();
      }).catch(function(err){
        console.log(err)
        alert("Error! See console for details.");
      });
    }
  }).catch(function(err){
    console.log(err);
    alert("Error! See console for details.");
  });
}
function exe(){
  token = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse(true).access_token;
  state = JSON.parse($.urlParam("state"));
  if (state==undefined) return;
  if(state.action=="open"){
    id = state.ids[0];
    _showContent(id);
  } else
  if(state.action=="create"){
    uiHideWait();
    uiShowDesktop();
  }
}

// Operations ******************************************

function _saveFile(){
  $('#sbtn').prop('disabled',true);
  $('#stl').html("Saving file, please wait...");
  var __updateFile = function(id, text, fname){
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";
    var metadata = {
      description : 'n/a',
      'mimeType': 'text/plain',
      'name' : fname
    };
    var multipartRequestBody =
      delimiter +  'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter + 'Content-Type: application/json\r\n\r\n' +
      text +
      close_delim;
      gapi.client.request({
        'path': '/upload/drive/v3/files/'+id,
        'method': 'PATCH',
        'params': {'fileId': id, 'uploadType': 'multipart'},
        'headers': { 'Content-Type': 'multipart/form-data; boundary="' + boundary + '"', 'Authorization': 'Bearer ' + token },
        'body': multipartRequestBody
      }).execute(function(file){
        uiShowDesktop();
        uiHideWait();
        $('#stl').html("File saved.");
        setTimeout(function(){
          $('#stl').html("");
          $('#sbtn').prop('disabled',false);
        },1000);
      });
  };
  var name = $('#fn').val();
  // var content = $('#ct').val();
  content = editor.getValue();
  var folderId = JSON.parse($.urlParam("state")).folderId;
  if(state.action=="create" && id==undefined){
    gapi.client.drive.files.create({
      "name" : name,
      "mimeType" : "text/plain",
      "fields" : "id",
      "parents" : [folderId]
    }).then(function(resp){
      id = resp.result.id;
      __updateFile(resp.result.id,content);
    }).catch(function(err){
      console.log(err);
      alert("Error! See console for details.");
      $('#sbtn').prop('disabled',true);
    });
  } else {
    __updateFile(id,content,name);
  }
}
function _showContent(id){
  // Get filename
  gapi.client.drive.files.get({
    fileId: id,
    fields: 'name'
  }).then(function(resp){
    var name = JSON.parse(resp.body).name;
    $('#fn').val(name);
  }).catch(function(err){
    console.log(err);
    alert("Error! See console for details.");
  });
  // Get content
  $.ajax({
    url: "https://www.googleapis.com/drive/v3/files/"+id+"?alt=media",
    headers : {"Authorization":"Bearer " + token}
  }).then(function(data){
    //  $('#ct').val(data);
    editor.setValue(data);
    uiShowDesktop();
    uiHideWait();
  }).catch(function(err){
    console.log(err);
    alert("Error! See console for details.");
  });
}

// UI ******************************************

function uiShowDesktop(){
  $('#desktop').css("visibility","visible");
}
function uiHideWait(){
  $('#wait').css("visibility","hidden");
}

// Export to global scope ******************************************

window._saveFile = _saveFile;
