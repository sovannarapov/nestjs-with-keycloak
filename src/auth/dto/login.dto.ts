import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'The identity of user',
    example: 'userone@test.com',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @MinLength(6)
  identifier: string;

  @ApiProperty({
    description: 'The password of user',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
