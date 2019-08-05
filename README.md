# TypeORM bug report

The bug occurs upon calculating a WHERE clause for a [join table with custom properties](https://typeorm.io/#/many-to-many-relations/many-to-many-relations-with-custom-properties), e.g., the `PostImage` table as seen below:

<br />
<p align="center">
<img src="./docs/er-schema.svg" />
</p>

The following find operation is performed:
``` ts
const postImages = await postImageRepository.find({
  where: {
    image: { fileId: 1, userId: 100 }
  }
});
```

The generated SQL query looks like the following:

``` sql
SELECT
  "PostImage"."description" AS "PostImage_description",
  "PostImage"."imageFileId" AS "PostImage_imageFileId",
  "PostImage"."imageUserId" AS "PostImage_imageUserId",
  "PostImage"."postId" AS "PostImage_postId"
FROM
  "post_image" "PostImage"
WHERE
  "PostImage"."imageFileId" = $1
  AND "PostImage"."imageFileId" = $2 -- PARAMETERS: [1,100]

```

The query builder correctly detects that the `Image` entity has a composite primary key consisting of `fileId` and `userId`. However, while the parameters are correctly chosen (1 and 100), the property paths are incorrect as they are both `"PostImage"."imageFileId"` instead of:

* `"PostImage"."imageFileId"` and
* `"PostImage"."imageUserId"`

## Analysis

The issue seems to be that the `createPropertyPath` function does not return a correct result for a WHERE clause with an entity that has a composite primary key.

Expected result: `["imageFileId", "imageUserId"]`
Actual result: `["image"]`

[EntityMetadata.ts#L706](https://github.com/typeorm/typeorm/blob/5e00e81626c41e0445b46922fb74903e5f790cd5/src/metadata/EntityMetadata.ts#L706)

[QueryBuilder.ts#L747](https://github.com/typeorm/typeorm/blob/master/src/query-builder/QueryBuilder.ts#L747)


## Minimal reproducable example

To run the bug report example provided in this repository, execute the following commands:

``` sh
$ docker-compose up --build -d
$ npm run start
```

Post entity:
``` ts
import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { PostImage } from "./PostImage";

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @OneToMany(type => PostImage, postImage => postImage.post, {
    cascade: true
  })
  postImages: PostImage[];
}

```

Image entity:
``` ts
import { Column, Entity, OneToMany } from "typeorm";
import { PostImage } from "./PostImage";

@Entity()
export class Image {
  @Column({
    primary: true
  })
  fileId: number;

  @Column({
    primary: true
  })
  userId: number;

  @OneToMany(type => PostImage, postImage => postImage.image)
  postImages: PostImage[];
}

```

PostImage entity:
``` ts
import { Entity, ManyToOne, Column } from "typeorm";
import { Image } from "./Image";
import { Post } from "./Post";

@Entity()
export class PostImage {
  @ManyToOne(type => Image, image => image.postImages, {
    primary: true,
    cascade: true
  })
  image: Image;

  @ManyToOne(type => Post, post => post.postImages, { primary: true })
  post: Post;

  @Column()
  description: string;
}

```
