// src/ipset/ipset.controller.ts
import { Body, Controller, Delete, Get, Post, Put, Req } from '@nestjs/common';
import { IpSetService } from '../../services/ip-set/ip-set.service';
import { Ip } from 'src/schemas/ip.schema';
import { RealIP } from 'nestjs-real-ip';

@Controller('ipset')
export class IpSetController {
  constructor(private readonly ipSetService: IpSetService) {}

  /**
   * Endpoint to update the IP set with a new list of addresses.
   * Example request body:
   * {
   *   "addresses": ["203.0.113.0/24", "198.51.100.0/24"]
   * }
   */
  @Get('one')
  async getIp(@RealIP() ip: string): Promise<{ allowed: boolean; ip: string }> {
    if (ip.includes('::1')) {
      return { allowed: true, ip };
    }
    const ips = await this.ipSetService.getRegisteredIps();
    const allowed = ips.find((allips) => allips.ip === ip) !== undefined;
    return { allowed, ip };
  }
  @Get('')
  async getIps(): Promise<{ ips: Ip[] }> {
    const ips = await this.ipSetService.getRegisteredIps();
    return { ips };
  }
  @Post('add')
  async addIpSet(@Body('ip') ip: Ip): Promise<{ message: string }> {
    return await this.ipSetService.addIpSet(ip);
  }
  @Put('update')
  async update(
    @Body('oldIp') oldIp: string,
    @Body('newIp') newIp: Ip,
  ): Promise<{ message: string }> {
    return await this.ipSetService.updateIp(`${oldIp}/32`, newIp);
  }
  @Put('delete')
  async delete(@Body('ip') ip: string): Promise<{ message: string }> {
    return await this.ipSetService.deleteIpSet(`${ip}/32`);
  }
}
