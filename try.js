// const IPFS = require('/usr/local/lib/node_modules/ipfs')
const IPFS = require('ipfs')
const { globSource } = IPFS
const fs = require('fs');
const es = require('event-stream');

async function main () {
    const node = await IPFS.create({
        "Addresses": {
            "API": "/ip4/127.0.0.1/tcp/5001",
            "Gateway": "/ip4/127.0.0.1/tcp/8088"
        }
    });
    const version = await node.version();

    // // start the API gateway
    const HttpGateway = require('ipfs-http-gateway').HttpGateway;
    console.log(typeof HttpGateway);
    console.log(HttpGateway);
    const gateway = new HttpGateway(node);
    gateway.start();
    console.log('Version:', version.version);
    // // ...

    // CREATE A DIR
    const dir_path = "try";
    let dir_cid_path = dir_path;
    try {
        const dir_metadata= await (async () => {
            try {
                const stats = await node.files.stat("/" + dir_path);
                return stats;

            } catch (e) {
                console.log("Directory does not exist. Create " + "/" + dir_path);
                // await node.files.mkdir("/" + dir_path);
                // return await node.files.stat("/" + dir_path);
                for await (const dir of await node.addAll([{
                    path: "/" + dir_path
                }])) {
                    return dir;
                }
            }
        })();

        console.log(dir_metadata);

        if ('cid' in dir_metadata) {
            dir_cid_path = dir_metadata.cid.toString();
            console.log(dir_cid_path);
        }

    } finally {}


    // PUT SOME DATA
    const put_data = 'Hello, John'

    try {
        // add your data to to IPFS - this can be a string, a Buffer,
        // a stream of Buffers, etc
        //const results = await node.add(put_data);
        const results = await node.addAll([{
            path: "/" + dir_path + '/hello.txt',
            content: put_data
        }]);

        const content_paths = [];

        for await (const result of results) {

            console.log(await result);
            // {
            //   path: 'QmPV6msVnY1QmuUNZ5KcsDwnxyL193TNr2z2aPU7DQPPrZ',
            //       cid: CID(QmPV6msVnY1QmuUNZ5KcsDwnxyL193TNr2z2aPU7DQPPrZ),
            //     size: 19,
            //     mode: 420,
            //     mtime: undefined
            // }

            // we loop over the results because 'add' supports multiple
            // additions, but we only added one entry here so we only see
            // one log line in the output
            for (const r in result)
                if (result.hasOwnProperty(r) && typeof result[r] !== 'undefined') {
                    // CID (Content Identifier) uniquely addresses the data
                    // and can be used to get it again.
                    // console.log(results[r].toString())
                    // QmPV6msVnY1QmuUNZ5KcsDwnxyL193TNr2z2aPU7DQPPrZ

                    if (r === 'path') {
                        if (result['path'].match(dir_path) !== null && result['path'].replace(dir_path, "") === "") {
                            dir_cid_path = result['cid'].toString();
                            content_paths.forEach((path, i, a) => {
                                a[i] = path.replace(dir_path, dir_cid_path);
                            })
                            content_paths.push(`https://ipfs.io/ipfs/${dir_cid_path}`);

                        } else {
                            content_paths.push(`https://ipfs.io/ipfs/${result['path']}`);
                        }
                    }

                }

        }

        console.log(content_paths);

    } finally {}


    try {
        // GET SOME DATA
        let get_data = ''

        const stream = node.cat('QmPV6msVnY1QmuUNZ5KcsDwnxyL193TNr2z2aPU7DQPPrZ')

        for await (const chunk of stream) {
            // chunks of data are returned as a Buffer, convert it back to a string
            get_data += chunk.toString()
        }

        console.log(get_data);
    } finally {}


    try {

        const single_page_content = [];
        const read_content_promise = new Promise((resolve, reject) => {
            fs.createReadStream('./' + dir_path+ '/index.html')
                .pipe(es.split())
                .pipe(
                    es.mapSync((line) => {
                        // console.log(line);
                        single_page_content.push(line);
                    })
                        .on('error', (err) => console.log(err))
                        .on('end', () => resolve(single_page_content))
                )
        });

        read_content_promise.then(async (content) => {
            console.log(content.join("\n"))

            // add your data to to IPFS - this can be a string, a Buffer,
            // a stream of Buffers, etc
            //const single_page_metadata = await node.add(single_page_content);
            const single_page_metadata = await node
                // .addAll(
                //     globSource('.', dir_path, { recursive: true })
                // );
                .addAll([{
                    path: '/' + dir_path + '/index.html',
                    content: content.join("\n")
                }]);

            console.log(single_page_metadata);

            const content_paths = [];

            for await (const metadata of single_page_metadata) {
                console.log(metadata);

                if ('path' in metadata) {
                    if (metadata['path'].match(dir_path) !== null && metadata['path'].replace(dir_path, "") === "") {
                        dir_cid_path = metadata['cid'].toString();
                        content_paths.forEach((path, i, a) => {
                            a[i] = path.replace(dir_path, dir_cid_path);
                        })
                        content_paths.push(`https://ipfs.io/ipfs/${dir_cid_path}`);

                    } else {
                        content_paths.push(`https://ipfs.io/ipfs/${metadata['path']}`);
                    }
                }
            }

            content_paths.forEach((path) => {
                console.log(`${path}`);
            })
        });
    } finally {}

}

main()
