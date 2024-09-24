import crypto from 'crypto';

const ENCRYPTION_KEY = 'your-fallback-encryption-key-min-32-chars'; // Use an environment variable in production
const IV_LENGTH = 16; // For AES, this is always 16

export function encrypt(text: string): string {
    console.log(text)
  const iv = crypto.randomBytes(IV_LENGTH);
  // Ensure the key is exactly 32 bytes long
  const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest('base64').substr(0, 32);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  console.log(encrypted)
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string): string {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  // Ensure the key is exactly 32 bytes long
  const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest('base64').substr(0, 32);
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}