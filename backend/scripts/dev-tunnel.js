const localtunnel = require('localtunnel');
const { spawn } = require('child_process');
const dotenv = require('dotenv');

// Load existing .env
dotenv.config();

(async () => {
    const port = 3000;
    const subdomain = 'busticket-app-dev'; // Try to reserve this subdomain

    console.log('🚀 Starting Tunnel...');
    try {
        const tunnel = await localtunnel({ port, subdomain });

        // If subdomain is taken, localtunnel gives a random one.
        // We log it so the user knows.
        const callbackUrl = `${tunnel.url}/api/zalopay/callback`;

        console.log(`✅ Tunnel Active: ${tunnel.url}`);
        console.log(`📌 Callback URL: ${callbackUrl}`);

        if (tunnel.url.includes(subdomain)) {
            console.log('✨ Fixed Subdomain Success!');
        } else {
            console.log('⚠️  Requested subdomain taken, using random URL.');
        }

        console.log('🚀 Starting NestJS Backend...');

        // Spawn NestJS with the new Env Var
        const child = spawn('nest', ['start', '--watch'], {
            stdio: 'inherit',
            shell: true,
            env: {
                ...process.env,
                ZALO_CALLBACK_URL: callbackUrl, // OVERRIDE the one in .env
            },
        });

        tunnel.on('close', () => {
            console.log('Tunnel closed');
        });

        child.on('close', (code) => {
            console.log(`Backend exited with code ${code}`);
            tunnel.close();
            process.exit(code);
        });

    } catch (err) {
        console.error('❌ Tunnel Failed:', err);
    }
})();
