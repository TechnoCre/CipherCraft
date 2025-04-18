import CryptoJS from 'crypto-js';

interface AdvancedOptions {
  keySize?: number;
  mode?: string;
  iv?: string;
}

/**
 * Encrypt text using the specified algorithm and settings
 * @param text Text to encrypt
 * @param key Encryption key
 * @param algorithm Encryption algorithm ('aes', 'des', 'triple-des', 'rc4')
 * @param options Advanced options (keySize, mode, iv)
 * @returns Encrypted string (Base64 encoded)
 */
export function encrypt(
  text: string, 
  key: string, 
  algorithm: string = 'aes',
  options?: AdvancedOptions
): string {
  if (!text) throw new Error('No text provided for encryption');
  if (!key) throw new Error('No key provided for encryption');

  // Default config
  const config: CryptoJS.CipherOption = {};
  
  // Handle advanced options
  if (options) {
    if (options.keySize) {
      config.keySize = options.keySize / 32; // keySize in words (32 bits)
    }
    
    if (options.mode) {
      switch (options.mode) {
        case 'CBC':
          config.mode = CryptoJS.mode.CBC;
          break;
        case 'ECB':
          config.mode = CryptoJS.mode.ECB;
          break;
        case 'CFB':
          config.mode = CryptoJS.mode.CFB;
          break;
        case 'OFB':
          config.mode = CryptoJS.mode.OFB;
          break;
        default:
          config.mode = CryptoJS.mode.CBC;
      }
    }

    if (options.iv) {
      config.iv = CryptoJS.enc.Utf8.parse(options.iv);
    }
  }

  // Use padding if using a block cipher
  if (algorithm !== 'rc4') {
    config.padding = CryptoJS.pad.Pkcs7;
  }

  try {
    switch (algorithm) {
      case 'aes':
        return CryptoJS.AES.encrypt(text, key, config).toString();
      case 'des':
        return CryptoJS.DES.encrypt(text, key, config).toString();
      case 'triple-des':
        return CryptoJS.TripleDES.encrypt(text, key, config).toString();
      case 'rc4':
        return CryptoJS.RC4.encrypt(text, key, config).toString();
      default:
        throw new Error(`Unsupported encryption algorithm: ${algorithm}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
    throw new Error('Encryption failed with an unknown error');
  }
}

/**
 * Decrypt text using the specified algorithm and settings
 * @param encryptedText Text to decrypt (Base64 encoded)
 * @param key Decryption key
 * @param algorithm Decryption algorithm ('aes', 'des', 'triple-des', 'rc4')
 * @param options Advanced options (keySize, mode, iv)
 * @returns Decrypted string
 */
export function decrypt(
  encryptedText: string, 
  key: string, 
  algorithm: string = 'aes',
  options?: AdvancedOptions
): string {
  if (!encryptedText) throw new Error('No encrypted text provided for decryption');
  if (!key) throw new Error('No key provided for decryption');

  // Default config
  const config: CryptoJS.CipherOption = {};
  
  // Handle advanced options
  if (options) {
    if (options.keySize) {
      config.keySize = options.keySize / 32; // keySize in words (32 bits)
    }
    
    if (options.mode) {
      switch (options.mode) {
        case 'CBC':
          config.mode = CryptoJS.mode.CBC;
          break;
        case 'ECB':
          config.mode = CryptoJS.mode.ECB;
          break;
        case 'CFB':
          config.mode = CryptoJS.mode.CFB;
          break;
        case 'OFB':
          config.mode = CryptoJS.mode.OFB;
          break;
        default:
          config.mode = CryptoJS.mode.CBC;
      }
    }

    if (options.iv) {
      config.iv = CryptoJS.enc.Utf8.parse(options.iv);
    }
  }

  // Use padding if using a block cipher
  if (algorithm !== 'rc4') {
    config.padding = CryptoJS.pad.Pkcs7;
  }

  try {
    let decrypted;
    switch (algorithm) {
      case 'aes':
        decrypted = CryptoJS.AES.decrypt(encryptedText, key, config);
        break;
      case 'des':
        decrypted = CryptoJS.DES.decrypt(encryptedText, key, config);
        break;
      case 'triple-des':
        decrypted = CryptoJS.TripleDES.decrypt(encryptedText, key, config);
        break;
      case 'rc4':
        decrypted = CryptoJS.RC4.decrypt(encryptedText, key, config);
        break;
      default:
        throw new Error(`Unsupported decryption algorithm: ${algorithm}`);
    }

    // Try to convert to string - if it fails, the key was likely incorrect
    const result = decrypted.toString(CryptoJS.enc.Utf8);
    if (!result) {
      throw new Error('Decryption failed - the key may be incorrect or the ciphertext is invalid');
    }
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
    throw new Error('Decryption failed with an unknown error');
  }
}

/**
 * Generate a random key of specified length
 * @param length Length of the key to generate
 * @returns Random string
 */
export function generateRandomKey(length: number = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let result = '';
  const randomValues = new Uint8Array(length);
  window.crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(randomValues[i] % chars.length);
  }
  
  return result;
}
