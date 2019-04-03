const parser = require("xml2json");
const matter = require("gray-matter");
const fs = require("fs");
const yaml = require("js-yaml");

const OUTFILE = __dirname + "/../_data/attachments.json"; 

const xmlData = fs.readFileSync(__dirname + "/wordpress.xml").toString("utf-8");
const jsonData = JSON.parse(parser.toJson(xmlData));

const attachments = jsonData.rss.channel.item.filter(post=> {
    return post["wp:post_type"] == "attachment";
});

const info_map = attachments.reduce((infos, attach) => {
    const id = +attach["wp:post_id"];
    const description = attach["excerpt:encoded"];
    const url = attach["wp:attachment_url"].replace(/https?\:\/\/huetri\.com/g, '');
    const title = attach["title"];
    return {...infos, 
        [id]: {url, description, title},
    };
}, {});

fs.writeFileSync(OUTFILE, JSON.stringify(info_map));

