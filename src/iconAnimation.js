export class IconAnimation {
    constructor() { }

    listenGithubPage() {
        const currentBrowser = (chrome) ? chrome : browser;
        currentBrowser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status == 'complete' && tab.url.startsWith('https://github.com')) {
                this.animateIcon();
            }
        });
    }

    animateIcon() {
        const min = 0;
        const max = 270;
        let current = min;
        const rotateIntervalId = window.setInterval(() => {
            current += 90;
            if (current > max) {
                current = min;
            };
            this._updateIcon('./assets/images/icon-' + current + '.png');
        }, 35);

        const currentBrowser = (chrome) ? chrome : browser;
        currentBrowser.browserAction.setBadgeText ({ text: '+' });
        window.setTimeout(() => {
            currentBrowser.browserAction.setBadgeText({ text: '' });
            window.clearInterval(rotateIntervalId);
            currentBrowser.browserAction.setIcon({path: './assets/images/icon.png'})
        }, 2000);
    }

    _updateIcon(iconPath) {
        const currentBrowser = (chrome) ? chrome : browser;
        currentBrowser.browserAction.setIcon({ path: iconPath });
    }
}

const iconAnimation = new IconAnimation();
iconAnimation.listenGithubPage();




