import type { NextApiHandler, NextApiRequest } from "next";

import type { Image } from "@prisma/client";
import { authOptions } from "~/server/auth";
import cloudinary from "~/utils/cloudinary";
import formidable from "formidable";
import { getServerSession } from "next-auth";
import path from "path";
import { prisma } from "~/server/db";

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler: NextApiHandler = async (req, res) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401).json({ error: "unauthorized" });
  } else {
    const userId = session.user.id;

    const data = await readUploadedFile(req, false);
    const ownerId = data.fields["ownerId"] as string;

    if (!!!ownerId) res.status(400).json({ error: "ownerId is missing" });

    const imageIds: string[] = [];
    const imagePublicIds: string[] = [];
    const cloudUrls: string[] = [];

    const files = data.files["images"];

    if (!files) {
      res.status(400).json({ error: "no files attachted" });
    } else {
      if (!Array.isArray(files)) {
        // Handle the case where a single file is uploaded
        const file = files;
        const result = await handleFileUpload(file, ownerId);
        imageIds.push(result.id);
        imagePublicIds.push(result.publicId);
        cloudUrls.push(result.cloudUrl);
      } else {
        // await Promise.all(files.map(handleFileUpload));
        // We have to collect all results
        await Promise.all(
          files.map(async (file) => {
            const result = await handleFileUpload(file, ownerId);
            imageIds.push(result.id);
            imagePublicIds.push(result.publicId);
            cloudUrls.push(result.cloudUrl);
          })
        );
      }
      const response = {
        success: true,
        imageIds,
        imagePublicIds,
        cloudUrls,
      };

      res.json(response);
    }
  }
};

const handleFileUpload = async (
  file: formidable.File,
  ownerId: string
): Promise<Image> => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  const formattedTimestamp = `${year}${month.toString().padStart(2, "0")}${day
    .toString()
    .padStart(2, "0")}${hours.toString().padStart(2, "0")}${minutes
    .toString()
    .padStart(2, "0")}${seconds.toString().padStart(2, "0")}`;

  const publicIdWithTimestamp = `${formattedTimestamp}_${
    file.originalFilename?.split(".")[0] as string
  }`;

  const result = await cloudinary.uploader.upload(file.filepath, {
    public_id: publicIdWithTimestamp,
    quality: "auto",
    fetch_format: "auto",
    flags: "lossy",
    invalidate: true,
  });

  console.log(`✅ Successfully uploaded ${file.filepath}`);
  console.log(`Public ID: ${result.public_id}`);
  console.log(`URL: ${result.secure_url}`);
  console.log("cloudinaryResult", result);
  console.debug("ownerId", ownerId);
  const image = await prisma.image.create({
    data: {
      ownerId: ownerId, //FIXME: owner has to be set!
      // reportId: reportId,
      cloudUrl: result.secure_url,
      publicId: result.public_id,
    },
  });
  console.log("prisma.image", image);

  return image;
};

const readUploadedFile = (
  req: NextApiRequest,
  saveLocally?: boolean
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  const options: formidable.Options = {
    multiples: true, // Enable parsing of multiple files with the same field name
  };

  if (saveLocally) {
    options.uploadDir = path.join(process.cwd(), "/public/images");
    options.keepExtensions = true; // Keep the file extensions for multiple files
  }

  options.maxFileSize = 4000 * 1024 * 1024;
  const form = formidable(options);

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });
};

export default handler;
