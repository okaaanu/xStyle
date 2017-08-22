function getCodeUrl() {
	return getMeta("xstyle-code") || getMeta("stylish-code-chrome");
}
function getMd5Url() {
	return getMeta("xstyle-md5-url") || getMeta("stylish-md5-url");
}
function getIdUrl() {
	return getMeta("xstyle-id-url") || getMeta("stylish-id-url");
}

if (typeof(getParams) !== 'function') {
	function getParams() {
		var params = {};
		var urlParts = location.href.split("?", 2);
		if (urlParts.length == 1) {
			return params;
		}
		urlParts[1].split("&").forEach((keyValue) => {
			var splitKeyValue = keyValue.split("=", 2);
			params[decodeURIComponent(splitKeyValue[0])] = decodeURIComponent(splitKeyValue[1]);
		});
		return params;
	}
}

function sectionsAreEqual(a, b) {
	if (a.code != b.code) {
		return false;
	}
	return ["urls", "urlPrefixes", "domains", "regexps"].every((attribute) => {
		return arraysAreEqual(a[attribute], b[attribute]);
	});
}

function arraysAreEqual(a, b) {
	// treat empty array and undefined as equivalent
	if (typeof a == "undefined")
		return (typeof b == "undefined") || (b.length == 0);
	if (typeof b == "undefined")
		return (typeof a == "undefined") || (a.length == 0);
	if (a.length != b.length) {
		return false;
	}
	return a.every((entry) => {
		return b.indexOf(entry) !== -1;
	});
}

function sendEvent(type, data) {
	if (typeof data == "undefined") {
		data = null;
	}
	var newEvent = new CustomEvent(type, {detail: data});
	document.dispatchEvent(newEvent);
}

function styleInstall () {
	var styleName = getMeta('xstyle-name');
	if (confirm(browser.i18n.getMessage('styleInstall', [styleName]))) {
		getResource(getCodeUrl(), (code) => {
			styleInstallByCode(JSON.parse(code));
		});
	}
}
function styleInstallByCode(json) {
	//Check whether the style has been installed
	browser.runtime.sendMessage({method: "getStyles", url: json.url || getIdUrl() || location.href}).then((response) => {
		json.method = "saveStyle";
		if (response.length != 0) {
			json.id = response[0].id;
			delete json.name;
		}
		if (typeof(json.advanced) === 'undefined') {
			json.advanced = {"select": {}, "radio": {}, "text": {}, "saved": {}, "css": ''};
		}
		browser.runtime.sendMessage(json).then((response) => {
			sendEvent("styleInstalled");
		});
	});
}
document.addEventListener("xstyleInstall", styleInstall, false);

// For open page
if (window.location.href.indexOf('https://ext.firefoxcn.net/xstyle/install/open.html') === 0) {
	var params = getParams();
	if (params.code) {
		getURL(params.code).then((code) => {
			var json = JSON.parse(code);
			if (confirm(browser.i18n.getMessage('styleInstall', [json.name]))) {
				styleInstallByCode(json);
			}
		});
	}
}

function getMeta(name) {
	var e = document.querySelector("link[rel='" + name + "']");
	return e ? e.getAttribute("href") : null;
}
