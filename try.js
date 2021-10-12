const IPFS = require('ipfs')
// const IPFS = require('/usr/local/lib/node_modules/ipfs')

async function main () {
  const node = await IPFS.create({
    "Addresses": {
      "API": "/ip4/127.0.0.1/tcp/5001",
      "Gateway": "/ip4/127.0.0.1/tcp/8088"
    }
  });
  const version = await node.version();

  // PUT SOME DATA
  const put_data = 'Hello, John'

  // add your data to to IPFS - this can be a string, a Buffer,
  // a stream of Buffers, etc
  const results = await node.add(put_data);

  console.log(results);
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
  for (const r in results)
    if (results.hasOwnProperty(r) && typeof results[r] !== 'undefined') {
      // CID (Content IDentifier) uniquely addresses the data
      // and can be used to get it again.
      // console.log(results[r].toString())
      // QmPV6msVnY1QmuUNZ5KcsDwnxyL193TNr2z2aPU7DQPPrZ
      // QmPV6msVnY1QmuUNZ5KcsDwnxyL193TNr2z2aPU7DQPPrZ
      // 19
      // 420
      // function

    }

  // // start the API gateway
  const HttpGateway = require('ipfs-http-gateway').HttpGateway;
  console.log(typeof HttpGateway);
  console.log(HttpGateway);
  const gateway = new HttpGateway(node);
  gateway.start();
  console.log('Version:', version.version);
  // // ...

  // GET SOME DATA
  let get_data = ''

  const stream = node.cat('QmPV6msVnY1QmuUNZ5KcsDwnxyL193TNr2z2aPU7DQPPrZ')

  for await (const chunk of stream) {
    // chunks of data are returned as a Buffer, convert it back to a string
    get_data += chunk.toString()
  }

  console.log(get_data)

}

main()
