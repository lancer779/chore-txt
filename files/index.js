const express = require("express");
const app = express();
const { exec, execSync } = require('child_process');
const port = process.env.SERVER_PORT || process.env.PORT || 5009;
const UUID = process.env.UUID || '1fea01a2-e355-4ed9-8170-367bc9f3e7ab';
const JINZHA_WSPATH = process.env.JINZHA_WSPATH || '';
const JINZHA_PORT = process.env.JINZHA_PORT || '';
const JINZHA_KEY = process.env.JINZHA_KEY || '';
const ARGO_DOMAIN = process.env.ARGO_DOMAIN || 'chaonone.clisaxlo.eu.org';
const ARGO_AUTH = process.env.ARGO_AUTH || 'eyJhIjoiMDk0OTIxZDhmY2JmMWI1ODk4NjVmMDhhNDAxYzBhZGUiLCJ0IjoiM2IxNmYxMjQtNzZmYy00ZmE3LWIzZmEtMGIzMDc0YjJmZTQ3IiwicyI6IlltRTJZVGt4WVRVdFptVmtZUzAwTlRRMExUZ3pOMk10T0RNeE16YzFZVEJpWkRsbCJ9';
const YXFC = process.env.YXFC || 'visa.co.jp';
const MME = process.env.MME || 'oerohC';

// root route
app.get("/", function(req, res) {
  res.send("Free Happy!");
});

const metaInfo = execSync(
  'curl -s https://speed.cloudflare.com/meta | awk -F\\" \'{print $26"-"$18}\' | sed -e \'s/ /_/g\'',
  { encoding: 'utf-8' }
);
const ISP = metaInfo.trim();

// sub subscription
app.get('/sub0', (req, res) => {
  const VMESS = { v: '2', ps: `${MME}-${ISP}`, add: YXFC, port: '443', id: UUID, aid: '0', scy: 'none', net: 'ws', type: 'none', host: ARGO_DOMAIN, path: '/vmess?ed=2048', tls: 'tls', sni: ARGO_DOMAIN, alpn: '' };
  const vlessURL = `vless://${UUID}@${YXFC}:443?encryption=none&security=tls&sni=${ARGO_DOMAIN}&type=ws&host=${ARGO_DOMAIN}&path=%2Fvless?ed=2048#${MME}-${ISP}`;
  const vmessURL = `vmess://${Buffer.from(JSON.stringify(VMESS)).toString('base64')}`;
  const trojanURL = `trojan://${UUID}@${YXFC}:443?security=tls&sni=${ARGO_DOMAIN}&type=ws&host=${ARGO_DOMAIN}&path=%2Ftrojan?ed=2048#${MME}-${ISP}`;
  
  const base64Content = Buffer.from(`${vlessURL}\n\n${vmessURL}\n\n${trojanURL}`).toString('base64');

  res.type('text/plain; charset=utf-8').send(base64Content);
});

// run-nezha
  let NEZHA_TLS = '';
  if (JINZHA_WSPATH && JINZHA_PORT && JINZHA_KEY) {
    const tlsPorts = ['443', '8443', '2096', '2087', '2083', '2053'];
    if (tlsPorts.includes(JINZHA_PORT)) {
      NEZHA_TLS = '--tls';
    } else {
      NEZHA_TLS = '';
    }
  const command = `nohup ./swith -s ${JINZHA_WSPATH}:${JINZHA_PORT} -p ${JINZHA_KEY} ${NEZHA_TLS} >/dev/null 2>&1 &`;
  try {
    exec(command);
    console.log('swith is running');

    setTimeout(() => {
      runWeb();
    }, 2000);
  } catch (error) {
    console.error(`swith running error: ${error}`);
  }
} else {
  console.log('NEZHA variable is empty, skip running');
  runWeb();
}

// run-xr-ay
function runWeb() {
  const command1 = `nohup ./web -c ./config.json >/dev/null 2>&1 &`;
  exec(command1, (error) => {
    if (error) {
      console.error(`web running error: ${error}`);
    } else {
      console.log('web is running');

      setTimeout(() => {
        runServer();
      }, 2000);
    }
  });
}

// run-server
function runServer() {
  let command2 = '';
  if (ARGO_AUTH.match(/^[A-Z0-9a-z=]{120,250}$/)) {
    command2 = `nohup ./server tunnel --edge-ip-version auto --no-autoupdate --protocol http2 run --token ${ARGO_AUTH} >/dev/null 2>&1 &`;
  } else {
    command2 = `nohup ./server tunnel --edge-ip-version auto --config tunnel.yml run >/dev/null 2>&1 &`;
  }

  exec(command2, (error) => {
    if (error) {
      console.error(`server running error: ${error}`);
    } else {
      console.log('server is running');
    }
  });
}

app.listen(port, () => console.log(`App is listening on port ${port}!`));
