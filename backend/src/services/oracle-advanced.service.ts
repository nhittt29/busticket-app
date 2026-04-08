import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as oracledb from 'oracledb';

@Injectable()
export class OracleAdvancedService {
  private readonly logger = new Logger(OracleAdvancedService.name);

  constructor(private readonly dataSource: DataSource) {}

  // 1. View: V_TICKET_DETAILS
  async getTicketDetailsView() {
    try {
      const result = await this.dataSource.query('SELECT * FROM V_TICKET_DETAILS');
      return result;
    } catch (error) {
      this.logger.error('Error fetching V_TICKET_DETAILS', error);
      throw error;
    }
  }

  // 2. Function: F_REVENUE_BY_USER
  async getRevenueByUser(userId: number) {
    try {
      const result = await this.dataSource.query(
        'SELECT F_REVENUE_BY_USER(:1) AS "total" FROM DUAL',
        [userId]
      );
      return result[0]?.total || 0;
    } catch (error) {
      this.logger.error('Error fetching F_REVENUE_BY_USER', error);
      throw error;
    }
  }

  // 3. Procedure: P_TICKETS_BY_DATE
  async getTicketsByDate(dateStr: string) {
      const options = this.dataSource.options as any;
      let connection;
      try {
        const connectString = `${options.host}:${options.port}/${options.serviceName || options.sid}`;
        connection = await oracledb.getConnection({
          user: options.username,
          password: options.password,
          connectString: connectString
        });

        const result = await connection.execute(
            `BEGIN
               P_TICKETS_BY_DATE(:cursor, TO_DATE(:dateStr, 'YYYY-MM-DD'));
             END;`,
             {
                 cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
                 dateStr: dateStr
             }
        );
        
        const resultSet = result.outBinds.cursor as any;
        const rows: any[] = [];
        let row;
        while ((row = await resultSet.getRow())) {
            const obj: any = {};
            resultSet.metaData.forEach((meta: any, idx: number) => {
                obj[meta.name] = row[idx];
            });
            rows.push(obj);
        }
        await resultSet.close();
        return rows;
      } catch (error) {
         this.logger.error('Error fetching Procedure P_TICKETS_BY_DATE', error);
         throw error;
      } finally {
         if (connection) {
           try {
             await connection.close();
           } catch (e) {
             this.logger.error(e);
           }
         }
      }
  }

  // 5. Package: PKG_BUSTICKET_UTILS.GET_RECENT_BOOKINGS
  async getRecentBookings(limit: number, userId: number | null = null) {
      const options = this.dataSource.options as any;
      let connection;
      try {
        const connectString = `${options.host}:${options.port}/${options.serviceName || options.sid}`;
        connection = await oracledb.getConnection({
          user: options.username,
          password: options.password,
          connectString: connectString
        });

        const result = await connection.execute(
            `BEGIN
               PKG_BUSTICKET_UTILS.GET_RECENT_BOOKINGS(:limit, :userId, :cursor);
             END;`,
             {
                 limit: limit,
                 userId: userId,
                 cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
             }
        );
        
        const resultSet = result.outBinds.cursor as any;
        const rows: any[] = [];
        let row;
        while ((row = await resultSet.getRow())) {
            const obj: any = {};
            resultSet.metaData.forEach((meta: any, idx: number) => {
                obj[meta.name] = row[idx];
            });
            rows.push(obj);
        }
        await resultSet.close();
        return rows;
      } catch (error) {
         this.logger.error('Error fetching PKG_BUSTICKET_UTILS.GET_RECENT_BOOKINGS', error);
         throw error;
      } finally {
         if (connection) {
           try {
             await connection.close();
           } catch (e) {
             this.logger.error(e);
           }
         }
      }
  }

  // Bảng Log lấy từ Database (ActionLog)
  async getActionLogs() {
    try {
        const result = await this.dataSource.query('SELECT * FROM "ActionLog" ORDER BY "id" DESC');
        return result;
    } catch (error) {
        this.logger.error('Error fetching ActionLog', error);
        throw error;
    }
  }
}
