const Applet = imports.ui.applet;
const Gio = imports.gi.Gio;
const Lang = imports.lang;
const Main = imports.ui.main;
const St = imports.gi.St;
const Tooltips = imports.ui.tooltips;
const PopupMenu = imports.ui.popupMenu;
const GnomeSession = imports.misc.gnomeSession;
const Util = imports.misc.util;
const Slider = imports.ui.slider

const VOLUME_ADJUSTMENT_STEP = 0.05;

class ReductionSwitch extends PopupMenu.PopupBaseMenuItem {
    constructor(applet) {
        super();
        this._applet = applet;

        this.label = new St.Label({ text: _("Noise Reduction") });

        this.actor.label_actor = this.label;

        this._switch = new PopupMenu.Switch(false);

        this.addActor(this.label);

        this._statusBin = new St.Bin({ x_align: St.Align.END });
        this.addActor(this._statusBin, { expand: true, span: -1, align: St.Align.END });
        this._statusBin.child = this._switch.actor;

        this.actor.hide();
        
        GnomeSession.SessionManager(Lang.bind(this, function(proxy, error) {
            if (error)
                return;

            this.actor.show();
            this.updateStatus();
        
        }));
    }

    activate(event) {
        if (this._switch.actor.mapped) {
            this._switch.toggle();
        }

        this.toggled(this._switch.state);

        PopupMenu.PopupBaseMenuItem.prototype.activate.call(this, event, true);
    }

    updateStatus() {
        let current_state = _switch.state;

        if (current_state) {
            this._applet.set_applet_icon_symbolic_name('org.gnome.SoundRecorder"'); //TODO: change icons later
            this._applet.set_applet_tooltip(_("Noise reduction: off")); 
        } else {
            this._applet.set_applet_icon_symbolic_name('org.gnome.SoundRecorder"');
            this._applet.set_applet_tooltip(_("Noise reduction: active")); 
        }

    }

    toggled(active) {
        if (!active) {
          Util.spawn(['pactl', 'unload-module', 'module-echo-cancel']);

        } else if (active) {
            Util.spawn(['pactl', 'load-module', 'module-echo-cancel']);
            Util.spawn(['sh', '.local/share/cinnamon/applets/noise-reduction@cinnamon.org/find_source.sh']); //set echo-cancelled input source as default

            
        }
    }

}

class VolumeSlider extends PopupMenu.PopupSliderMenuItem {
    constructor(applet) {
        super(50, 0, 100, VOLUME_ADJUSTMENT_STEP);  // Initial value, min, max, step
        this._applet = applet;

        // Connect to value-changed signal
        this.connect('value-changed', this.onSliderValueChanged.bind(this));
    }

    onSliderValueChanged(slider) {
        let volume = Math.round(slider.value * 100);
        Util.spawn(['pactl', 'set-source-volume', '@DEFAULT_SOURCE@', `${volume}%`]);
    }
}

class NoiseReductionApplet extends Applet.IconApplet {
    constructor(metadata, orientation, panel_height, instanceId) {
        super(orientation, panel_height, instanceId);

        this.metadata = metadata;

        this.menuManager = new PopupMenu.PopupMenuManager(this);
        this.menu = new Applet.AppletPopupMenu(this, orientation);
        this.menuManager.addMenu(this.menu);

        this.reductionSwitch = new ReductionSwitch(this);
        this.menu.addMenuItem(this.reductionSwitch);

        this.set_applet_icon_symbolic_name("org.gnome.SoundRecorder");
        this.set_applet_tooltip(_("Noise reduction"));

        this.volumeSlider = new VolumeSlider(this)
        this.menu.addMenuItem(this.volumeSlider);

    }

    on_applet_clicked(event) {
        this.menu.toggle();
    }
    
}

function main(metadata, orientation, panel_height, instanceId) {
    return new NoiseReductionApplet(metadata, orientation, panel_height, instanceId);
}
