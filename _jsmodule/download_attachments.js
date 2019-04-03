const matter = require("gray-matter");
const fs = require("fs");
const fetch = require("node-fetch");
const scraper = require("cloudscraper");

const DIR = "../_attachments/";
const OUT_DIR = "../wp-content/uploads-v2/";
const ORIGINAL_URL = "https://huetri.com/wp-content/uploads/";

if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR);
}

const files = fs.readdirSync(DIR);
function wait(t) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, t);
    });
}
function createPath(paths) {
    path = OUT_DIR.replace(/[\/\\]$/, "");
    for (const cur of paths) {
        path += "/" + cur;
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
            console.log("Create " + path);
        }
    }
}
function getImg(src) {
    return new Promise(resolve => {
        scraper.get(src, (err, response, body) => {
            resolve(body);
        });
    });
}

(async () => {
    for (const file of files) {
        const {
            data: {
                meta: { _wp_attached_file }
            }
        } = matter(fs.readFileSync(DIR + file));

        const paths = _wp_attached_file
            .replace(/[\/\\]$/, "")
            .split("/")
            .slice(0, -1);
        await createPath(paths);

        console.log("Download " + ORIGINAL_URL + _wp_attached_file);
        const res = await fetch(ORIGINAL_URL + _wp_attached_file, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36",
                Accept:
                    "application/xml,application/xhtml+xml,text/html;q=0.9, text/plain;q=0.8,image/png,*/*;q=0.5"
            }
        });
        const buffer = await res.buffer();

        // const buffer = await getImg(ORIGINAL_URL + _wp_attached_file);

        fs.writeFileSync(OUT_DIR + _wp_attached_file, buffer);
        await wait(200);
    }
})();
