const fs = require("fs");
const axios = require('axios');
const dayjs = require('dayjs')
dayjs.extend(require('dayjs/plugin/timezone'))
dayjs.extend(require('dayjs/plugin/utc'))
dayjs.tz.setDefault('Asia/Tokyo');

function fileDownload(slackFileInfo, file) {
    const dir = file.replace(`.json`, ``);
    fs.mkdir(`./results/${dir}`, (err) => {
        if (err) { throw err; }
        console.log(`${dir}ディレクトリが作成されました`);
    });
    slackFileInfo.forEach(async info => {
        if (info.url_private_download != undefined) {
            const res = await axios.get(info.url_private_download, { responseType: 'arraybuffer' });
            fs.writeFileSync(`./results/${dir}/${dayjs.unix(info.timestamp).format("YYYY-MM-DD HH:mm:ss")}_${info.name}`, new Buffer.from(res.data), 'binary');
            console.log(`${info.name} done`);
        } else {
            console.log(`${info.name} is undefined.`)
        }
    });
};

fs.readdir('./slack/', (err, files) => {
    files.forEach(file => {
        if (file.includes(`.json`)) {
            let slackLogs = JSON.parse(fs.readFileSync(`./slack/${file}`, 'utf8'));
            let slackFiles = slackLogs.map(elm => elm.files).filter(elm => elm != undefined);
            let slackFileInfo = [];
            slackFiles.forEach(infoArray => {
                infoArray.forEach(elm => {
                    slackFileInfo.push(elm);
                })
            })
            if (slackFileInfo.length > 0) {
                fileDownload(slackFileInfo, file);
            }
        }
    });
});


