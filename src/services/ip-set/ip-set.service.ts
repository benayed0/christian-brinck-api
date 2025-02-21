// src/ipset/ipset.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  WAFV2Client,
  GetIPSetCommand,
  UpdateIPSetCommand,
} from '@aws-sdk/client-wafv2';
import { ConfigService } from '@nestjs/config';
import { Ip } from 'src/schemas/ip.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class IpSetService {
  constructor(
    private config: ConfigService,
    @InjectModel(Ip.name) private Ip: Model<Ip>,
  ) {
    // Ip.create({ ip: '185.45.22.46/32', name: 'Christian' });
  }
  // Initialize the WAFv2 client. For CloudFront, you need to use a region like 'us-east-1'
  private readonly wafv2 = new WAFV2Client({
    region: this.config.get('CB_WAF_REGION'),
  });

  // Set your IP set configuration (update these with your actual values)
  private readonly ipSetId = '026ad83a-1aa4-4acd-bc89-eb5acfe6517e';
  private readonly ipSetName = 'CbAllowedIps';
  private readonly scope: 'CLOUDFRONT' | 'REGIONAL' = 'CLOUDFRONT';

  /**
   * Retrieves the registered IP addresses from the IP set.
   * @returns An array of IP addresses (or CIDR ranges) registered in the IP set.
   */
  async getRegisteredIps(): Promise<Ip[]> {
    try {
      const { Addresses } = await this.getIps();
      const ips = await this.Ip.find({
        ip: { $in: Addresses },
      });
      return ips.map(({ ip, name }) => ({ ip: ip.split('/')[0], name }));
    } catch (error) {
      console.error('Error retrieving IP set:', error);
      throw new InternalServerErrorException(
        'Failed to retrieve IP set' + error,
      );
    }
  }
  /**
   * Updates the IP set with a new list of addresses.
   * @param newAddresses Array of IP addresses or CIDR ranges (e.g., ["203.0.113.0/24"])
   */
  async addIpSet(ip: Ip): Promise<{ success: boolean; message: string }> {
    try {
      const { Addresses, lockToken } = await this.getIps();
      if (Addresses.includes(`${ip.ip}/32`)) {
        return { success: false, message: 'ip already exists' };
      } else {
        await this.updateIpSet([`${ip.ip}/32`, ...Addresses], lockToken);
        await this.Ip.create({ name: ip.name, ip: `${ip.ip}/32` });
        return { success: true, message: 'Ip Added !' };
      }
    } catch (error) {
      console.error('Error updating IP set:', error);
      throw new InternalServerErrorException('Failed to update IP set');
    }
  }

  /**
   * Updates the IP set with a new list of addresses.
   * @param newAddresses Array of IP addresses or CIDR ranges (e.g., ["203.0.113.0/24"])
   */
  async updateIp(
    oldIp: string,
    newIp: Ip,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const { Addresses, lockToken } = await this.getIps();
      const updatedIps = Addresses.filter((ips) => ips !== oldIp);
      await this.updateIpSet([`${newIp.ip}/32`, ...updatedIps], lockToken);
      await this.Ip.findOneAndUpdate(
        { ip: oldIp },
        { ip: `${newIp.ip}/32`, name: newIp.name },
      );
      return { success: true, message: 'Ip Added !' };
    } catch (error) {
      console.error('Error updating IP set:', error);
      throw new InternalServerErrorException('Failed to update IP set');
    }
  }

  /**
   * Updates the IP set with a new list of addresses.
   * @param newAddresses Array of IP addresses or CIDR ranges (e.g., ["203.0.113.0/24"])
   */
  async deleteIpSet(
    ip: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const { Addresses, lockToken } = await this.getIps();
      if (!Addresses.includes(ip)) {
        return { success: false, message: 'ip does not exists' };
      } else {
        await this.updateIpSet(
          Addresses.filter((ips) => ips !== ip),
          lockToken,
        );
        await this.Ip.deleteOne({ ip });
        return { success: true, message: 'Ip deleted !' };
      }
    } catch (error) {
      console.error('Error updating IP set:', error);
      throw new InternalServerErrorException('Failed to update IP set');
    }
  }

  //WAF functions
  async updateIpSet(ips: string[], lockToken: string) {
    const updateCommand = new UpdateIPSetCommand({
      Id: this.ipSetId,
      Name: this.ipSetName,
      Scope: this.scope,
      Addresses: ips,
      LockToken: lockToken,
    });
    // Update the IP set with the new addresses
    await this.wafv2.send(updateCommand);
  }
  async getIps() {
    // Create the command to get the IP set
    const command = new GetIPSetCommand({
      Id: this.ipSetId,
      Name: this.ipSetName,
      Scope: this.scope,
    });

    // Send the command to AWS
    const response = await this.wafv2.send(command);

    // The response should contain the IP addresses in the Addresses property
    const Addresses: string[] = response.IPSet.Addresses || [];
    const lockToken = response.LockToken;
    if (!lockToken) {
      throw new Error('Unable to retrieve LockToken from the IP set');
    }
    return { Addresses, lockToken };
  }
}
