# Demand

A JavaScript solution for creating your own CDN for all of your JS code. More info and demos can be found on the project website at [http://asec.github.io/demand/](http://asec.github.io/demand/)

## Download
You can start experimenting with __demand__ right away by including either of these files into you website with a `script` tag:
* [Normal version](http://asec.github.io/demand/demo/demand.js)
* [Minified version](http://asec.github.io/demand/demo/demand.min.js)

## How to build it
If you want to build a version of the project for yourself, you need to install [Node.js](http://nodejs.org/download/) first. The second step is to grab ```Grunt``` if you don't have it already:
```
npm install -g grunt-cli
```
After this you should be able to build the project with one simple command:
```
grunt
```
You can use the `debug` target if you'd like to see some informative debug messages:
```
grunt debug
```
The biggest feature of the project is - of course - that it lets you build your own packages. You can make such build by going:
```
grunt package -p=X
```
Where _X_ is the standard name of your package. You can find more information on how to create packages later in the document.

## How to use it
There are multiple ways to use this project. Ideally you'd want to grab the contents of the `/dist/` directory after you've build the project __as well as__ all of the packages and upload them to a fast and reliable server (which is meant to serve the actual requests). After this you could tell `demand` where to look for the package files by setting the `cdnUrl` variable like this:
```
demand("set", "cdnUrl", "http://yourdomain.com/demand/packages/");
```
Alternatively you could modify `line 13` in `/src/demand.js` and specify your `cdnUrl` there:
```
Demand.settings.set("cdnUrl", "http://yourdomain.com/demand/packages/");
```
Once that is done you just have to include the main `demand.js` file in your website and you can start using your awesome packages at once.

For more information on how you can go about using your project straight from GitHub consult the project website.

### Basic usage
Let's suppose you want to use the demo supplied by me. After including the build you wish to use (presumably the minified version) you can add Bootstrap support to your page instantaneously:
```
demand("bootstrap.3");
```
This will add all of the required JS and CSS files to the `head` section of the current document, enabling you to use pretty much anything from that framework. This sadly excludes the Glyphicons due to them being considered cross-origin. This little problem can be easly avoided by using the localization process.

Please note that the first (and in this case only) parameter of the `demand` function is the name of the package. This name always consists of 2 or 3 lowercase alphanumeric parts joined by dots:
  1. The first part is the name of the library to which the demanded package belongs. In the example above this was: `bootstrap`
  2. The second part is the name of the exact package you wish to use. A library usually contains one or more packages. In the example above this was: `3` (the main version of the Bootstrap library being used).
  __These two parts must always be present.__
  3. The third part is optional name of the subpackage. You usually want to organize your more complex packages into multiple modular subpackages so you can better specify the exact functionality you want to use. This value defaults to `default` if omitted.

The _standard name_ of a given package is the one that contains all 3 parts. If the name given is not the same as the standard name of the package it will be suffixed with `.default` by the code, thus forming a correct standard name. Of course you can use the standard name in your call as well:
```
demand("bootstrap.3.default");
```
However, this is not encouraged so feel free to be lazy :)

It is also worth noting that in order to use a package you need to register it (and it's depencies, if any) in your `/src/demand.js` file. More on that later.

### Callbacks
In a real life scenario you would often use `demand` to execute code __after__ it's dependencies are loaded. Take jQuery as an example: You would include the JS file in your website, and after that you could do some crazy stuff like this:
```
jQuery(document).on("ready", function(){
	jQuery("body").html('<p>Nothing to see here, please move along.</p>');
});
```
This however, doesn't work if you load your jQuery file asynchronously. The reason for this is that the code in which you are using jQuery can precede the actual jQuery file in execution, resulting in a nasty error. You can easily avoid this with `demand` by using a nice callback:
```
demand("jquery.latest", function(){
	jQuery(document).on("ready", function(){
		jQuery("body").html('<p>Nothing to see here, please move along.</p>');
	});
});
```
You can also demand the package multiple times and specify a different callback each time. These callbacks are queued and they will only be executed after the package was loaded. They will be executed one at a time in the same order you referenced them.