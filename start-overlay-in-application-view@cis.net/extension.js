
// ......................................................................... //
// imports
const Main = imports.ui.main;
const Shell = imports.gi.Shell;
const Overview = imports.ui.overview;

// ......................................................................... //
// extension scoped variable used to hold the original toggle function so we
// can assign it back on extension disable step
let originalToggleFunction;


// ......................................................................... //
function init() {
    // on intialization set the our original toggle holding variable to null
    originalToggleFunction = null;
}


// ......................................................................... //
function enable() {

    // save the existing toggle function so we can use to to restore bits later
    nativeToggleFunction = Overview.Overview.prototype['toggle'];

    /*
    this is a copy of an existing toggle function but where we
    show apps but hid the whole Overview.
    TODO: currently we do not trigger animation so if the Overview is
          toggled before the icons appear (can be toggled by other apps like
          dash-to-dock) so if the hiding the Overview happens before animation
          is complete or the next application shows only some apps (ones that)
          were drawn before untoggling wil appear. So we either need to run
          the animation or if we do not use it we do the same tricks 
          dash-to-dock does where it hides the Overview, does speedy animation
          and unhides. We need to look into "_animateVisible"
    */
    Overview.Overview.prototype['toggle'] = 
        function startOverlayInApplicationViewToggle() {
            if (this.isDummy) {
                return;
            }

            if (this.visible) {
                this.hide();
            }
            else {
                this.viewSelector.showApps();
            }
        };

    /*
    "re"-bind 'panel-main-menu' to our monkeypatched function needed because 
    of race conditions. Specifically during the login or Gnome Shell
    restart extension is enabled before the keybind is bound to the function by
    a call from "_sessionUpdated" function in main.js all works well. 

    However, when Gnome Shell Screen Lock is activated it disables the 
    extension as part of the normal process hence unpatching the toggle
    prototype back to the original function. Then when the Screen Lock is
    deactivated it looks like _sessionUpdated is run before extension enabled
    and monkeypatching happens after it hence not binding out toggle function.

    So we manually bind it ourselves.
    */
    Main.wm.setCustomKeybindingHandler(
        'panel-main-menu',
        Shell.ActionMode.NORMAL |
        Shell.ActionMode.OVERVIEW,
        Main.sessionMode.hasOverview ? 
            Main.overview.toggle.bind(Main.overview) : null
    );
}


// ......................................................................... //
function disable() {

    /* 
    if have the original function, put it back to back and re-bind the
    'panel-main-menu' to original toggle again. (See explanation in enable function)
    */
    if (originalToggleFunction !== null) {
        // save the ogi
        Overview.Overview.prototype['toggle'] = originalToggleFunction;
        // "re"-bind 'panel-main-menu' to our monkeypatched function 
        Main.wm.setCustomKeybindingHandler(
            'panel-main-menu',
            Shell.ActionMode.NORMAL |
            Shell.ActionMode.OVERVIEW,
            Main.sessionMode.hasOverview ? 
                Main.overview.toggle.bind(Main.overview) : null
      );
    }
}
