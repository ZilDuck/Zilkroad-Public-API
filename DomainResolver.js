const ZILLIQA_API = "https://api.zilliqa.com/";
const UD_REGISTRY_CONTRACT_ADDRESS = "9611c53BE6d1b32058b2747bdeCECed7e1216793";
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const sha256 = require('js-sha256');

const logger = require('./logger.js')

function namehash(name) {
  const hashArray = hash(name);
  return arrayToHex(hashArray);
}

function hash(name) {

  if (!name) {
      return new Uint8Array(32);
  }
  const [label, ...remainder] = name.split('.');
  const labelHash = sha256.array(label);
  const remainderHash = hash(remainder.join('.'));
  return sha256.array(new Uint8Array([...remainderHash, ...labelHash]));
}

function arrayToHex(arr) {
  return '0x' + Array.prototype.map.call(arr, x => ('00' + x.toString(16)).slice(-2)).join('');
}

async function fetchZilliqa(params) {
  const body = {
    method: "GetSmartContractSubState",
    id: "1",
    jsonrpc: "2.0",
    params
  };

  return await fetch(ZILLIQA_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body),
  }).then(res => res.json());
}

function displayError(message, cleanDom) {
    logger.debugLog(message)
  return ;
}

function displayResolution(resolution) {
  const {
    ownerAddress,
    resolverAddress,
    records
  } = resolution;

  logger.debugLog(`ownerAddress: ${ownerAddress}`);
  logger.debugLog(`resolverAddress: ${resolverAddress}`);

  Object.entries(records).map(([key, value]) => {
    logger.debugLog(`${key} : ${value}`);
  });
}

async function ResolveZilDomain(userInput) {
  if (!userInput.endsWith(".zil")) {
    return {'error' : 'domain not registered'};
  }

  const token = namehash(userInput);
  const registryState =
    await fetchZilliqa([UD_REGISTRY_CONTRACT_ADDRESS, "records", [token]]);

  if (registryState.result == null) {
    return {'error' : 'domain not registered'};
  }

  const [ownerAddress, resolverAddress] = 
    registryState.result?.records[token].arguments;
  
  if (resolverAddress === "0x0000000000000000000000000000000000000000") {
    return {'error' : 'resolver not configured'};
  }

  const recordResponse = await fetchZilliqa([
    resolverAddress.replace("0x", ""),
    "records",
    []
  ]);

  data = {
    ownerAddress,
    resolverAddress,
    records: recordResponse.result?.records
  };
  logger.debugLog(data)
  return data;

}

module.exports = {ResolveZilDomain}