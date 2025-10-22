import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { RouteService } from '../services/route.service';

@Controller('routes')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Get()
  async findAll() {
    return this.routeService.getAllRoutes();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.routeService.getRouteById(id);
  }

  @Post()
  async create(@Body() body: any) {
    return this.routeService.createRoute(body);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.routeService.updateRoute(id, body);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.routeService.deleteRoute(id);
  }
}
