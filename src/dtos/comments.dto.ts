import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  IsNotEmpty,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

interface Replies {
  user_id: string;
  user_name: string;
  comment: string;
}

export class CommentDto {
  @ApiProperty({
    description: "Unique identifier for the user",
    example: "user_12345",
  })
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({
    description: "Text of the comment",
  })
  @IsString()
  @IsOptional()
  movie_id: string;

  @ApiPropertyOptional({
    description: "Text of the comment",
  })
  @IsString()
  @IsOptional()
  comment_id?: string;

  @ApiPropertyOptional({
    description: "user name of the commenter",
  })
  @IsString()
  @IsOptional()
  user_name?: string;

  @ApiPropertyOptional({
    description: "Text of the comment",
  })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiPropertyOptional({
    description: "Video URL associated with the comment",
    example: "https://example.com/video.mp4",
  })
  @IsString()
  @IsOptional()
  video?: string;

  @ApiPropertyOptional({
    description: "URL associated with the comment",
    example: "https://example.com",
  })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiPropertyOptional({
    description: "Image URL associated with the comment",
    example: "https://example.com/image.jpg",
  })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional({
    description: "GIF URL associated with the comment",
    example: "https://example.com/image.gif",
  })
  @IsString()
  @IsOptional()
  gif?: string;

  @ApiPropertyOptional({
    description: "likes for the comment",
  })
  @IsInt()
  @IsOptional()
  likes?: boolean;

  @ApiPropertyOptional({
    description: "dislikes for the comment",
  })
  @IsInt()
  @IsOptional()
  dislikes?: boolean;

  @ApiPropertyOptional({
    description: "List of replies to the comment",
  })
  @IsArray()
  @IsOptional()
  replies: Replies[];
}
