const parser = require("xml2json");
const matter = require("gray-matter");
const fs = require("fs");
const slugify = require("slugify");
const yaml = require("js-yaml");
const TurndownService = require("turndown");
const turndownService = new TurndownService();
const execSync = require('child_process').execSync;

const attachmentsMap = {};

const OUTDIR_DRAFT = __dirname + "/_drafts";
const OUTDIR = __dirname + "/_posts";
const regexCaptionFind = /\\\[caption.*id\=['"]attachment\\_(\d+)['"].*\\\](?:.*)\\\[\/caption\\\]/g;
const regexCaptionMatch = /\\\[caption.*id\=['"]attachment\\_(\d+)['"].*\\\](?:.*)\\\[\/caption\\\]/;

// reset
// fs.rmdirSync(OUTDIR);
execSync('rm -r ' + OUTDIR);
fs.mkdirSync(OUTDIR);

// fs.rmdirSync(OUTDIR_DRAFT);
execSync('rm -r ' + OUTDIR_DRAFT);
fs.mkdirSync(OUTDIR_DRAFT);


const xmlData = fs.readFileSync(__dirname + "/wordpress.xml").toString("utf-8");
const jsonData = JSON.parse(parser.toJson(xmlData));
const posts = jsonData.rss.channel.item.filter(post => {
    return post["wp:post_type"] == "post";
});
const attachments = jsonData.rss.channel.item.filter(post=> {
    return post["wp:post_type"] == "attachment";
});

function removeWp(obj) {
    for (const key in obj) {
        let newKey = key;
        if (key.slice(0, 3) === "wp:") {
            // console.log(key);
            newKey = key.slice(3);
            obj[newKey] = obj[key];
            delete obj[key];
        }
        if (typeof obj[newKey] === "object") {
            removeWp(obj[newKey]);
        }
    }
}

for (const attachment of attachments) {
    const id = attachment["wp:post_id"];
    if (id) attachmentsMap[id] = attachment['wp:attachment_url'];
}

for (const post of posts) {
    let body = turndownService.turndown(post["content:encoded"]);
    const post_id = +post["wp:post_id"];
    const post_date = new Date(post['wp:post_date_gmt'] || post['wp:post_date']);

    const thumbnail_id = getThumbnailId(post);
    let thumbnail_url = thumbnail_id ? (attachmentsMap[thumbnail_id] || '') : '';
    thumbnail_url = thumbnail_url.replace(/https?:\/\/huetri\.com\//, '/');

    const categories = getCategory(post);
    const tags = getTags(post);
    const isPublish = post['wp:status'] === 'publish';
    
    const filename = isPublish 
        ? `${OUTDIR}/${formatDate(post_date)}-${getName(post)}.md`
        : `${OUTDIR_DRAFT}/${getName(post)}.md`

    const attachsInBody = body.match(regexCaptionFind);
    if (attachsInBody) {
        for (const attach of attachsInBody) {
            const match = attach.match(regexCaptionMatch);
            if (match) {
                const attach_url = attachmentsMap[match[1]];
                body = body.replace(match[0], `![](${attach_url})`);
            }
        }
    }

    const meta = {
        ...post,
        id: post_id,
        ["wp:post_id"]: undefined,

        thumbnail_url,
        
        categories,
        tags,
        category: undefined,

        date: post_date.toUTCString(),
        ["content:encoded"]: undefined,
        ["excerpt:encoded"]: undefined,
        ["wp:post_date"]: undefined,
        ["wp:comment"]: undefined,

        layout: 'post',
    };
    removeWp(meta);

    const content = [
        "---",
        yaml.safeDump(meta, { skipInvalid: true }),
        "---",
        body
    ].join("\n");

    console.log("Write " + filename + ' ' + (thumbnail_id ? '(have thumb)' : ''));
    fs.writeFileSync(filename, content);
}

/**
 * 
 * @param {Date} date 
 */
function formatDate(date) {
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    
    day = day > 9 ? day : '0' + day;
    month = month > 9 ? month : '0' + month;

    return `${year}-${month}-${day}`;
}

function getThumbnailId(post)
{
    const metaInfo = post["wp:postmeta"];
    if (!metaInfo)
        return -1;

    const thumb_info = metaInfo.find((val)=>{
        return val['wp:meta_key'] == '_thumbnail_id';
    });
    return thumb_info ? +thumb_info['wp:meta_value'] : -1;
}

function getCategory(post) {
    let cateInfo = post["category"];
    if (!cateInfo) return [];

    if (cateInfo['domain']) {
        cateInfo = [cateInfo];
    }

    const filterd = cateInfo
                    .filter(val=>val['domain'] == 'category')
                    .map(val=>val['$t']);
    return filterd;
}

function getTags(post) {
    let cateInfo = post["category"];
    if (!cateInfo) return [];

    if (cateInfo['domain']) {
        cateInfo = [cateInfo];
    }

    const filterd = cateInfo
                    .filter(val=>val['domain'] == 'post_tag')
                    .map(val=>val['$t']);
    return filterd;
}

function getName(post) {
    return (typeof post['wp:post_name'] === 'string' && !!post['wp:post_name']) 
        ? post['wp:post_name'] 
        : slugify(post['title']);
}