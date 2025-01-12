Game.registerMod("voidReload",{//this string needs to match the ID provided in your info.txt
	init:function(){
		AddEvent(window, 'keydown', function (e) {
			var ctrlr = e.ctrlKey && e.keyCode == 82;
			var keyR = e.keyCode == 116;
			var ctrle = e.ctrlKey && e.keyCode == 69;
			if(ctrlr || keyR) {
				Game.Popup('Reloading game...');
				Game.toReload = true;
				e.preventDefault();
			}
			else if(!Game.OnAscend && Game.AscendTimer==0 && ctrle) {Game.ExportSave();e.preventDefault();}
		});
	},
});