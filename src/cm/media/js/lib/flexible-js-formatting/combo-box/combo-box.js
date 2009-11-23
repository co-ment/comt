/*
 * Copyright (C) 2004 Baron Schwartz <baron at sequent dot org>
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by the
 * Free Software Foundation, version 2.1.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public License for more
 * details.
 */

var key;
var combo;

document.onkeydown = function(e) {
    if (combo && combo.editing && window.event && window.event.keyCode == 8) {
        window.event.cancelBubble = true;
        window.event.returnValue = false;
        if (combo.insertSpace) {
            combo.insertSpace = false;
        }
        else {
            with (combo.options[combo.options.length - 1]) {
                text = text.substring(0, text.length - 1);
            }
        }
    }
}

function edit(e) {
    if (window.event){
        key = window.event.keyCode;
        combo = window.event.srcElement;
        // Stop the browser from scrolling through <option>s
        window.event.cancelBubble = true;
        window.event.returnValue = false;
    }
    else if (e) {
        key = e.which;
        combo = e.target;
    }
    else {
        return true;
    }

    if (key == 13 || key == 8 || (key > 31 && key < 127)) {
        if (combo.editing && key == 13) {
            // Done editing
            combo.editing = false;
            combo = null;
            return false;
        }
        else if (!combo.editing) {
            combo.editing = true;
            combo.options[combo.options.length] = new Option("");
        }

        // Normal key
        if (key > 32 && key < 127) {
            with (combo.options[combo.options.length - 1]) {
                if (combo.insertSpace) {
                    combo.insertSpace = false;
                    text = text + " " + String.fromCharCode(key);
                }
                else {
                    text = text + String.fromCharCode(key);
                }
            }
        }
        // The backspace key
        else if (key == 8 && combo.options[combo.options.length - 1].text.length) {
            if (combo.insertSpace) {
                combo.insertSpace = false;
            }
            else {
                with (combo.options[combo.options.length - 1]) {
                    text = text.substring(0, text.length - 1);
                }
            }
        }
        // Space key requires special treatment; some browsers will not append a space
        else if (key == 32) {
            combo.insertSpace = true;
        }
        combo.selectedIndex = combo.options.length - 1;
        return false;
    }
}
