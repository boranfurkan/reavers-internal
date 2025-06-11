import { config } from '../config';

interface AssignUserRequest {
  genesisShipId: string;
  assignedUserId: string;
  action: boolean;
}

interface CaptainLicenseRequest {
  genesisShipId: string;
  license: 1 | 2 | 3;
}

interface SendToMissionRequest {
  genesisShipId: string;
}

interface SendToMissionAllRequest {
  genesisShipIds: string[];
}

export interface ClaimRewardsRequest {
  genesisShipId: string;
}

export class GenesisService {
  private static async makeRequest<T>(
    endpoint: string,
    method: string,
    body: any,
    token: string,
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (method !== 'GET' && method !== 'HEAD' && body !== null) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(
      `${config.worker_server_url}${endpoint}`,
      options,
    );

    if (!response.ok) {
      throw new Error('API request failed');
    }

    return response.json();
  }

  static async assignUser(
    request: AssignUserRequest,
    token: string,
  ): Promise<{ jobId: string }> {
    return this.makeRequest<{ jobId: string }>(
      '/genesis/assign-user',
      'POST',
      request,
      token,
    );
  }

  static async claimRewards(token: string): Promise<{ jobId: string }> {
    return this.makeRequest<{ jobId: string }>(
      '/genesis/claim-all',
      'GET',
      null,
      token,
    );
  }

  static async captainLicense(
    request: CaptainLicenseRequest,
    token: string,
  ): Promise<{ jobId: string }> {
    return this.makeRequest<{ jobId: string }>(
      '/genesis/captain-license',
      'POST',
      request,
      token,
    );
  }

  static async sendToMission(
    request: SendToMissionRequest,
    token: string,
  ): Promise<{ jobId: string }> {
    return this.makeRequest<{ jobId: string }>(
      '/genesis/send-to-mission',
      'POST',
      request,
      token,
    );
  }

  static async claimSingleRewards(
    request: ClaimRewardsRequest,
    token: string,
  ): Promise<{ jobId: string }> {
    return this.makeRequest<{ jobId: string }>(
      '/genesis/claim-reward',
      'POST',
      request,
      token,
    );
  }

  static async sendToMissionAll(
    request: SendToMissionAllRequest,
    token: string,
  ): Promise<{ jobIds: string[] }> {
    return this.makeRequest<{ jobIds: string[] }>(
      '/genesis/send-to-mission-all',
      'POST',
      request,
      token,
    );
  }
}
