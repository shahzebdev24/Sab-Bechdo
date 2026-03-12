/**
 * Media Types
 */

export type MediaResourceType = 'image' | 'video';

export interface UploadedFile {
  url: string;
  secureUrl: string;
  publicId: string;
  resourceType: MediaResourceType;
  format: string;
  width: number;
  height: number;
  duration?: number;
  bytes: number;
}

export interface UploadMediaResponse {
  files: UploadedFile[];
}
