if(IdleTrading === undefined) var IdleTrading = {};
if(typeof CCSE == 'undefined') Game.LoadMod('https://klattmose.github.io/CookieClicker/' + (0 ? 'Beta/' : '') + 'CCSE.js');
IdleTrading.name = 'Idle Trading';
IdleTrading.version = '1.10';
IdleTrading.GameVersion = '2.052';

IdleTrading.launch = function(){
	IdleTrading.defaultConfig = function(){
		
		var conf = {
			goods: [],
			autoBuy: 1,
			autoSell: 1,
			commonBuyThreshold: -1,
			commonSellThreshold: -1,
			maxCost: -1,
			maxCostString: -1,

		};
		
		for(var iG = 2; iG < Game.ObjectsN; iG++){
			conf.goods.push({
				active: true,
				buyThresh: -1,
				sellThresh: -1,
				minPrice: 99999,
				maxPrice:-99999
			});
		}
		
		return conf;
	}

	IdleTrading.init = function(){
		IdleTrading.isLoaded = 1;
		
		IdleTrading.restoreDefaultConfig(1);
		
		IdleTrading.ReplaceGameMenu();
		CCSE.MinigameReplacer(IdleTrading.ReplaceNativeMarket, "Bank");
		
		
		//***********************************
		//    Post-Load Hooks 
		//    To support other mods interfacing with this one
		//***********************************
		if(IdleTrading.postloadHooks) {
			for(var i = 0; i < IdleTrading.postloadHooks.length; ++i) {
				IdleTrading.postloadHooks[i]();
			}
		}
		
		if (Game.prefs.popups) Game.Popup(IdleTrading.name + ' loaded!');
		else Game.Notify(IdleTrading.name + ' loaded!', '', '', 1, 0);
	}


	//***********************************
	//    Menu Replacer
	//***********************************
	
	IdleTrading.ReplaceGameMenu = function(){
		Game.customOptionsMenu.push(function(){
			CCSE.AppendCollapsibleOptionsMenu(IdleTrading.name, IdleTrading.getMenuString());
		});
		
		Game.customStatsMenu.push(function(){
			CCSE.AppendStatsVersionNumber(IdleTrading.name, IdleTrading.version);
		});
	}

	IdleTrading.getMenuString = function(){
		if(Game.Objects["Bank"].minigameLoaded){
			let m = CCSE.MenuHelper;
			var M = Game.Objects['Bank'].minigame;
			
			var str = 	'<div class="listing">' + m.ActionButton("IdleTrading.restoreDefaultConfig(2); Game.UpdateMenu();", 'Restore Default') +  
						(typeof InsugarTrading == 'undefined' ? '' : m.ActionButton("IdleTrading.importInsugarTrading(); Game.UpdateMenu();", 'Import from Insugar Trading')) + 
						'</div>' + 
						'<div class="listing">' + m.ToggleButton(IdleTrading.config, 'autoBuy', 'IdleTrading_autoBuyButton', 'AutoBuy ON', 'AutoBuy OFF', "IdleTrading.Toggle") +
												  m.ToggleButton(IdleTrading.config, 'autoSell', 'IdleTrading_autoSellButton', 'AutoSell ON', 'AutoSell OFF', "IdleTrading.Toggle") + '</div>' +
						'<div class="listing">' + '<label> General Buy at:</label>' + m.InputBox('common_buyThresh', 65, IdleTrading.config.commonBuyThreshold, 'IdleTrading.UpdateGeneralThreshold(this.value, 0)') +
												  '<label> General Sell at:</label>' + m.InputBox('common_sellThresh', 65, IdleTrading.config.commonSellThreshold, 'IdleTrading.UpdateGeneralThreshold(this.value, 1)')+ '</div>' +
						'<div class="listing">' + '<label> Maximum cost of operation:</label>' + m.InputBox('maxCost', 65, IdleTrading.config.maxCostString, 'IdleTrading.UpdateMaxCost(this.value)') +
												  '<label> Example: 917 sexdecillion. Also accepts the % for a percentage of current stored cookies. -1 for unlimited</label>' + '</div>';
						//'<div class="listing">' + m.ActionButton("IdleTrading.UpdateInputBoxes(); Game.UpdateMenu();", 'Validate') + '</div>'
			str += m.Header('Goods');
			
			for(var iG = 0; iG < M.goodsById.length; iG++){
				var me = M.goodsById[iG];
				var conf = IdleTrading.config.goods[iG];
				
				str += '<div class="listing" style="text-align:left;"><div class="icon" style="pointer-events:none;display:inline-block;transform:scale(0.5);margin:-16px -18px -16px -14px;vertical-align:middle;background-position:' + (-me.icon[0] * 48) + 'px ' + (-me.icon[1] * 48) + 'px;"></div><span class="bankSymbol" style="width:30px;overflow:hidden;white-space:nowrap;">' + me.symbol + '</span>';
				str += '<label> Buy at:</label>' + m.InputBox('IdleTrading_buyThresh_' + iG, 65, conf.buyThresh, 'IdleTrading.UpdatePref(iG, this.value, 0)');
				str += '<label> Sell at:</label>' + m.InputBox('IdleTrading_sellThresh_' + iG, 65, conf.sellThresh, 'IdleTrading.UpdatePref(iG, this.value, 1)');
				str += '<label>Historical min: <b>$' + Beautify(conf.minPrice, 2) + '</b>; Historical max: <b>$' + Beautify(conf.maxPrice, 2) + '</b></label>';
				str += '</div>';
			}
			//str += '<div class="listing">' + m.ActionButton("IdleTrading.UpdateInputBoxes(); Game.UpdateMenu();", 'Validate') + '</div>'

			return str;
		}
		else{
			return '<div class="listing">Stock market minigame not loaded!</div>';
		}
	}

	// IdleTrading.UpdateInputBoxes = function(){
	// 	var textBox = document.getElementById("common_buyThresh");
	// 	IdleTrading.UpdateGeneralThreshold(textBox.value, 0);

	// 	textBox = document.getElementById("common_sellThresh");
	// 	IdleTrading.UpdateGeneralThreshold(textBox.value, 1);

	// 	textBox = document.getElementById("maxCost");
	// 	IdleTrading.UpdateMaxCost(textBox.value);

	// 	for(var iG = 0; iG < M.goodsById.length; iG++){
	// 		textBox = document.getElementById('IdleTrading_buyThresh_' + iG);
	// 		IdleTrading.UpdatePref(iG, textBox.value, 0);

	// 		textBox = document.getElementById('IdleTrading_sellThresh_' + iG);
	// 		IdleTrading.UpdatePref(iG, textBox.value, 1);
	// 	}
	// 	Game.UpdateMenu();
	// }

	IdleTrading.save = function(){
		return JSON.stringify(IdleTrading.config);
	}

	IdleTrading.load = function(str){
		var config = JSON.parse(str);
			
		for(var pref in config){
			if(pref == "goods"){
				for(var iG = 0; iG < config.goods.length; iG++){
					if(IdleTrading.config.goods[iG]){
						for(var pref2 in config.goods[iG]){
							IdleTrading.config.goods[iG][pref2] = config.goods[iG][pref2];
						}
					}
				}
			}
			else{
				IdleTrading.config[pref] = config[pref];
			}
		}
	}

	IdleTrading.restoreDefaultConfig = function(mode){
		IdleTrading.config = IdleTrading.defaultConfig();
		if(mode == 2) IdleTrading.save(IdleTrading.config);
	}
	
	IdleTrading.Toggle = function(prefName, button, on, off, invert){
		if(IdleTrading.config[prefName]){
			l(button).innerHTML = off;
			IdleTrading.config[prefName] = 0;
		}
		else{
			l(button).innerHTML = on;
			IdleTrading.config[prefName] = 1;
		}
		l(button).className = 'smallFancyButton prefButton option' + ((IdleTrading.config[prefName] ^ invert) ? '' : ' off');
	}
	
	IdleTrading.ToggleGood = function(goodID, button, on, off, invert){
		if (IdleTrading.config.goods[goodID]){
			l(button).innerHTML = off;
			IdleTrading.config.goods[goodID].active = 0;
		}else{
			l(button).innerHTML = on;
			IdleTrading.config.goods[goodID].active = 1;
		}
		
		l(button).className = 'smallFancyButton prefButton option' + ((IdleTrading.config.goods[goodID].active^invert) ? '' : ' off');
		IdleTrading.save(IdleTrading.config);
	}
	
	IdleTrading.UpdatePref = function(goodID, value, mode){
		var val = parseFloat(value);
		if(!isNaN(val)){
			if(mode == 0) IdleTrading.config.goods[goodID].buyThresh = val;
			if(mode == 1) IdleTrading.config.goods[goodID].sellThresh = val;
		}
		Game.UpdateMenu();
	}
	
	IdleTrading.UpdateGeneralThreshold = function(value, mode){
		var val = parseFloat(value);
		if(!isNaN(val)){
			if(mode == 0) IdleTrading.config.commonBuyThreshold = val;
			if(mode == 1) IdleTrading.config.commonSellThreshold = val;
		}
		Game.UpdateMenu();
	}

	IdleTrading.UpdateMaxCost = function(value){
		var parts = value.trim().split(/\s+/);
		var processedValue = NaN;
		if (value == -1){
			processedValue = -1;
		}else if(value.substring(value.length - 1) == '%'){
			var numberPart = parseFloat(value.substring(0,value.length - 1));
			if(isNaN(numberPart)) return;
			numberPart = Math.min(Math.max(numberPart, 0), 99.9999);
			processedValue = numberPart/100;
		}else if (parts.length === 2) {
			var numberPart = parseFloat(parts[0]);
			var unitPart = parts[1].toLowerCase();
			const unitPowers = {
				'%':0.01, //percent of max cookies
				'': 1, // Sin unidad (numero normal)
				'thousand': 1e3,
				'million': 1e6,
				'billion': 1e9,
				'trillion': 1e12,
				'quadrillion': 1e15,
				'quintillion': 1e18,
				'sextillion': 1e21,
				'septillion': 1e24,
				'octillion': 1e27,
				'nonillion': 1e30,
				'decillion': 1e33,
				'undecillion': 1e36,
				'duodecillion': 1e39,
				'tredecillion': 1e42,
				'quattuordecillion': 1e45,
				'quindecillion': 1e48,
				'sexdecillion': 1e51,
				'septendecillion': 1e54,
				'octodecillion': 1e57,
				'novemdecillion': 1e60,
				'vigintillion': 1e63,
				'unvigintillion': 1e66,
				'duovigintillion': 1e69,
				'trevigintillion': 1e72,
				// Agrega mas unidades si es necesario
			};
			// Verificar si la unidad es reconocida
			if (unitPart in unitPowers) {
				// Multiplicar el numero por la potencia correspondiente de 10 segun la unidad
				processedValue = numberPart * unitPowers[unitPart];
			}
		}
		if(!isNaN(processedValue)){
			IdleTrading.config.maxCost = processedValue;
			IdleTrading.config.maxCostString = value;
		}
		Game.UpdateMenu();
	}

	IdleTrading.importInsugarTrading = function(){
		var config = IdleTrading.config;
		var quant = InsugarTrading.settings.quantilesToDisplay;
		var bankLevel = Game.Objects["Bank"].level;
		var sellThresh = -1;
		var buyThresh = 2;
		
		for(var i = 0; i < quant.length; i++){
			if(quant[i] < buyThresh) buyThresh = quant[i];
			if(quant[i] > sellThresh) sellThresh = quant[i];
		}
		
		for(var iG = 0; iG < config.goods.length; iG++){
			config.goods[iG]['buyThresh'] = Math.round(100 * InsugarTrading.quantile(bankLevel, iG, buyThresh)) / 100;
			config.goods[iG]['sellThresh'] = Math.round(100 * InsugarTrading.quantile(bankLevel, iG, sellThresh)) / 100;
		}
	}
	
	
	//***********************************
	//    Functionality
	//***********************************
	
	IdleTrading.ReplaceNativeMarket = function() {
		if(!Game.customMinigame['Bank'].tick) Game.customMinigame['Bank'].tick = [];
		Game.customMinigame['Bank'].tick.push(IdleTrading.Logic);
	}
	
	IdleTrading.Logic = function(){
		var modeDecoder = ['stable','slowly rising','slowly falling','rapidly rising','rapidly falling','fluctuating']
		var M = Game.Objects['Bank'].minigame;
		for(var iG = 0; iG < M.goodsById.length; iG++){
			var good = M.goodsById[iG];
			var conf = IdleTrading.config.goods[iG];
			var buyThresh = (conf.buyThresh != -1?conf.buyThresh:IdleTrading.config.commonBuyThreshold);
			var sellThresh = (conf.sellThresh != -1?conf.sellThresh:IdleTrading.config.commonSellThreshold);
			var price = Math.round(100 * M.getGoodPrice(good)) / 100;
			var priceInCookies =  M.getGoodPrice(good) * Game.cookiesPsRawHighest;
			
			if(IdleTrading.config.autoBuy && buyThresh != -1){
				var maxCost = IdleTrading.config.maxCost;
				if(String(IdleTrading.config.maxCostString).includes('%'))
				{
					maxCost = Game.cookies * maxCost;
				}
				var maxStockBuy= maxCost==-1? 100000 : Math.round(maxCost/priceInCookies);

				if(price <= buyThresh && good.stock != M.getGoodMaxStock(good) && maxStockBuy>=1)
                {
					var md = good.mode
					var stock = good.stock
					var is_falling=(md == 2 || md == 4);
					if(M.buyGood(iG, maxStockBuy))
                    {
                        stock = good.stock - stock
                        Game.Notify("Buy stock","Bought "+stock+"x " + good.name + " for " + price + 
						"$ each, at a total cost of " + Beautify(priceInCookies*stock) + " cookies.",
						good.icon, 0);
                    }
					else
					{
						//Game.Notify("Waiting", good.name + " is below buying threshold but seems it will continue falling. Waiting", good.icon, 5);
					}
                }
			}
			if(IdleTrading.config.autoSell && sellThresh != -1){
				if(price >= sellThresh && good.stock != 0)
                {
					var md = good.mode
					var stock = good.stock
					var is_rising = (md == 1 || md == 3);
					if(M.sellGood(iG, 10000))
                    {
                        stock = stock-good.stock
                        Game.Notify("Sell stock","Sold "+stock+"x " + good.name + " for " + price + 
						"$ each at a total revenue of " + Beautify(priceInCookies*stock) + " cookies.",
						good.icon, 0);
                    }
					else
					{
						//Game.Notify("Holding",good.name + " is above selling threshold but seems it will continue rising. Holding" , good.icon, 5);
					}
                }
			}
			
			if(price < conf.minPrice) conf.minPrice = price;
			if(price > conf.maxPrice) conf.maxPrice = price;
		}
	}
	
	
	if(CCSE.ConfirmGameVersion(IdleTrading.name, IdleTrading.version, IdleTrading.GameVersion)) Game.registerMod(IdleTrading.name, IdleTrading); // IdleTrading.init();
}

if(!IdleTrading.isLoaded){
	if(CCSE && CCSE.isLoaded){
		IdleTrading.launch();
	}
	else{
		if(!CCSE) var CCSE = {};
		if(!CCSE.postLoadHooks) CCSE.postLoadHooks = [];
		CCSE.postLoadHooks.push(IdleTrading.launch);
	}
}