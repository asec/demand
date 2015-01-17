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