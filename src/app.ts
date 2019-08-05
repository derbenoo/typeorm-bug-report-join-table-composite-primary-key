import "reflect-metadata";
import { ConnectionOptions, createConnection } from "typeorm";
import { Post } from "./entity/Post";
import { Image } from "./entity/Image";
import { PostImage } from "./entity/PostImage";

const options: ConnectionOptions = {
  name: "postgres",
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "test",
  database: "test",
  synchronize: true,
  logging: ["query", "error"],
  entities: [Post, Image, PostImage]
};

async function main() {
  const connection = await createConnection(options);
  const postRepository = connection.getRepository(Post);
  const postImageRepository = connection.getRepository(PostImage);

  // Create a new image
  const image = new Image();
  image.fileId = 1;
  image.userId = 100;

  // Create and save a post with a related image
  const post = postRepository.create({
    title: "test",
    postImages: [
      {
        description: "test",
        image
      }
    ]
  });
  debugger;

  await postRepository.save(post);

  // Search on the join table
  const postImages = await postImageRepository.find({
    where: {
      image: { fileId: 1, userId: 100 }
    }
  });

  /*
    Incorrect SQL query:

    SELECT
      "PostImage"."description" AS "PostImage_description",
      "PostImage"."imageFileId" AS "PostImage_imageFileId",
      "PostImage"."imageUserId" AS "PostImage_imageUserId",
      "PostImage"."postId" AS "PostImage_postId"
    FROM
      "post_image" "PostImage"
    WHERE
      "PostImage"."imageFileId" = $1
      AND "PostImage"."imageFileId" = $2

    -- PARAMETERS: [1,100]

  */

  // Print found postImages, expect one to be found
  console.log(postImages);
}

main().then(() => process.exit(0));
