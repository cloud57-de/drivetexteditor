//
// Main ******************************************
//

import c from './mod_client';
import o from './mod_operations';
import h from './mod_helper';

import './index.html';
import './favicon.ico';

$(function(){
    h.showLoader();
    $('#sbtn').bind("click",o.saveFile);
    switch( h.getParam("state") ){
        case null:
            c.initClientStandalone();
            break;
        case "install":
        case "Install":
        case "installation":
        case "Installation":
            c.initClientInstall();
            break;
        case "easteregg": // ;)
            (function(){
                let r = Math.PI;
                let s = 256 + Math.sin(r) * 128;
                $('#main').css('overflow','hidden');
                $('#info').html('<span id=egg>&#9786;</span>');
                setInterval(function(){
                    r += 0.1;
                    s = 256 + Math.sin(r) * 128;
                    let s_prefix = 'font-size:';
                    let s_postfix = 'px;color:#808080';
                    $('#egg').attr('style', s_prefix + s + s_postfix);
                },16);
            }());
            break;
        default:
            $('#userprofile').css("visibility","visible");
            c.initClientStandard();
            break;
    }
})
