const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const MESSAGE_ATTACHMENT_MIME_TYPES = new Set([
  ...IMAGE_MIME_TYPES,
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
]);

function unsupportedFileType(mimetype: string) {
  return Object.assign(new Error(`Unsupported file type: ${mimetype}`), { status: 415 });
}

function hasPrefix(buffer: Buffer, bytes: number[]) {
  return bytes.every((byte, index) => buffer[index] === byte);
}

function looksLikeText(buffer: Buffer) {
  return !buffer.includes(0);
}

function hasValidSignature(file: Express.Multer.File): boolean {
  switch (file.mimetype) {
    case 'image/jpeg':
      return hasPrefix(file.buffer, [0xff, 0xd8, 0xff]);
    case 'image/png':
      return hasPrefix(file.buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case 'image/webp':
      return file.buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
        file.buffer.subarray(8, 12).toString('ascii') === 'WEBP';
    case 'application/pdf':
      return file.buffer.subarray(0, 5).toString('ascii') === '%PDF-';
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return hasPrefix(file.buffer, [0x50, 0x4b, 0x03, 0x04]);
    case 'application/msword':
    case 'application/vnd.ms-excel':
      return hasPrefix(file.buffer, [0xd0, 0xcf, 0x11, 0xe0]);
    case 'text/plain':
    case 'text/csv':
      return looksLikeText(file.buffer);
    default:
      return false;
  }
}

function assertUploadSignature(file: Express.Multer.File): void {
  if (!hasValidSignature(file)) {
    throw unsupportedFileType(file.mimetype);
  }
}

export function assertProductImageUpload(file: Express.Multer.File): void {
  if (!IMAGE_MIME_TYPES.has(file.mimetype)) {
    throw unsupportedFileType(file.mimetype);
  }
  assertUploadSignature(file);
}

export function assertMessageAttachmentUpload(file: Express.Multer.File): void {
  if (!MESSAGE_ATTACHMENT_MIME_TYPES.has(file.mimetype)) {
    throw unsupportedFileType(file.mimetype);
  }
  assertUploadSignature(file);
}
