const fs = require("fs");
const INDIR = "../_posts_in";
const OUTDIR = "../_posts";

const pattern = /\[caption.*\]\[\!\[.*\]\(https?:\/\/\d+.\d+.\d+.\d+\/~huetrico(\S+)\s?(.*)?\)\].*\(.*\)(.*)?\[\/caption\]/g;

const files = fs.readdirSync(INDIR);
for (const file of files) {
    const content = fs.readFileSync(INDIR + "/" + file).toString("utf-8");
    const replaced = content.replace(pattern, "![$2$3]({{site.baseurl}}$1)");
    fs.writeFileSync(OUTDIR + "/" + file, replaced);
    console.log("Proccessed " + file);
}
