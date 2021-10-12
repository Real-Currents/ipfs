const IPFS = require('ipfs')
// const IPFS = require('/usr/local/lib/node_modules/ipfs')

async function main () {
  const node = await IPFS.create({
    "Addresses": {
      "API": "/ip4/127.0.0.1/tcp/5001",
      "Gateway": "/ip4/127.0.0.1/tcp/8088"
    }
  });
  const version = await node.version()

  // // start the API gateway
  const HttpGateway = require('ipfs-http-gateway').HttpGateway;
  console.log(typeof HttpGateway);
  console.log(HttpGateway);
  const gateway = new HttpGateway(node);
  gateway.start();
  console.log('Version:', version.version)
  // // ...


}

main()
