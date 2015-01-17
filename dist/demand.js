/*! Demand - v1.0.0 - 2015-01-17
* https://github.com/asec/demand
* Copyright (c) 2015 Roland Zsámboki; Licensed MIT */
(function(){

if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] !== 'undefined' ? args[number] : match;
    });
  };
}
var Demand = {

	settings: {

		_settings: {},

		set: function(key, value)
		{
			this._settings[key] = value;
		},

		get: function(key)
		{
			if (typeof this._settings[key] !== "undefined")
			{
				return this._settings[key];
			}

			return null;
		}

	},
	lang: {},
	packages: {},

	init: function()
	{

	},

	registerPackage: function(family, package, subpackage)
	{
		subpackage = subpackage || "default";
		if (!family || !package)
		{
			console.error(this.lang.PACKAGE_ERROR_CANTREGISTER);
			return false;
		}

		if (typeof this.packages[family] === "undefined")
		{
			this.packages[family] = {};
		}
		if (typeof this.packages[family][package] === "undefined")
		{
			this.packages[family][package] = {};
		}
		if (typeof this.packages[family][package][subpackage] === "undefined")
		{
			this.packages[family][package][subpackage] = {};
		}

		this.packages[family][package][subpackage].loaded = false;
		this.packages[family][package][subpackage].queue = new Demand.Queue();
	},

	execute: function(demandString, functionToCall)
	{
		functionToCall = functionToCall;
		var result = this.parseMarker(demandString);

		var realPackageName = result.packageName;
		var pack = result.pack;
		var type = (typeof functionToCall).toLowerCase();
		if (type !== "function" && type !== "undefined")
		{
			console.error(this.lang.EXEC_ERROR_NOTFUNCTION);
			return false;
		}
		if (type === "function")
		{
			pack.queue.add(functionToCall);
		}
		if (pack.loaded)
		{
			pack.queue.execute();
		}
		else
		{
			// Load the package if it is not yet loaded
			var url = this.assembleUrl(realPackageName);
			var script = document.createElement("script");
			script.type = "text/javascript";
			script.src = url;
			script.async = true;
			document.getElementsByTagName("head")[0].appendChild(script);
		}
	},

	loaded: function(demandString)
	{
		var result = this.parseMarker(demandString);
		if (!result)
		{
			return false;
		}

		var pack = result.pack;
		if (pack.loaded)
		{
			return true;
		}

		console.log(this.lang.DOWNLOAD_SUCCESS.format(result.packageName));
		pack.loaded = true;
		demand(result.packageName);
	},

	parseMarker: function(demandString)
	{
		var split = demandString.split(".");
		if (!split[0] || !split[1])
		{
			console.error(this.lang.PACKAGE_ERROR_CANTPARSENAME);
			return false;
		}
		var result = {
			family: split[0],
			package: split[1],
			subpackage: split[2] || "default"
		};

		if (
			typeof this.packages[result.family] === "undefined" ||
			typeof this.packages[result.family][result.package] === "undefined" ||
			typeof this.packages[result.family][result.package][result.subpackage] === "undefined"
		)
		{
			console.error(this.lang.PACKAGE_ERROR_NOTFOUND.format(result.family + "." + result.package + (result.subpackage !== "default" ? "." + result.subpackage : "")));
			return false;
		}

		result.pack = this.packages[result.family][result.package][result.subpackage];
		result.packageName = result.family + "." + result.package + "." + result.subpackage;

		return result;
	},

	assembleUrl: function(fileName)
	{
		var cdn = this.settings.get("cdnUrl");
		var url = cdn + fileName + ".js";

		return url;
	}

};

Demand.init();
Demand.Queue = function()
{

	this._queue = [];

};

Demand.Queue.prototype.add = function(fnc)
{
	var type = (typeof fnc).toLowerCase();
	if (type !== "function")
	{
		console.error(this.lang.EXEC_ERROR_NOTFUNCTION);
		return false;
	}

	this._queue.push(fnc);
	return true;
};

Demand.Queue.prototype.executeNext = function()
{
	if (!this._queue.length)
	{
		return false;
	}
	var fnc = this._queue.shift();
	fnc.call(window);
};

Demand.Queue.prototype.execute = function()
{
	while (this._queue.length)
	{
		this.executeNext();
	}
};
Demand.lang = {

	PACKAGE_ERROR_CANTREGISTER: "You can't register a demand package without it's family and package name!",
	PACKAGE_ERROR_CANTPARSENAME: "In order to demand a package you need to address it in the following format: family.package[.subpackage]",
	PACKAGE_ERROR_NOTFOUND: "The package could not be found: {0}",
	EXEC_ERROR_NOTFUNCTION: "You can only execute functions on demand.",
	DOWNLOAD_SUCCESS: "Demanded package successfully loaded: {0}"
};

	// Settings
	Demand.settings.set("cdnUrl", "http://localhost/demand/dist/packages/");

	// Registering the available packages
	Demand.registerPackage("jquery", "latest");

	var d = function(demandString, functionToCall)
	{
		var demand = this.demand.demandObject;

		return demand.execute(demandString, functionToCall);
	};

	d.demandObject = Demand;
	// This is our only global variable
	demand = d;

})();