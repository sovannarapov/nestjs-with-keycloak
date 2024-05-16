import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator';

@ApiTags('Category')
@ApiSecurity('access-token')
@UseGuards(JwtAuthGuard)
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @Auth({ resource: 'category', scope: 'create' })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @Auth({ resource: 'category', scope: 'reads' })
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  @Auth({ resource: 'category', scope: 'read' })
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(+id);
  }

  @Patch(':id')
  @Auth({ resource: 'category', scope: 'update' })
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  @Auth({ resource: 'category', scope: 'delete' })
  remove(@Param('id') id: string) {
    return this.categoryService.remove(+id);
  }
}
