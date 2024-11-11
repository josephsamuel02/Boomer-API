import {
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export enum AgeRating {
  R_RATED = "r_rated",
  EIGHTEEN = "eighteen",
  TWELVE = "twelve",
  PG13 = "pg13",
}

export class MoviesDto {
  @ApiPropertyOptional({
    description: "Unique movie ID",
    example: "movie_12345",
  })
  @IsString()
  @IsNotEmpty()
  movie_id?: string;

  @ApiPropertyOptional({
    description: "Poster ID",
    example: "poster_12345",
  })
  @IsString()
  @IsOptional()
  poster_id?: string;

  @ApiPropertyOptional({
    description: "profile image",
    example: "https://image",
  })
  @IsString()
  @IsOptional()
  poster_profile_image?: string;

  @ApiPropertyOptional({
    description: "user name",
    example: "username",
  })
  @IsString()
  @IsOptional()
  poster_user_name?: string;

  @ApiPropertyOptional({
    description: "Editor ID",
    example: "editor_12345",
  })
  @IsString()
  @IsOptional()
  editor_id?: string;

  @ApiPropertyOptional({
    description: "Type of Movie  ",
    example: "Seres",
  })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({
    description: "Title of the movie",
    example: "Inception",
  })
  @IsString()
  @IsNotEmpty()
  movie_title: string;

  @ApiPropertyOptional({
    description: "Title of the movie",
    example: "https://youtu.be/1QZamgwEjiw?si=aZWoSL7fiaLWR",
  })
  @IsString()
  @IsNotEmpty()
  movie_trailer: string;

  @ApiPropertyOptional({
    description: "Tags associated with the movie",
    example: ["thriller", "action", "sci-fi"],
  })
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @ApiPropertyOptional({
    description: "Synopsis of the movie",
    example: "A thief who steals corporate secrets...",
  })
  @IsString()
  @IsOptional()
  synopsis?: string;

  @ApiPropertyOptional({
    description: "Genres of the movie",
    example: ["action", "sci-fi"],
  })
  @IsArray()
  @IsString()
  movie_genre?: string[];

  @ApiPropertyOptional({
    description: "Whether the movie is released",
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  released?: boolean;

  @ApiPropertyOptional({
    description: "Release date of the movie",
  })
  @IsDateString()
  @IsOptional()
  release_date?: Date;

  @ApiPropertyOptional({
    description: "Copyright licenses associated with the movie",
  })
  @IsArray()
  @IsString({ each: true })
  copyright_license?: string[];

  @ApiPropertyOptional({
    description: "Company associated with the movie",
    example: "Warner Bros.",
  })
  @IsString()
  @IsOptional()
  company?: string;

  @ApiPropertyOptional({
    description: "Posters of the movie",
    example: [
      "https://example.com/poster1.jpg",
      "https://example.com/poster2.jpg",
    ],
  })
  @IsArray()
  @IsString({ each: true })
  movie_poster_image?: string[];

  @ApiPropertyOptional({
    description: "Download links for the movie",
    example: ["https://example.com/download1", "https://example.com/download2"],
  })
  @IsArray()
  @IsString({ each: true })
  download_links?: string[];

  @ApiPropertyOptional({
    description: "Rating of the movie",
    example: "4.5",
  })
  @IsString()
  @IsOptional()
  reviews?: any;

  @IsNumber()
  @IsOptional()
  rating?: number;

  @ApiPropertyOptional({
    description: "Age rating of the movie",
    example: AgeRating.PG13,
    enum: AgeRating,
  })
  @IsEnum(AgeRating)
  @IsOptional()
  age_rating?: AgeRating;

  @ApiPropertyOptional({
    description: "Industry associated with the movie",
    example: "Hollywood",
  })
  @IsString()
  @IsOptional()
  industry?: string;

  @ApiPropertyOptional({
    description: "Language of the movie",
    example: "English",
  })
  @IsString()
  @IsOptional()
  language?: string;
}
