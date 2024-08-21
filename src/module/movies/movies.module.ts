import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { PrismaService } from "src/prisma/prisma.service";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { ArtworkController } from "./movies.controller";
import { EncryptionService } from "src/shared";
import { MongoDBService } from "src/mongodb/mongodb.service";
import { MovieService } from "./movies.service";

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({
      defaultStrategy: "jwt",
      property: "user",
      session: false,
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRETE_KEY,
      signOptions: {
        expiresIn: process.env.JWT_EXPR_TIME,
      },
    }),
  ],
  exports: [MovieService],
  controllers: [ArtworkController],
  providers: [MovieService, PrismaService, MongoDBService, EncryptionService],
})
export class MoviesModule {}
