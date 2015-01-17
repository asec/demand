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