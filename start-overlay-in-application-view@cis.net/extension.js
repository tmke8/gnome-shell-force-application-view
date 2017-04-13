
const overview = imports.ui.overview;

let origin;

function init() {
    origin = null;
}

function enable() {
    origin = overview.Overview.prototype['toggle'];
    overview.Overview.prototype['toggle'] = function() {
        if (this.isDummy)
            return;

        if (this.visible)
            this.hide();
        else
            this.viewSelector.showApps();
    };
}

function disable() {
    if (origin) {
        overview.Overview.prototype['toggle'] = origin;
    }
}
