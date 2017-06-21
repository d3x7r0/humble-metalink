(function () {

    function getTarget() {
        let $target = document.getElementById('humble-metalink-target');

        if ($target) {
            return $target;
        }

        $target = document.createElement('textarea');

        $target.id = "humble-metalink-target";
        $target.style.position = 'fixed';
        $target.style.top = 0;
        $target.style.left = 0;
        $target.style.zIndex = 9999;

        document.body.appendChild($target);

        return $target;
    }

    function waitForElement(selector, time) {
        return new Promise((resolve, reject) => {

            let start = Date.now();
            let timer;

            let fn = function () {
                clearTimeout(timer);

                let res = document.querySelectorAll(selector);

                if (res.length === 0) {
                    let elapsed = Date.now() - start;

                    if (elapsed > time) {
                        reject("Timed out waiting for element");
                    } else {
                        // keep waiting
                        timer = setTimeout(fn, 300)
                    }
                } else {
                    // Found!
                    resolve(res);
                }
            };

            fn();
        });
    }

    function process($el) {
        let $target = getTarget();

        $target.innerHTML = convertToXML(
            processEntries($el[0])
        );
    }

    function convertToXML(entries) {
        return `<?xml version="1.0" encoding="UTF-8"?>
 <metalink xmlns="urn:ietf:params:xml:ns:metalink">
 ${entries.map(entryToXML).join("\n")}
 </metalink>`
    }

    function processEntries($el) {
        return arrayQuerySelectorAll($el, '[data-human-name]')
            .map(parseEntry)
            .reduce((memo, entry) => memo.concat(entry || []), []);
    }

    function parseEntry($entry) {
        const title = $entry.dataset['humanName'];

        return arrayQuerySelectorAll($entry, '[data-download]')
            .map(parseDownload)
            .map(entry => {
                entry.identity = `${title} (${entry.identity})`;

                return entry;
            });
    }

    function entryToXML(data) {
        return `<file name="${data.filename}">
    <identity><![CDATA[${data.identity}]]></identity>
    <url priority="1"><![CDATA[${data.http}]]></url>
    <metaurl mediatype="torrent" priority="2"><![CDATA[${data.bt}]]></metalink>
    <hash type="${data.hash.type}">${data.hash.value}</hash>
</file>`
    }

    function parseDownload($download) {
        let data = {};

        data.hash = {
            type: "md5",
            value: $download.dataset['md5']
        };

        data.http = $download.querySelector("[data-web]").dataset['web'];
        data.bt = $download.querySelector("[data-bt]").dataset['bt'];

        data.filename = parseFilename(data.http);
        data.identity = $download.querySelector('.js-start-download .label').innerHTML;

        return data;
    }

    const $parser = document.createElement('a');

    function parseFilename(uri) {
        $parser.href = uri;

        return $parser.pathname.split('/').pop();
    }

    function arrayQuerySelectorAll($el, selector) {
        let res = $el.querySelectorAll(selector);

        return Array.prototype.slice.call(res);
    }

    waitForElement('.js-all-downloads-holder', 15000).then(
        process,
        console.debug.bind(console)
    );
})();
