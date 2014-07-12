/// <reference path="index.ts" />
/**
	Namespace for All AlienTube operations.
	@namespace AlienTube
*/
module AlienTube {
	/**
		Manages the Preferences across browsers.
		@class BrowserPreferenceManager
	*/
	export class BrowserPreferenceManager {
        private preferences : Object;
        private evt;

		private defaults = {
			hiddenPostScoreThreshold: -4,
			hiddenCommentScoreThreshold: -4,
			showGooglePlus: false,
			rememberTabsOnViewChange: true,
			userIdentifier: ""
		}

        constructor() {
            switch (Main.getCurrentBrowser()) {
                case Browser.CHROME:
                    chrome.storage.sync.get(null, (settings) => {
						this.preferences = settings;
                    });
                    break;

                case Browser.FIREFOX:
                    self.on("message", (msg) => {
                        this.preferences = msg.preferences.prefs;
                    });
                    break;

                case Browser.SAFARI:
                    var uuid = Main.generateUUID();
                    safari.self.addEventListener('message', (event) => {
                        if (event.name == uuid) {
                            var safariPref = JSON.parse(event.message);
                            this.preferences = safariPref;
                        }
                    }, false);
                    safari.self.tab.dispatchMessage(uuid, {
                        type: 'settings'
                    });
                    break;
            }
        }


        get(key : string):any {
            return this.preferences[key] || this.defaults[key];
        }

        set(key : string, value : any):void {
            this.preferences[key] = value;
            switch (Main.getCurrentBrowser()) {
                case Browser.CHROME:
                    chrome.storage.sync.set({
                        key: value
                    });
                    break;

                case Browser.FIREFOX:
                    self.postMessage({
                        type: 'setSettingsValue',
                        key: key,
                        value: value
                    });
                    break;

                case Browser.SAFARI:
                    safari.self.tab.dispatchMessage(null, {
                        type: 'setSettingsValue',
                        key: key,
                        value: value
                    });
                    break;
            }
        }
    }
}
