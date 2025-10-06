import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { BusService } from '../services/bus.service';
import { CreateBusDto, UpdateBusDto } from '../dtos/bus.dto';

@Controller('bus')
export class BusController {
  constructor(private readonly busService: BusService) {}

  @Get()
  getAll() {
    return this.busService.findAll();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.busService.findOne(Number(id));
  }

  @Post()
  create(@Body() dto: CreateBusDto) {
    return this.busService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBusDto) {
    return this.busService.update(Number(id), dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.busService.delete(Number(id));
  }
}
