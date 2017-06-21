/*
 Returns true only if the URL's protocol is in APPLICABLE_PROTOCOLS.
 */
const APPLICABLE_URL_PREFIX = "https://www.humblebundle.com/downloads?key=";

function isSupported(url) {
    url = "" + url;

    return url.indexOf(APPLICABLE_URL_PREFIX) === 0;
}

/*
 Initialize the page action: set icon and title, then show.
 Only operates on tabs whose URL is applicable.
 */
function initializePageAction(tab) {
    if (isSupported(tab.url)) {
        browser.pageAction.setIcon({tabId: tab.id, path: "icons/icon_down.png"});
        browser.pageAction.setTitle({tabId: tab.id, title: "Humble Metalink"});
        browser.pageAction.show(tab.id);
    } else {
        browser.pageAction.hide(tab.id);
    }
}

/*
 When first loaded, initialize the page action for all tabs.
 */
let gettingAllTabs = browser.tabs.query({});

gettingAllTabs.then((tabs) => {
    for (tab of tabs) {
        initializePageAction(tab);
    }
});

/*
 Each time a tab is updated, reset the page action for that tab.
 */
browser.tabs.onUpdated.addListener((id, changeInfo, tab) => {
    initializePageAction(tab);
});

/*
 Run the script when the page action is clicked.
 */
browser.pageAction.onClicked.addListener(function (tab) {
    browser.tabs.executeScript(tab.id, {
        file: 'scraper.js'
    });
});