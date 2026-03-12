const { spawn } = require('child_process');
const dotenv = require('dotenv');

// Load existing .env
dotenv.config();

(async () => {
    const port = 4000;
    const isWin = process.platform === 'win32';

    // Windows uses NUL, Linux/Mac uses /dev/null
    const nullDevice = isWin ? 'NUL' : '/dev/null';

    console.log('🚀 Starting Smart Tunnel System...');

    // Strategy 1: Attempt localhost.run (Usually fast & stable)
    const success = await tryTunnel('localhost.run', ['-o', 'StrictHostKeyChecking=no', '-o', `UserKnownHostsFile=${nullDevice}`, '-R', '80:localhost:4000', 'nokey@localhost.run']);

    // Strategy 2: If failed, Fallback to serveo.net
    if (!success) {
        console.log('⚠️ Primary tunnel failed. Switching to backup (Serveo)...');
        const successServeo = await tryTunnel('serveo.net', ['-o', 'StrictHostKeyChecking=no', '-o', `UserKnownHostsFile=${nullDevice}`, '-R', '80:localhost:4000', 'serveo.net']);
        
        // Final Fallback: Start backend without tunnel
        if (!successServeo) {
            console.log('⚠️ All tunnels failed. Starting backend offline...');
            startBackend('http://localhost:4000/api/tickets/zalopay/callback', { pid: 0 }); // Mock tunnelProc
        }
    }

    function tryTunnel(name, args) {
        return new Promise((resolve) => {
            console.log(`📡 Connecting to ${name}...`);

            const tunnel = spawn('ssh', args, { shell: true });
            let backendStarted = false;

            // Handle Output
            tunnel.stdout.on('data', (data) => parseOutput(data.toString(), name, tunnel));
            tunnel.stderr.on('data', (data) => parseOutput(data.toString(), name, tunnel));

            tunnel.on('close', (code) => {
                if (!backendStarted) {
                    console.error(`❌ ${name} failed to connect (Code ${code})`);
                    resolve(false); // Tunnel died before Backend started -> Fail
                } else {
                    console.log(`⚠️ ${name} disconnected.`);
                    process.exit(code);
                }
            });

            function parseOutput(output, serverName, tunnelProc) {
                // console.log(`[${serverName} Raw]: ${output}`); // Debug

                // Regex for localhost.run and serveo.net URL patterns
                // localhost.run: "tunneled with tls change: https://xyz.localhost.run"
                // serveo.net: "Forwarding HTTP traffic from https://xyz.serveo.net"
                const match = output.match(/(https?:\/\/[^\s]+(localhost\.run|serveo\.net))/);

                if (match && !backendStarted) {
                    const tunnelUrl = match[1];
                    const callbackUrl = `${tunnelUrl}/api/tickets/zalopay/callback`;

                    console.log(`✅ ${serverName} Active: ${tunnelUrl}`);
                    console.log(`📌 Callback URL: ${callbackUrl}`);

                    backendStarted = true;
                    if (timeoutId) clearTimeout(timeoutId);
                    startBackend(callbackUrl, tunnelProc);
                    resolve(true); // Success
                }
            }

            // Timeout fallback: if tunnel does not establish in 8 seconds, skip it so we don't block
            const timeoutId = setTimeout(() => {
                if (!backendStarted) {
                    console.error(`⌛ ${name} connection timed out. Skipping...`);
                    tunnel.kill(); // this will trigger the 'close' event
                    resolve(false);
                }
            }, 8000);
        });
    }

    function startBackend(callbackUrl, tunnelProc) {
        console.log('🚀 Starting NestJS Backend...');

        const child = spawn('nest', ['start', '--watch'], {
            stdio: 'inherit',
            shell: true,
            env: {
                ...process.env,
                ZALO_CALLBACK_URL: callbackUrl,
            },
        });

        child.on('close', (code) => {
            console.log(`Backend exited with code ${code}`);
            try {
                if (isWin) {
                    spawn('taskkill', ['/pid', tunnelProc.pid, '/f', '/t']);
                } else {
                    tunnelProc.kill();
                }
            } catch (e) { }
            process.exit(code);
        });
    }

})();
