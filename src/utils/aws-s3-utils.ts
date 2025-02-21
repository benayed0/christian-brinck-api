import {
  PutObjectCommand,
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const get_upload_audio_url = async (id: string) => {
  const client = new S3Client({ region: process.env.CB_S3_REGION });
  const Bucket = 'cb.storage';
  const Key = `audio_files/${id}.mp3`;
  const command = new PutObjectCommand({
    Bucket,
    Key,
  });
  try {
    // Generate the pre-signed URL for a 5-minute expiration
    const PreSignedUrl = await getSignedUrl(client, command, {
      expiresIn: 300,
    });
    return { PreSignedUrl };
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    throw error;
  }
};
const get_upload_scores_url = async (id: string) => {
  const client = new S3Client({ region: process.env.CB_S3_REGION });
  const Bucket = 'cb.storage';
  const Key = `score_files/${id}.json`;
  const command = new PutObjectCommand({
    Bucket,
    Key,
  });
  try {
    // Generate the pre-signed URL for a 5-minute expiration
    const PreSignedUrl = await getSignedUrl(client, command, {
      expiresIn: 300,
    });
    return { PreSignedUrl };
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    throw error;
  }
};
const get_upload_transcription_url = async (id: string) => {
  const client = new S3Client({ region: process.env.CB_S3_REGION });
  const Bucket = 'cb.storage';
  const Key = `transcription_files/${id}.json`;
  const command = new PutObjectCommand({
    Bucket,
    Key,
  });
  try {
    // Generate the pre-signed URL for a 5-minute expiration
    const PreSignedUrl = await getSignedUrl(client, command, {
      expiresIn: 30000,
    });
    return PreSignedUrl;
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    throw error;
  }
};
const get_upload_result_url = async (id: string) => {
  const client = new S3Client({ region: process.env.CB_S3_REGION });
  const Bucket = 'cb.storage';
  const Key = `result_files/${id}.json`;
  const command = new PutObjectCommand({
    Bucket,
    Key,
  });
  try {
    // Generate the pre-signed URL for a 5-minute expiration
    const PreSignedUrl = await getSignedUrl(client, command, {
      expiresIn: 30000,
    });
    return PreSignedUrl;
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    throw error;
  }
};
const get_audios = async () => {
  const client = new S3Client({ region: process.env.CB_S3_REGION });
  const Bucket = 'cb.storage';
  const command = new ListObjectsCommand({
    Bucket,
  });
  const videos = (await client.send(command)).Contents;

  // Filter and get only .mp3 file names without prefixes or extensions
  const videoIds = videos
    ? videos
        .filter((video) => video.Key.endsWith('.mp3'))
        .map((video) => video.Key.split('/').pop().replace('.mp3', ''))
    : [];
  return videoIds;
};
const get_scores = async (id: string) => {
  const client = new S3Client({ region: process.env.CB_S3_REGION });
  const Bucket = 'cb.storage';
  const Key = `score_files/${id}.json`;
  const command = new GetObjectCommand({
    Bucket,
    Key,
  });
  try {
    // Generate the pre-signed URL for a 5-minute expiration
    const url = await getSignedUrl(client, command, {
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
const delete_scores = async (id: string) => {
  const client = new S3Client({ region: process.env.CB_S3_REGION });
  const Bucket = 'cb.storage';
  const Key = `score_files/${id}.json`;
  const command = new DeleteObjectCommand({
    Bucket,
    Key,
  });
  try {
    // Generate the pre-signed URL for a 5-minute expiration
    const response = await client.send(command);
    console.log(response);

    return response;
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    throw error;
  }
};
const delete_audio = async (id: string) => {
  const client = new S3Client({ region: process.env.CB_S3_REGION });
  const Bucket = 'cb.storage';
  const ScoreKey = `audio_files/${id}.json`;
  const VideoKey = `audio_files/${id}.mp3`;
  const ScoreCommand = new DeleteObjectCommand({
    Bucket,
    Key: ScoreKey,
  });
  const VideoCommand = new DeleteObjectCommand({
    Bucket,
    Key: VideoKey,
  });
  try {
    // Generate the pre-signed URL for a 5-minute expiration
    await client.send(ScoreCommand);
    const response = await client.send(VideoCommand);
    console.log(response);

    return response;
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    throw error;
  }
};
const get_audio = async (id: string) => {
  const key = `audio_files/${id}.mp3`;
  const client = new S3Client({ region: process.env.CB_S3_REGION });

  try {
    // Check if the object exists
    await client.send(
      new HeadObjectCommand({ Bucket: 'cb.storage', Key: key }),
    );

    // If it exists, generate a signed URL
    const command = new GetObjectCommand({ Bucket: 'cb.storage', Key: key });
    return await getSignedUrl(client, command, { expiresIn: 3600 });
  } catch (error) {
    if (error.name === 'NotFound') {
      return null; // File does not exist
    }
    console.log(error); // Rethrow any unexpected errors
    return null;
  }
};
const get_transcription = async (id: string) => {
  const key = `transcription_files/${id}.json`;
  const client = new S3Client({ region: process.env.CB_S3_REGION });
  const command = new GetObjectCommand({ Bucket: 'cb.storage', Key: key });
  return await getSignedUrl(client, command, { expiresIn: 3600 });
};
const get_result = async (id: string) => {
  const key = `result_files/${id}.json`;
  const client = new S3Client({ region: process.env.CB_S3_REGION });
  const command = new GetObjectCommand({ Bucket: 'cb.storage', Key: key });
  return await getSignedUrl(client, command, { expiresIn: 3600 });
};
export const aws_s3_utils = {
  get_upload_audio_url,
  get_upload_scores_url,
  get_upload_transcription_url,
  get_upload_result_url,
  get_audio,
  get_scores,
  delete_scores,
  delete_audio,
  get_audios,
  get_transcription,
  get_result,
};
