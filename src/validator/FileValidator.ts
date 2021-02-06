import fs from 'fs';
import { File } from 'formidable';
import fileSize from 'filesize';
import { Validator, ValidatorOptions } from './Validator';
import { createHash } from 'crypto';

interface FileNoHash {
  size: number;
  path: string;
  name: string;
  /**
   * mime type like: image/jpeg
   */
  type: string;
  mtime: Date;
}

interface FileWithHash extends FileNoHash {
  hash: string;
}

interface FileOptions<Type, IsRequired extends boolean> extends ValidatorOptions<Type, IsRequired> {
  hash?: 'md5' | 'sha1';
  multiples?: boolean;
  maxSize?: number;
  mimeTypes?: string[];
}

export class FileValidator<Type = FileNoHash, T extends boolean = true> extends Validator<FileOptions<Type, T>> {
  public optional(): FileValidator<Type, false> {
    return super.optional();
  }

  public hash(crypto: 'md5' | 'sha1'): FileValidator<Type extends Array<any> ? FileWithHash[] : FileWithHash, T> {
    this.config.hash = crypto;
    // @ts-expect-error
    return this;
  }

  public multiples(): FileValidator<Type[], T> {
    this.config.multiples = true;
    // @ts-expect-error
    return this;
  }

  public maxSize(byte: number): this {
    this.config.maxSize = byte;
    return this;
  }

  public allowMimeTypes(types: string[]): this {
    this.config.mimeTypes = types;
    return this;
  }

  protected validateValue(obj: Record<string, any>, key: string, superKeys: string[]): string | void {
    const { hash, multiples, maxSize, mimeTypes } = this.config;
    let value: File[] = obj[key];

    obj[key] = value = Array.isArray(value) ? value : [value];

    if (!multiples) {
      if (value.length === 0) {
        return `${this.getLabel(key, superKeys)} is required`;
      }

      value.splice(1);
    }

    for (let i = 0, len = value.length; i < len; ++i) {
      const item = value[i];

      if (!(item instanceof File)) {
        const label = this.getLabel(i.toString(), superKeys.concat(key));
        return `${label} must be file`;
      }

      if (maxSize !== undefined && item.size > maxSize) {
        const label = this.getLabel(i.toString(), superKeys.concat(key));
        return `${label} size large than ${fileSize(maxSize, { spacer: '' })}`;
      }

      if (mimeTypes && !mimeTypes.includes(item.type)) {
        const label = this.getLabel(i.toString(), superKeys.concat(key));
        return `${label} doesn\'t match given mime types`;
      }

      if (hash) {
        item.hash = createHash(hash)
          .update(fs.readFileSync(item.path))
          .digest('hex');
      }
    }

    if (!multiples) {
      obj[key] = value[0];
    }
  }
}
