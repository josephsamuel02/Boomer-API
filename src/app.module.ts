import { Module } from "@nestjs/common";
import { AuthModule } from "./module/auth/auth.module";
import { UserModule } from "./module/user/user.module";
import { PrismaModule } from "./prisma/prisma.module";
import { MongoDBModule } from "./mongodb/mongodb.module";
import { MoviesModule } from "./module/movies/movies.module";
import { CommentsModule } from "./module/comments/comments.module";
import { ReviewsModule } from "./module/reviews/reviews.module";

@Module({
  imports: [
    PrismaModule,
    MongoDBModule,
    UserModule,
    AuthModule,
    CommentsModule,
    MoviesModule,
    ReviewsModule,
  ],
})
export class AppModule {}
