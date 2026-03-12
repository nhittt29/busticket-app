import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { Role } from './src/entities/Role.entity';

dotenv.config();

const dataSource = new DataSource({
    type: 'oracle',
    host: process.env.ORACLE_HOST || 'localhost',
    port: parseInt(process.env.ORACLE_PORT || '1521'),
    username: process.env.ORACLE_USERNAME || 'busdb',
    password: process.env.ORACLE_PASSWORD || 'test123@@',
    serviceName: process.env.ORACLE_SERVICE_NAME || 'FREEPDB1',
    entities: [path.join(__dirname, 'src/entities/*.entity.ts')],
    synchronize: false,
});

async function main() {
    await dataSource.initialize();
    const roleRepo = dataSource.getRepository(Role);
    const roles = await roleRepo.find();
    console.log("ROLES IN DB:", JSON.stringify(roles, null, 2));

    await dataSource.destroy();
}

main().catch(console.error);
