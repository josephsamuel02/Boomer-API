import {
  IsString,
  IsInt,
  IsOptional,
  IsArray,
  IsNotEmpty,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

interface Review {
  user_id: string;
  profile_image: string;
  user_name: string;
  rating: number;
}

export class ReviewsDto {
  @ApiProperty({
    description: "Unique identifier for the user",
    example: "user_12345",
  })
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({
    description: "Profile image URL of the user",
  })
  @IsString()
  @IsNotEmpty()
  profile_image?: string;

  @ApiProperty({
    description: "Name of the user",
    example: "John Doe",
  })
  @IsString()
  @IsNotEmpty()
  user_name: string;

  @ApiProperty({
    description: "Rating given by the user",
    example: 4,
  })
  @IsInt()
  @IsNotEmpty()
  rating: number;

  @ApiProperty({
    description: "Unique identifier for the movie",
    example: "movie_12345",
  })
  @IsString()
  @IsNotEmpty()
  movie_id: string;

  @ApiProperty({
    description: "List of ratings given by users",
  })
  @IsArray()
  ratings: Review[];

  @ApiProperty({
    description: "Comment provided by the user",
    example: "Great movie!",
  })
  @IsString()
  @IsOptional()
  comment?: string;
}
