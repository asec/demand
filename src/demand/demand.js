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
	dependencies: {},

	init: function()
	{

	},

	registerPackage: function(family, package, subpackage, dependencies)
	{
		if (subpackage && Object.prototype.toString.call(subpackage) === "[object Array]")
		{
			dependencies = subpackage;
			subpackage = null;
		}
		dependencies = dependencies || [];
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
		this.packages[family][package][subpackage].loading = false;
		this.packages[family][package][subpackage].queue = new Demand.Queue();
		this.packages[family][package][subpackage].waiting = [];

		// Registering the given dependencies as well:
		var depUri, depType;
		var fullPackageName = family + "." + package + "." + subpackage;
		this.dependencies[fullPackageName] = [];
		for (var i = 0; i < dependencies.length; i++)
		{
			depType = dependencies[i].css ? "css" : "demand";
			depUri = dependencies[i].css ? dependencies[i].css : dependencies[i].demand;
			if (depType === "demand" && depUri === fullPackageName)
			{
				console.warn(this.lang.PACKAGE_ERROR_CANTBESELFDEP);
				continue;
			}
			this.addDependency(fullPackageName, depType, depUri);
		}
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
			// Loading dependencies:
			var hasDemandPrerequisit = false;
			for (var i = 0; i < this.dependencies[realPackageName].length; i++)
			{
				var dep = this.dependencies[realPackageName][i];
				// It it's only a CSS file, queue it
				if (dep.type === "css")
				{
					if (!pack.loading)
					{
						this.loadCss(dep.uri, realPackageName);
					}
					continue;
				}
				if (dep.type === "demand")
				{
					var depPack = this.parseMarker(dep.uri);
					if (depPack && !depPack.pack.loaded && !depPack.pack.loading)
					{
						hasDemandPrerequisit = true;
						pack.waiting.push(depPack.packageName);
						demand(dep.uri);
					}
					continue;
				}
			}

			// Load the package if it is not yet loaded
			if (!hasDemandPrerequisit && !pack.loading)
			{
				this.loadJs(realPackageName);
			}
			pack.loading = true;
		}
	},

	loadCss: function(uri, packageName)
	{
		var url = this.assembleUrl(uri, true, packageName);
		var css = document.createElement("link");
		css.rel = "stylesheet";
		css.type = "text/css";
		css.href = url;
		document.getElementsByTagName("head")[0].appendChild(css);
	},

	loadJs: function(uri, packageName)
	{
		var url = this.assembleUrl(uri, packageName ? true : false, packageName);
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.src = url;
		script.async = true;
		document.getElementsByTagName("head")[0].appendChild(script);
	},

	loaded: function(demandString)
	{
		var result = this.parseMarker(demandString);
		if (!result)
		{
			return false;
		}

		var pack = result.pack;
		pack.loading = false;
		if (pack.loaded)
		{
			return true;
		}

		console.log(this.lang.DOWNLOAD_SUCCESS.format(result.packageName));
		pack.loaded = true;

		// Execute the functions which are waiting for this:
		demand(result.packageName);

		// Search for the other packages which are waiting for this one:
		for (var i in this.dependencies)
		{
			if (i === result.packageName)
			{
				continue;
			}
			var depPack = this.parseMarker(i);
			var foundAsDependency = depPack.pack.waiting.indexOf(result.packageName);
			if (foundAsDependency > -1)
			{
				// Remove this package from the waiting line
				depPack.pack.waiting.splice(foundAsDependency, 1);
				// If this was the last package on the waiting line, we can execute the waiting package
				if (!depPack.pack.waiting.length)
				{
					this.loadJs(i);
					//demand(i);
				}
			}
		}
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

	assembleUrl: function(fileName, specialFile, packageName)
	{
		specialFile = !!specialFile;
		var cdn = this.settings.get("cdnUrl");
		var url;
		if (!specialFile || !packageName)
		{
			url = cdn + fileName + ".js";
		}
		else
		{
			url = cdn + packageName + "/" + fileName;
		}

		return url;
	},

	addDependency: function(demandString, type, uri)
	{
		var ds = this.parseMarker(demandString);
		var packageName = ds.packageName;
		if (typeof this.dependencies[packageName] === "undefined")
		{
			this.dependencies[packageName] = [];
		}
		this.dependencies[packageName].push({
			type: type,
			uri: uri
		});

		return true;
	}

};

Demand.init();