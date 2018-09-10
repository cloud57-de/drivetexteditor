//
// Module Editor ******************************************
//

let editor = undefined;

function init(){
    $('#editor').css("visibility","hidden");
    editor = ace.edit("editor");
    editor.renderer.setShowGutter(true);
    editor.setShowPrintMargin(false);
    editor.setOption("wrap", true);
    editor.setOption("indentedSoftWrap", false);
}

function setValue(data){
    editor.setValue(data);
};

function gotoLine(line){
    editor.gotoLine(line);
}

function focus(){
    editor.focus();
}

function resize(){
    editor.resize();
}

function getValue(){
    return editor.getValue();
}

export default {
    init,
    getValue,
    setValue,
    gotoLine,
    resize,
    focus
}
