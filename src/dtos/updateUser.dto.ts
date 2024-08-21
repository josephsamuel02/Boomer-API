import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsBoolean,
  IsArray,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: "Unique identifier for the user (MongoDB ObjectId)",
    example: "60d21b4667d0d8992e610c85",
  })
  @IsString()
  @IsNotEmpty()
  id?: string;

  @ApiProperty({
    description: "Unique user ID",
    example: "user_12345",
  })
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @ApiPropertyOptional({
    description: "Name of the user",
    example: "John Doe",
  })
  @IsString()
  @IsOptional()
  user_name?: string;

  @ApiPropertyOptional({
    description: "Email address of the user",
    example: "johndoe@example.com",
  })
  @IsEmail()
  email?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({
    description: "Profile image URL",
  })
  @IsString()
  @IsOptional()
  profile_img?: string;

  @ApiPropertyOptional({
    description: "Bio of the user",
  })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({
    description: "Country of the user",
    example: "USA",
  })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({
    description: "Language preference of the user",
    example: "English",
  })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiPropertyOptional({
    description: "Interests of the user",
    example: ["coding", "music", "travel"],
  })
  @IsArray()
  @IsString({ each: true })
  interests: string[];

  @ApiPropertyOptional({
    description: "Whether the user is active",
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: "Whether the user is suspended",
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  suspended?: boolean;
}
