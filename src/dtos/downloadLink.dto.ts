import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class DownloadLinkDto {
  @ApiPropertyOptional({
    description: "Unique  ID",
    example: "12345",
  })
  @IsString()
  @IsNotEmpty()
  id?: string;

  @ApiPropertyOptional({
    description: "Unique movie ID",
    example: "movie_12345",
  })
  @IsString()
  @IsNotEmpty()
  movie_id?: string;

  @ApiPropertyOptional({
    description: "Unique movie ID",
    example: "movie_12345",
  })
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @ApiPropertyOptional({
    description: "Download links for the movie",
    example: "https://example.com/download2",
  })
  @IsArray()
  @IsString({ each: true })
  url?: string;

  @ApiPropertyOptional({
    description: "Is it a good download link or not",
    example: "inc/decr",
  })
  @IsString()
  @IsNotEmpty()
  rating?: string;
}
