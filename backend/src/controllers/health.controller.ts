import { Request, Response } from 'express';
import { HealthService } from '../services/health.service';
import { ApiResponse, HealthStatus } from '../types';

export class HealthController {
  public static getHealth(_req: Request, res: Response<ApiResponse<HealthStatus>>) {
    const health = HealthService.getHealth();

    return res.status(200).json({
      success: true,
      message: 'MediVault AI Backend Service Operational',
      data: health,
      meta: {
        timestamp: health.timestamp,
        version: health.version,
      },
    });
  }
}
