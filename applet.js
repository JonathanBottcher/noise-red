const Applet = imports.ui.applet;
const Util = imports.misc.util;

function MyApplet(orientation, panel_height, instance_id){
	this._init(orientation, panel_height, instance_id);
}


MyApplet.prototype = {
	__proto__: Applet.IconApplet.prototype,

	_init: function(orientation, panel_height, instance_id){
		Applet.IconApplet.prototype._init.call(this, orientation, panel_height, instance_id);

		this.set_applet_icon_name("org.gnome.SoundRecorder");
		this.set_applet_tooltip(_("Click here to reduce noise"));
		
		this.clicked = false


},
	
	on_applet_clicked: function(){
		if(this.clicked === false){	
			Util.spawn(['pactl', 'load-module', 'module-echo-cancel']);
			this.clicked = true
		}

		



}


}



function main(metadata, orientation, panel_height, instance_id){
	return new MyApplet(orientation, panel_height, instance_id);

}
