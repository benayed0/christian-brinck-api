import { Injectable } from '@nestjs/common';
import {
  PutObjectCommand,
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
@Injectable()
export class S3Service {
  client = new S3Client({ region: process.env.CB_S3_REGION });
  Bucket = 'cb.storage';
  get_upload_audio_url = async (id: string) => {
    const Key = `audio_files/${id}.mp3`;
    const command = new PutObjectCommand({
      Bucket: this.Bucket,
      Key,
    });
    try {
      // Generate the pre-signed URL for a 5-minute expiration
      const PreSignedUrl = await getSignedUrl(this.client, command, {
        expiresIn: 300,
      });
      return { PreSignedUrl };
    } catch (error) {
      console.error('Error generating pre-signed URL:', error);
      throw error;
    }
  };
  get_upload_scores_url = async (id: string) => {
    const Key = `score_files/${id}.json`;
    const command = new PutObjectCommand({
      Bucket: this.Bucket,
      Key,
    });
    try {
      // Generate the pre-signed URL for a 5-minute expiration
      const PreSignedUrl = await getSignedUrl(this.client, command, {
        expiresIn: 300,
      });
      return { PreSignedUrl };
    } catch (error) {
      console.error('Error generating pre-signed URL:', error);
      throw error;
    }
  };
  get_upload_transcription_url = async (id: string) => {
    const Key = `transcription_files/${id}.json`;
    const command = new PutObjectCommand({
      Bucket: this.Bucket,
      Key,
    });
    try {
      // Generate the pre-signed URL for a 5-minute expiration
      const PreSignedUrl = await getSignedUrl(this.client, command, {
        expiresIn: 30000,
      });
      return PreSignedUrl;
    } catch (error) {
      console.error('Error generating pre-signed URL:', error);
      throw error;
    }
  };
  get_upload_result_url = async (id: string) => {
    const Key = `result_files/${id}.json`;
    const command = new PutObjectCommand({
      Bucket: this.Bucket,
      Key,
    });
    try {
      // Generate the pre-signed URL for a 5-minute expiration
      const PreSignedUrl = await getSignedUrl(this.client, command, {
        expiresIn: 30000,
      });
      return PreSignedUrl;
    } catch (error) {
      console.error('Error generating pre-signed URL:', error);
      throw error;
    }
  };
  get_audios = async () => {
    const command = new ListObjectsCommand({
      Bucket: this.Bucket,
    });
    const videos = (await this.client.send(command)).Contents;

    // Filter and get only .mp3 file names without prefixes or extensions
    const videoIds = videos
      ? videos
          .filter((video) => video.Key.endsWith('.mp3'))
          .map((video) => video.Key.split('/').pop().replace('.mp3', ''))
      : [];
    return videoIds;
  };
  get_scores = async (id: string) => {
    const Key = `score_files/${id}.json`;
    const command = new GetObjectCommand({
      Bucket: this.Bucket,
      Key,
    });
    try {
      // Generate the pre-signed URL for a 5-minute expiration
      const url = await getSignedUrl(this.client, command, {
        expiresIn: 300,
      });
      const response_json = await fetch(url);
      const score = response_json.json();
      return score;
    } catch (error) {
      console.error('Error generating pre-signed URL:', error);
      throw error;
    }
  };
  delete_scores = async (id: string) => {
    const Key = `score_files/${id}.json`;
    const command = new DeleteObjectCommand({
      Bucket: this.Bucket,
      Key,
    });
    try {
      // Generate the pre-signed URL for a 5-minute expiration
      const response = await this.client.send(command);

      return response;
    } catch (error) {
      console.error('Error generating pre-signed URL:', error);
      throw error;
    }
  };
  delete_audio = async (id: string) => {
    const transcriptionKey = `transcription_files/${id}.json`;
    const ResultKey = `result_files/${id}.json`;
    const VideoKey = `audio_files/${id}.mp3`;
    const TranscriptionCommand = new DeleteObjectCommand({
      Bucket: this.Bucket,
      Key: transcriptionKey,
    });
    const ResultCommand = new DeleteObjectCommand({
      Bucket: this.Bucket,
      Key: ResultKey,
    });
    const VideoCommand = new DeleteObjectCommand({
      Bucket: this.Bucket,
      Key: VideoKey,
    });
    try {
      // Generate the pre-signed URL for a 5-minute expiration
      await this.client.send(TranscriptionCommand);
      await this.client.send(ResultCommand);
      const response = await this.client.send(VideoCommand);

      return response;
    } catch (error) {
      console.error('Error generating pre-signed URL:', error);
      throw error;
    }
  };
  get_audio = async (id: string) => {
    const key = `audio_files/${id}.mp3`;

    try {
      // Check if the object exists
      await this.client.send(
        new HeadObjectCommand({ Bucket: 'cb.storage', Key: key }),
      );

      // If it exists, generate a signed URL
      const command = new GetObjectCommand({ Bucket: 'cb.storage', Key: key });
      return await getSignedUrl(this.client, command, { expiresIn: 3600 });
    } catch (error) {
      if (error.name === 'NotFound') {
        return null; // File does not exist
      }
      console.error(error); // Rethrow any unexpected errors
      return null;
    }
  };
  get_transcription = async (id: string) => {
    const key = `transcription_files/${id}.json`;
    const command = new GetObjectCommand({ Bucket: 'cb.storage', Key: key });
    return await getSignedUrl(this.client, command, { expiresIn: 3600 });
  };
  get_result = async (id: string) => {
    const key = `result_files/${id}.json`;
    const command = new GetObjectCommand({ Bucket: 'cb.storage', Key: key });
    return await getSignedUrl(this.client, command, { expiresIn: 3600 });
  };
  get_files = async () => {
    const key = `drive_files/`;
    const command = new ListObjectsV2Command({
      Bucket: 'cb.storage',
      Prefix: key,
    });
    const listResponse = await this.client.send(command);
    const result: {
      id: string;
      name: string;
      createdAt: string;
      size: number;
    }[] = [];
    if (!listResponse.Contents) return [];

    for (const item of listResponse.Contents) {
      const key = item.Key!;
      const size = item.Size!;
      try {
        const headCommand = new HeadObjectCommand({
          Bucket: this.Bucket,
          Key: key,
        });
        const head = await this.client.send(headCommand);

        // Extract folder and filename
        // Example key: drive_files/<id>/<name>
        const pathParts = key.split('/');
        const id = pathParts[1]; // after "drive_files/"
        const name = pathParts.slice(2).join('/'); // supports nested files too

        const createdAt =
          head.Metadata?.createdat || head.LastModified?.toISOString();
        if (name !== '') {
          result.push({ id, name, createdAt, size });
        }
      } catch (err) {
        console.error(`Failed to get metadata for ${key}:`, err);
      }
    }

    return result;
  };
  getFileUploadUrl = async (id: string, name: string) => {
    const key = `drive_files/${id}/${name}`;
    const createdAt = new Date().toISOString(); // Or any custom timestamp format

    const command = new PutObjectCommand({
      Bucket: this.Bucket,
      Key: key,
      Metadata: { createdAt },
    });
    const url = await getSignedUrl(this.client, command, { expiresIn: 3600 });

    return url;
  };
  async deleteFile(id: string) {
    const prefix = `drive_files/${id}/`;

    // Step 1: List objects under the id
    const listCommand = new ListObjectsV2Command({
      Bucket: this.Bucket,
      Prefix: prefix,
    });

    const listResponse = await this.client.send(listCommand);

    if (!listResponse.Contents || listResponse.Contents.length === 0) {
      // console.log(`No files found for id: ${id}`);
      return;
    }

    // Step 2: Delete each object
    for (const item of listResponse.Contents) {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: this.Bucket,
        Key: item.Key!,
      });

      await this.client.send(deleteCommand);
    }
  }
  async getFile(id: string) {
    const prefix = `drive_files/${id}/`;

    // Step 1: List files under this id
    const listCommand = new ListObjectsV2Command({
      Bucket: this.Bucket,
      Prefix: prefix,
    });

    const listResponse = await this.client.send(listCommand);

    if (!listResponse.Contents || listResponse.Contents.length === 0) {
      return undefined; // no files found for this id
    }

    // Step 2: Use the first file (or customize if you expect multiple files)
    const fileKey = listResponse.Contents[0].Key!;
    const fileName = fileKey.split('/').pop()!;
    // Step 3: Generate a signed download URL
    const getCommand = new GetObjectCommand({
      Bucket: this.Bucket,
      Key: fileKey,
      ResponseContentDisposition: `attachment; filename="${fileName}"`,
    });

    const url = await getSignedUrl(this.client, getCommand, {
      expiresIn: 3600,
    });
    return { url, fileName };
  }
  async getBucketSize(): Promise<number> {
    let totalSize = 0;
    let continuationToken: string | undefined = undefined;

    do {
      const command = new ListObjectsV2Command({
        Bucket: this.Bucket,
        Prefix: 'drive_files/',
        ContinuationToken: continuationToken,
      });

      const response = await this.client.send(command);

      if (response.Contents) {
        for (const item of response.Contents) {
          totalSize += item.Size ?? 0;
        }
      }

      continuationToken = response.IsTruncated
        ? response.NextContinuationToken
        : undefined;
    } while (continuationToken);

    return totalSize; // in bytes
  }
}
